<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    @keydown.esc="emitClose"
    tabindex="0">
    <!-- Backdrop click -->
    <div class="absolute inset-0" @click="emitClose"></div>

    <!-- Modal -->
    <Transition name="modal">
      <div
        class="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        @click.stop>
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2
              class="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardEdit class="w-5 h-5 text-[#235AA6]" />
              Fill in Score
            </h2>

            <p class="mt-1 text-sm text-gray-500">
              Student:
              <span class="font-medium text-gray-700">{{
                student?.name ?? "—"
              }}</span>
              <span class="mx-1 text-gray-300">•</span>
              Subject:
              <span class="font-medium text-gray-700">{{
                subject ?? "—"
              }}</span>
            </p>
          </div>

          <button
            class="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            @click="emitClose"
            aria-label="Close">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 py-5 space-y-4">
          <!-- Attendance -->
          <div class="rounded-2xl border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-[#235AA6]" />
                <p class="font-semibold text-gray-800">Attendance</p>
              </div>
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-[#235AA6]">
                10%
              </span>
            </div>

            <div class="relative">
              <input
                v-model="scoreInput.attendance"
                type="number"
                inputmode="numeric"
                min="0"
                max="100"
                class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]"
                placeholder="0 - 100" />
            </div>

            <p v-if="errors.attendance" class="mt-2 text-xs text-red-600">
              {{ errors.attendance }}
            </p>
          </div>

          <!-- Midterm -->
          <div class="rounded-2xl border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <BookOpen class="w-4 h-4 text-[#235AA6]" />
                <p class="font-semibold text-gray-800">Mid-term</p>
              </div>
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-[#235AA6]">
                40%
              </span>
            </div>

            <input
              v-model="scoreInput.midterm"
              type="number"
              inputmode="numeric"
              min="0"
              max="100"
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]"
              placeholder="0 - 100" />

            <p v-if="errors.midterm" class="mt-2 text-xs text-red-600">
              {{ errors.midterm }}
            </p>
          </div>

          <!-- Final -->
          <div class="rounded-2xl border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <GraduationCap class="w-4 h-4 text-[#235AA6]" />
                <p class="font-semibold text-gray-800">Final</p>
              </div>
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-[#235AA6]">
                50%
              </span>
            </div>

            <input
              v-model="scoreInput.final"
              type="number"
              inputmode="numeric"
              min="0"
              max="100"
              class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]"
              placeholder="0 - 100" />

            <p v-if="errors.final" class="mt-2 text-xs text-red-600">
              {{ errors.final }}
            </p>
          </div>

          <!-- Total preview -->
          <div
            class="rounded-2xl bg-gray-50 border border-gray-200 p-4 flex items-center justify-between">
            <div class="text-sm text-gray-600 flex items-center gap-2">
              <Sigma class="w-4 h-4 text-gray-500" />
              Weighted total preview
            </div>
            <div class="text-sm font-semibold text-gray-800">
              {{ totalPreview }}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2 border-t px-5 py-4">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition"
            @click="emitClose">
            <X class="w-4 h-4" />
            Cancel
          </button>

          <button
            class="inline-flex items-center gap-2 rounded-lg bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f4f93] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isValid"
            @click="submitScore">
            <Save class="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, computed, watchEffect } from "vue";
import {
  ClipboardEdit,
  X,
  Save,
  Users,
  User,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Sigma,
} from "lucide-vue-next";

const props = defineProps({
  student: { type: Object, default: null },
  subject: { type: String, default: "" },
});

const emit = defineEmits(["close", "submit"]);

const scoreInput = reactive({
  attendance: "",
  midterm: "",
  final: "",
});

const errors = reactive({
  attendance: "",
  midterm: "",
  final: "",
});

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function validateField(name, value) {
  if (value === "" || value === null || value === undefined) return "Required";
  const n = toNumber(value);
  if (Number.isNaN(n)) return "Must be a number";
  if (n < 0 || n > 100) return "Score must be 0 - 100";
  return "";
}

watchEffect(() => {
  errors.attendance = validateField("attendance", scoreInput.attendance);
  errors.midterm = validateField("midterm", scoreInput.midterm);
  errors.final = validateField("final", scoreInput.final);
});

const isValid = computed(() => {
  return !errors.attendance && !errors.midterm && !errors.final;
});

const totalPreview = computed(() => {
  const a = toNumber(scoreInput.attendance);
  const m = toNumber(scoreInput.midterm);
  const f = toNumber(scoreInput.final);
  if ([a, m, f].some((n) => Number.isNaN(n))) return "—";
  const total = a * 0.1 + m * 0.4 + f * 0.5;
  return total.toFixed(2);
});

function emitClose() {
  emit("close");
}

function submitScore() {
  if (!isValid.value) return;
  emit("submit", {
    attendance: scoreInput.attendance,
    midterm: scoreInput.midterm,
    final: scoreInput.final,
  });
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 160ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
