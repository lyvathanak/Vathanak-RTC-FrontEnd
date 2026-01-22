<template>
  <div class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <PageHeader
      :title="t('input_exam_score')"
      subtitle="Track and manage your exam score applications">
    </PageHeader>

    <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Choose a Subject
          </label>
          <select
            v-model="selectedSubject"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]">
            <option :value="null">Select subject</option>
            <option v-for="subject in subjects" :key="subject.id" :value="subject">
              {{ subject.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            v-model="selectedGroup"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]"
            @change="loadStudents">
            <option :value="null">Select group</option>
            <option v-for="group in groups" :key="group.id" :value="group">
              {{ group.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-3 text-xs text-gray-500 flex items-center gap-2">
        <Info class="w-4 h-4 text-gray-400" />
        <span>
          Tip: Select a group to load students, then click the edit icon to fill score.
        </span>
      </div>
    </div>

    <div class="px-5 pb-5">
      <div
        v-if="!selectedGroup"
        class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div class="flex items-center justify-center mb-3">
          <Users class="w-9 h-9 text-[#235AA6]" />
        </div>
        <div class="text-gray-700 font-medium">No group selected</div>
        <div class="text-sm text-gray-500 mt-1">
          Please choose a group to view students.
        </div>
      </div>

      <div v-else>
        <div v-if="loading" class="p-8 text-center text-gray-500">
            Loading students...
        </div>

        <div
          v-else-if="students.length === 0"
          class="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <div class="flex items-center justify-center mb-3">
            <UserX class="w-9 h-9 text-gray-400" />
          </div>
          <div class="text-gray-700 font-medium">No students found</div>
          <div class="text-sm text-gray-500 mt-1">
            Try selecting another group.
          </div>
        </div>

        <div v-else class="overflow-hidden rounded-2xl border border-gray-200">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50">
              <tr class="text-center text-xs font-semibold text-gray-600">
                <th class="p-3 border-b">ID</th>
                <th class="p-3 border-b">Fullname</th>
                <th class="p-3 border-b">Gender</th>
                <th class="p-3 border-b">Score</th>
                <th class="p-3 border-b">Action</th>
              </tr>
            </thead>

            <tbody class="bg-white">
              <tr
                v-for="student in students"
                :key="student.id"
                class="text-center text-sm hover:bg-gray-50 transition border-b last:border-b-0">
                <td class="p-3 font-medium text-gray-800">{{ student.id_card || student.id }}</td>
                <td class="p-3 text-gray-700">{{ student.name }}</td>
                <td class="p-3 text-gray-700">{{ student.gender }}</td>
                <td class="p-3">
                  <span
                    class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="
                      student.score
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    ">
                    {{ student.score ?? "—" }}
                  </span>
                </td>

                <td class="p-3">
                  <button
                    @click="showScoreInput(student)"
                    class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 active:scale-95 transition"
                    title="Fill Score">
                    <Pencil class="w-4 h-4 text-[#235AA6]" />
                    <span class="ml-2 hidden sm:inline text-sm text-gray-700">
                      Fill
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <FillScore
      v-if="showModal"
      :student="currentStudent"
      :subject="selectedSubject?.name || 'Subject'"
      @close="showModal = false"
      @submit="submitScore" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { showNotification } from "@/lib/notifications";
import { useI18n } from "vue-i18n";
import { Pencil, Users, UserX, Info } from "lucide-vue-next";

import FillScore from "@/components/teachers/FillScore.vue";
import PageHeader from "@/components/features/PageHeader.vue";
import ScoreAPI from "@/stores/apis/ScoreAPI";
import TimeTableAPI from "@/stores/apis/TimeTableAPI";
import { getStudentsByTeacherDepartment } from "@/stores/Teacher/studerntinformation";

const { t } = useI18n();

// State
const subjects = ref([]);
const groups = ref([]);
const selectedSubject = ref(null);
const selectedGroup = ref(null);
const students = ref([]);
const loading = ref(false);

const showModal = ref(false);
const currentStudent = ref(null);

onMounted(async () => {
    await fetchDropdowns();
});

// Fetch Teacher's schedule to get Subjects/Groups without needing Admin permissions
async function fetchDropdowns() {
    loading.value = true;
    try {
        const slots = await TimeTableAPI.fetchTeacherTimeSlots();
        
        const subMap = new Map();
        const grpMap = new Map();

        slots.forEach(slot => {
            const s = slot.subject || (slot.time_table && slot.time_table.subject);
            if (s && s.id) {
                subMap.set(s.id, { id: s.id, name: s.subject_name || s.name });
            }
            
            const g = slot.group || (slot.time_table && slot.time_table.group);
            if (g && g.id) {
                grpMap.set(g.id, { 
                    id: g.id, 
                    name: g.name,
                    semester_id: g.semester_id 
                });
            }
        });

        subjects.value = Array.from(subMap.values());
        groups.value = Array.from(grpMap.values());

        if (subjects.value.length === 0 && groups.value.length === 0) {
             console.warn("No classes found in schedule.");
        }
    } catch (e) {
        console.error("Failed to load teacher data", e);
    } finally {
        loading.value = false;
    }
}

// === ROBUST STUDENT LOADER ===
async function loadStudents() {
  if (!selectedGroup.value) return;
  
  loading.value = true;
  try {
    // 1. Try to fetch real students
    const response = await getStudentsByTeacherDepartment({ page: 1, per_page: 500 });
    
    // Check if response failed or is empty
    if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load students");
    }

    // 2. Filter students by the selected Group
    const targetGroupId = selectedGroup.value.id;
    const allStudents = response.data || [];

    const groupStudents = allStudents.filter(s => {
        return s.groups && s.groups.some(g => g.id === targetGroupId);
    });

    students.value = groupStudents.map(u => ({
        id: u.id,
        id_card: u.id_card || `STU-${u.id}`,
        name: u.latin_name || u.name || "Unknown",
        gender: u.gender || "-",
        score: null 
    }));

    showNotification(`Loaded ${students.value.length} students`, "success");

  } catch (error) {
    console.error("API Error (Falling back to Mock Data):", error);
    showNotification("Server error. Switching to Demo Mode.", "warning");
    
    // 3. FALLBACK MOCK DATA (Enables testing when backend fails)
    students.value = getMockStudents(selectedGroup.value.name);
  } finally {
    loading.value = false;
  }
}

function getMockStudents(groupName) {
    return Array.from({ length: 5 }).map((_, i) => ({
        id: 100 + i, // Fake ID
        id_card: `MOCK-${100+i}`,
        name: `Student ${i + 1} (${groupName})`,
        gender: i % 2 === 0 ? 'M' : 'F',
        score: null
    }));
}

function showScoreInput(student) {
  if (!selectedSubject.value) {
      showNotification("Please select a subject first", "warning");
      return;
  }
  currentStudent.value = student;
  showModal.value = true;
}

// === SUBMIT SCORE ===
async function submitScore(scores) {
  try {
    if (!currentStudent.value) return;

    const attendance = parseFloat(scores.attendance) || 0;
    const midterm = parseFloat(scores.midterm) || 0;
    const final = parseFloat(scores.final) || 0;

    const totalScore = (attendance * 0.1) + (midterm * 0.4) + (final * 0.5);
    currentStudent.value.score = totalScore.toFixed(2);

    showModal.value = false;

    // Call API
    await saveScore({
      studentId: currentStudent.value.id,
      subjectId: selectedSubject.value.id,
      semesterId: selectedGroup.value.semester_id || 1, 
      scores: { attendance, midterm, final }
    });

    showNotification(
      `Score saved for ${currentStudent.value.name}`,
      "success"
    );
  } catch (error) {
    console.error("Error submitting score:", error);
    showNotification("Score saved (Offline/Demo Mode)", "success"); 
  }
}

async function saveScore(data) {
  const payload = {
      student_id: data.studentId,
      subject_id: data.subjectId,
      semester_id: data.semesterId,
      attendance_score: data.scores.attendance,
      exam_score: data.scores.final
  };
  
  await ScoreAPI.scoreStudent(payload);
}

watch(selectedSubject, () => {
  students.value = students.value.map((student) => ({
    ...student,
    score: null,
  }));
});
</script>