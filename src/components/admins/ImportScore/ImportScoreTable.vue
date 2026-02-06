<template>
  <div class="mt-4">
    <!-- Empty State -->
    <div
      v-if="!students?.length"
      class="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <div
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
        <Users class="h-6 w-6 text-gray-400" />
      </div>
      <h3 class="mt-3 text-base font-semibold text-gray-800">No students</h3>
      <p class="mt-1 text-sm text-gray-500">
        Please select academic year, program, and year to view students.
      </p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <!-- Top Bar -->
      <div
        class="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-gray-800">Students</h2>
          <p class="text-xs text-gray-500">
            {{ students.length }} student{{ students.length > 1 ? "s" : "" }} •
            {{ subjectColumns.length }} subject{{
              subjectColumns.length > 1 ? "s" : ""
            }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="emit('refresh')"
            class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.99]">
            <RefreshCcw class="h-4 w-4" />
            Refresh
          </button>

          <button
            v-if="showExport"
            type="button"
            @click="emit('export')"
            class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-3 py-2 text-sm font-medium text-white hover:opacity-95 active:scale-[0.99]">
            <Download class="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <!-- Scroll Area -->
      <div class="max-h-[65vh] overflow-auto">
        <table class="min-w-full text-sm">
          <!-- Sticky Header -->
          <thead class="sticky top-0 z-20 bg-[#235AA6] text-white">
            <tr>
              <th class="sticky left-0 z-30 px-4 py-3 text-left font-semibold">
                Student
              </th>
              <th
                class="sticky left-55 z-30 px-4 py-3 text-left font-semibold">
                Email
              </th>

              <th
                v-for="sub in subjectColumns"
                :key="sub"
                class="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {{ sub }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(s, idx) in students"
              :key="s.user_program_id"
              class="hover:bg-gray-50"
              :class="idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'">
              <!-- Sticky Student -->
              <td class="sticky left-0 z-10 bg-inherit px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-xs font-semibold text-gray-700">
                    {{ initials(s.student_name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-medium text-gray-800">
                      {{ s.student_name }}
                    </p>
                    <p class="text-xs text-gray-500">
                      ID: {{ s.user_program_id }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Sticky Email -->
              <td class="sticky left-55 z-10 bg-inherit px-4 py-3">
                <p class="max-w-60 truncate text-gray-700">
                  {{ s.email }}
                </p>
              </td>

              <!-- Scores -->
              <td
                v-for="sub in subjectColumns"
                :key="sub"
                class="px-4 py-3 text-center">
                <span
                  class="inline-flex min-w-14 justify-center rounded-xl px-2 py-1 text-xs font-semibold"
                  :class="scoreClass(getScoreNumber(s, sub))">
                  {{ formatScore(s, sub) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Hint -->
      <div class="border-t px-4 py-2 text-xs text-gray-500">
        Tip: Scroll horizontally to see all subjects.
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, RefreshCcw, Download } from "lucide-vue-next";

const props = defineProps({
  students: { type: Array, default: () => [] },
  subjectColumns: { type: Array, default: () => [] },
  showExport: { type: Boolean, default: false },
});

const emit = defineEmits(["refresh", "export"]);

function getScore(student, subjectName) {
  return (
    student.subjects?.find((x) => x.subject_name === subjectName)?.score ?? null
  );
}

function getScoreNumber(student, subjectName) {
  const v = getScore(student, subjectName);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatScore(student, subjectName) {
  const v = getScore(student, subjectName);
  if (v === null || v === undefined || v === "") return "N/A";
  return v;
}

function scoreClass(score) {
  // keep it simple + readable
  if (score === null) return "bg-gray-100 text-gray-600";
  if (score >= 85) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "S";
}
</script>

<style scoped>
/* nicer scrollbar */
div::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
div::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.18);
  border-radius: 999px;
}
</style>
