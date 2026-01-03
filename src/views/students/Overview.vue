<template>
  <div class="p-3">
    <AttendanceStatus :stats="stats" />

    <div class="flex items-center justify-between mb-3">
      <h2 class="text-3xl font-bold flex items-center gap-2">
        <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0.5C15.523 0.5 20 4.977 20 10.5C20 16.023 15.523 20.5 10 20.5C4.477 20.5 0 16.023 0 10.5C0 4.977 4.477 0.5 10 0.5ZM10 4.5C9.73478 4.5 9.48043 4.60536 9.29289 4.79289C9.10536 4.98043 9 5.23478 9 5.5V10.5C9.00006 10.7652 9.10545 11.0195 9.293 11.207L12.293 14.207C12.4816 14.3892 12.7342 14.49 12.9964 14.4877C13.2586 14.4854 13.5094 14.3802 13.6948 14.1948C13.8802 14.0094 13.9854 13.7586 13.9877 13.4964C13.99 13.2342 13.8892 12.9816 13.707 12.793L11 10.086V5.5C11 5.23478 10.8946 4.98043 10.7071 4.79289C10.5196 4.60536 10.2652 4.5 10 4.5Z" fill="currentColor"/>
        </svg> Time Table
      </h2>
      
      <div class="relative" v-if="weeks.length > 0">
        <select v-model="selectedWeek" class="appearance-none border rounded-lg px-4 py-2 pr-9 font-semibold bg-white">
          <option v-for="w in weeks" :key="w" :value="w">{{ w }}</option>
        </select>
        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">▾</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading timetable...
    </div>

    <div v-else>
      <h3 class="text-xl font-semibold mb-2 flex items-center gap-2">
        <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="5.5" r="5" fill="#00C746"/>
        </svg>
        Morning Shift
      </h3>
      <TimeTable :days="days" :times="timesMorning" :slot="slot" class="mb-6" />

      <h3 class="text-xl font-semibold mb-2 flex items-center gap-2">
        <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5" cy="5.5" r="5" fill="#00C746"/>
        </svg>
        Afternoon Shift
      </h3>
      <TimeTable :days="days" :times="timesAfternoon" :slot="slot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TimeTable from '@/components/students/TimeTable.vue'
import AttendanceStatus from '@/components/students/AttendanceStatus.vue'
import { getAttendanceOverview, getTimetableOverview } from '@/stores/Student/Overview'

// ---------------- Types ---------------- //
type Slot = { subject: string; teacher?: string; room?: string }
type WeekSchedule = Record<string, Record<string, Slot | undefined>>
type Schedule = Record<string, WeekSchedule>

// ---------------- State ---------------- //
const loading = ref(false)
const rawStats = ref({ onTime: 0, late: 0, absence: 0 })
const schedule = ref<Schedule>({})
const selectedWeek = ref('')

// Constants for table headers
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const timesMorning = ['7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00']
const timesAfternoon = ['13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']

// ---------------- Computed ---------------- //
const stats = computed(() => ({
  present: rawStats.value.onTime + rawStats.value.late + rawStats.value.absence, // Adjust logic if "present" means purely present
  onTime: rawStats.value.onTime,
  late: rawStats.value.late,
  absence: rawStats.value.absence
}))

const weeks = computed(() => Object.keys(schedule.value))
const weekData = computed<WeekSchedule>(() => schedule.value[selectedWeek.value] || {})

// Helper to retrieve slot for TimeTable component
const slot = (day: string, time: string) => weekData.value?.[day]?.[time]

// ---------------- Lifecycle ---------------- //
onMounted(async () => {
  await fetchAttendance()
  await fetchTimetable()
})

// ---------------- Methods ---------------- //
const fetchAttendance = async () => {
  try {
    const data = await getAttendanceOverview()
    rawStats.value = data
  } catch (err) {
    console.error('Failed to fetch attendance stats:', err)
  }
}

const fetchTimetable = async () => {
  loading.value = true
  try {
    // 1. Fetch raw slots from API
    const timeSlots = await getTimetableOverview()
    
    // 2. Initialize a default structure for the current term/week
    const currentWeek: WeekSchedule = {}
    days.forEach(day => {
      currentWeek[day] = {}
    })

    // 3. Map API slots to our [Day][Time] structure
    if (Array.isArray(timeSlots)) {
      timeSlots.forEach((slot: any) => {
        // Normalize time: API might send "07:00:00" -> We need "7:00"
        const formatTime = (t: string) => t ? t.slice(0, 5).replace(/^0/, '') : ''
        
        const startTime = formatTime(slot.start_time)
        const endTime = formatTime(slot.end_time)
        const timeKey = `${startTime}-${endTime}` // e.g., "7:00-8:00"

        const dayName = slot.day_of_week // e.g., "Monday"

        if (currentWeek[dayName]) {
          currentWeek[dayName][timeKey] = {
            subject: slot.subject?.subject_name || slot.subject_name || 'N/A',
            room: slot.room?.name || slot.room_name || 'N/A',
            teacher: slot.teacher?.name || slot.teacher_name || 'N/A'
          }
        }
      })
    }

    // 4. Update state
    // Note: If backend supports weeks, you can map them here. 
    // For now, we wrap it in a generic "Current Semester" key.
    schedule.value = { 'Current Semester': currentWeek }
    selectedWeek.value = 'Current Semester'

  } catch (err) {
    console.error('Failed to fetch timetable:', err)
  } finally {
    loading.value = false
  }
}
</script>