<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <!-- Header -->
    <PageHeader
      :title="t('timetable_management') || 'Head of Department Timetable'"
      subtitle="View weekly timetable across departments ">
      <WeekSelector v-model="selectedWeek" :weeks="weeks" />

      <button
        @click="readOnly = !readOnly"
        :class="[
          'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all',
          readOnly
            ? 'bg-[#235AA6] border border-gray-200 text-white'
            : 'bg-red-600 text-white',
        ]">
        <Eye v-if="readOnly" class="w-4 h-4" />
        <Pencil v-else class="w-4 h-4" />
        {{ readOnly ? "Read-only" : "Editable" }}
      </button>
    </PageHeader>

    <!-- Morning -->
    <TimetableSection
      title="Morning"
      subtitle="7:00–11:00"
      period="morning"
      :days="days"
      :times="timesMorning"
      :getSlot="getSlot"
      :readOnly="readOnly"
      @edit="editCell" />

    <!-- Afternoon -->
    <TimetableSection
      className="mt-8"
      title="Afternoon"
      subtitle="13:00–17:00"
      period="afternoon"
      :days="days"
      :times="timesAfternoon"
      :getSlot="getSlot"
      :readOnly="readOnly"
      @edit="editCell" />

    <!-- Edit Modal (only if editable) -->
    <EditSlotModal
      v-if="!readOnly"
      :open="!!editing"
      :day="editing?.day"
      :time="editing?.time"
      :modelValue="form"
      @update:modelValue="(v) => (form = v)"
      @close="closeModal"
      @save="saveCell"
      @delete="clearSlot" />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Eye, Pencil } from "lucide-vue-next";

import WeekSelector from "@/components/teachers/timetable/WeekSelector.vue";
import TimetableSection from "@/components/teachers/timetable/TimetableSection.vue";
import EditSlotModal from "@/components/teachers/timetable/EditSlotModal.vue";
import PageHeader from "@/components/features/PageHeader.vue";

const { t, locale } = useI18n();

/** fixed labels */
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timesMorning = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00"];
const timesAfternoon = [
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

function makeEmptyWeek() {
  const wk = {};
  for (const d of days) {
    wk[d] = {};
    for (const tm of [...timesMorning, ...timesAfternoon])
      wk[d][tm] = undefined;
  }
  return wk;
}

/** ✅ fake data generator */
function makeFakeWeek(seed = 1) {
  const wk = makeEmptyWeek();

  const classes = [
    { subject: "Math", teacher: "Mr. Dara", room: "A101" },
    { subject: "English", teacher: "Ms. Lina", room: "B201" },
    { subject: "Physics", teacher: "Mr. Sok", room: "Lab 1" },
    { subject: "ICT", teacher: "Ms. Srey", room: "Computer" },
    { subject: "Chemistry", teacher: "Mr. Vann", room: "Lab 2" },
    { subject: "Biology", teacher: "Ms. Nita", room: "C103" },
  ];

  // spread some slots
  const pick = (i) => classes[(i + seed) % classes.length];
  wk["Monday"]["7:00-8:00"] = pick(0);
  wk["Monday"]["9:00-10:00"] = pick(1);
  wk["Tuesday"]["8:00-9:00"] = pick(2);
  wk["Tuesday"]["13:00-14:00"] = pick(3);
  wk["Wednesday"]["10:00-11:00"] = pick(4);
  wk["Thursday"]["14:00-15:00"] = pick(5);
  wk["Friday"]["15:00-16:00"] = pick(0);
  wk["Saturday"]["13:00-14:00"] = pick(2);

  return wk;
}

/** schedule storage (HOD view) */
const schedule = ref({
  "Week 1": makeFakeWeek(1),
  "Week 2": makeFakeWeek(2),
  "Week 3": makeFakeWeek(3),
});

/** weeks list */
const weeks = computed(() => Object.keys(schedule.value));
const selectedWeek = ref(weeks.value[0] || "Week 1");
const weekData = computed(() => schedule.value[selectedWeek.value] || {});

/** view mode toggle */
const readOnly = ref(true);

/** getter */
function getSlot(day, time) {
  return weekData.value?.[day]?.[time];
}

/** editing state + form */
const editing = ref(null);

const formRef = ref({ subject: "", teacher: "", room: "" });
const form = computed({
  get: () => formRef.value,
  set: (v) => (formRef.value = v),
});

function editCell({ day, time }) {
  if (readOnly.value) return;

  editing.value = { day, time };
  const existing = getSlot(day, time);
  form.value = existing
    ? { ...existing }
    : { subject: "", teacher: "", room: "" };
}

function closeModal() {
  editing.value = null;
}

function saveCell() {
  if (!editing.value) return;

  const { day, time } = editing.value;
  const subject = (form.value.subject || "").trim();
  if (!subject) return;

  const teacher = (form.value.teacher || "").trim();
  const room = (form.value.room || "").trim();

  if (!schedule.value[selectedWeek.value])
    schedule.value[selectedWeek.value] = makeEmptyWeek();
  if (!schedule.value[selectedWeek.value][day])
    schedule.value[selectedWeek.value][day] = {};

  schedule.value[selectedWeek.value][day][time] = { subject, teacher, room };
  editing.value = null;
}

function clearSlot() {
  if (!editing.value) return;

  const { day, time } = editing.value;
  if (schedule.value[selectedWeek.value]?.[day]) {
    schedule.value[selectedWeek.value][day][time] = undefined;
  }
  editing.value = null;
}
</script>
