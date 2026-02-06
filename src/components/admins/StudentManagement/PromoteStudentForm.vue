<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50"
        aria-labelledby="promote-title"
        role="dialog"
        aria-modal="true"
        @keydown.esc.prevent.stop="close">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          @click="close" />

        <!-- Center -->
        <div
          class="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
          <!-- Panel -->
          <div
            class="w-full max-w-lg sm:max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            @click.stop>
            <!-- Header -->
            <div class="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
              <div
                class="flex items-center justify-between gap-3 px-4 sm:px-6 py-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3
                      id="promote-title"
                      class="text-base sm:text-lg font-bold text-gray-900">
                      PROMOTE STUDENTS
                    </h3>

                    <div
                      class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                      :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("promote_student") }}
                    </div>
                  </div>

                  <p class="mt-0.5 text-xs sm:text-sm text-gray-500">
                    {{ subtitle }}
                  </p>
                </div>

                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30"
                  @click="close"
                  aria-label="Close">
                  <X class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="max-h-[70vh] overflow-y-auto px-4 sm:px-6 py-5">
              <div
                class="rounded-2xl bg-gray-50 p-4 sm:p-5 ring-1 ring-gray-100">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <!-- Single -->
                  <template v-if="isSingleStudent">
                    <InfoField :label="t('student')">
                      {{ singleStudentName }}
                    </InfoField>

                    <InfoField :label="t('current_program')">
                      {{ singleCurrentProgram }}
                    </InfoField>

                    <InfoField :label="t('current_level')">
                      {{ singleCurrentLevel }}
                    </InfoField>
                  </template>

                  <!-- Multiple -->
                  <template v-else>
                    <div class="md:col-span-2">
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-sm font-semibold text-gray-800">
                          {{ students.length }} {{ t("students_selected") }}
                        </p>
                        <span class="text-xs text-gray-500">
                          {{ t("current_program") }}: {{ bulkCurrentProgram }}
                        </span>
                      </div>

                      <div
                        class="mt-3 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                        <ul class="divide-y divide-gray-100">
                          <li
                            v-for="s in students"
                            :key="s.id"
                            class="px-3 py-2 text-sm flex items-start justify-between gap-3">
                            <div class="min-w-0">
                              <p class="font-medium text-gray-900 truncate">
                                {{ studentName(s) }}
                              </p>
                              <p class="text-xs text-gray-500 truncate">
                                {{ s.program?.program_name || "—" }}
                                <span v-if="s.program?.academic_year">
                                  · {{ s.program.academic_year }}
                                </span>
                              </p>
                            </div>

                            <span
                              class="shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-gray-200 bg-gray-50 text-gray-700">
                              {{ t("current_level") }}: {{ s.year || "—" }}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>

                  <!-- New Program -->
                  <div class="md:col-span-2">
                    <BaseSelect
                      v-model="newProgramId"
                      :label="t('new_program')"
                      all-label="All Programs"
                      :placeholder="t('select_program') || 'Select Program'"
                      :options="programOptionsForSelect"
                      :disabled="
                        loadingPrograms || programOptionsForSelect.length === 0
                      "
                      teleport-to="body" />

                    <p
                      v-if="
                        !loadingPrograms && programOptionsForSelect.length === 0
                      "
                      class="mt-2 text-xs text-amber-700">
                      {{
                        t("no_next_program_found") ||
                        "No next program found for promotion."
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="sticky bottom-0 border-t bg-white/90 backdrop-blur">
              <div
                class="flex flex-col sm:flex-row sm:items-center justify-end gap-2 px-4 sm:px-6 py-4">
                <button
                  type="button"
                  class="h-11 w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-[#235AA6]/20"
                  @click="close">
                  {{ t("cancel") }}
                </button>

                <button
                  type="button"
                  class="h-11 w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  :disabled="!newProgramId || promoting"
                  @click="promote">
                  <span v-if="!promoting">{{ t("promote") }}</span>
                  <span v-else class="inline-flex items-center gap-2">
                    <span
                      class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {{ t("saving") || "Saving..." }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineComponent, h } from "vue";
import { X } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { useProgram } from "@/stores/global/useProgram.js";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  students: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue", "promote"]);

const { t, locale } = useI18n();

/* v-model bridge */
const modelValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
const close = () => (modelValue.value = false);

/* Programs */
const { programs, getAllPrograms, loading: programsLoading } = useProgram();
const loadingPrograms = computed(() => Boolean(programsLoading?.value));

onMounted(() => getAllPrograms?.());

const newProgramId = ref("");
const promoting = ref(false);

/* Helpers */
const isSingleStudent = computed(() => props.students.length === 1);

const studentName = (s) =>
  s?.user_detail?.name ||
  s?.user_detail?.username ||
  s?.user?.name ||
  s?.name ||
  "—";

const subtitle = computed(() => {
  if (!props.students.length)
    return t("select_student") || "Select a student to promote.";
  return isSingleStudent.value
    ? t("promote_one_student") ||
        "Promote the selected student to the next program."
    : t("promote_multiple_students") ||
        "Promote selected students to the next program.";
});

const singleStudent = computed(() => props.students?.[0] || null);
const singleStudentName = computed(() =>
  singleStudent.value ? studentName(singleStudent.value) : "—"
);
const singleCurrentProgram = computed(
  () => singleStudent.value?.program?.program_name || "—"
);
const singleCurrentLevel = computed(() => singleStudent.value?.year ?? "—");
const bulkCurrentProgram = computed(
  () => props.students?.[0]?.program?.program_name || "—"
);

/* Academic year helpers */
const ayStart = (ay) => {
  if (ay == null) return NaN;
  if (typeof ay === "number") return ay;
  const s = String(ay).trim();
  const m = s.match(/(\d{4})/); // "2025-2026" -> 2025
  return m ? Number(m[1]) : NaN;
};
const ayLabel = (ay) =>
  ay == null || String(ay).trim() === "" ? "" : String(ay);

/* Programs in same name + valid AY + FUTURE only (sorted) */
const filteredPrograms = computed(() => {
  const st = props.students?.[0];
  if (!st) return [];

  const currentName = st?.program?.program_name;
  const currentAY = ayStart(st?.program?.academic_year);
  if (!currentName || !Number.isFinite(currentAY)) return [];

  return (programs.value || [])
    .filter((p) => p?.program_name === currentName)
    .map((p) => ({
      ...p,
      __ayStart: ayStart(p?.academic_year),
      __ayLabel: ayLabel(p?.academic_year),
    }))
    .filter((p) => Number.isFinite(p.__ayStart) && p.__ayStart > currentAY) // ✅ ALL FUTURE
    .sort((a, b) => a.__ayStart - b.__ayStart);
});

/* ✅ show ALL future years (dedupe by id) */
const programOptions = computed(() => {
  const list = filteredPrograms.value || [];
  const seen = new Set();

  return list
    .filter((p) => {
      const id = String(p?.id ?? "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((p) => ({
      ...p,
      __ayStart: p.__ayStart ?? ayStart(p?.academic_year),
      __ayLabel: p.__ayLabel || p.academic_year || "",
    }))
    .sort((a, b) => (a.__ayStart ?? 0) - (b.__ayStart ?? 0));
});

/* ✅ options passed to BaseSelect */
const programOptionsForSelect = computed(() => {
  return (programOptions.value || []).map((p) => {
    const ay = p.__ayLabel || p.academic_year || "";
    return {
      value: String(p.id),
      label: `${p.program_name}${ay ? ` (${ay})` : ""}`,
    };
  });
});

/* ✅ next academic year ONLY */
const nextPrograms = computed(() => {
  const list = filteredPrograms.value;
  if (!list.length) return [];

  const nextYear = list[0].__ayStart; // list already sorted future-only
  return list.filter((p) => p.__ayStart === nextYear);
});

/* Reset on students change */
watch(
  () => props.students,
  () => {
    newProgramId.value = "";
  },
  { immediate: true }
);

/* Ensure selected stays valid */
watch(
  programOptionsForSelect,
  () => {
    const ids = new Set(
      programOptionsForSelect.value.map((o) => String(o.value))
    );
    if (!ids.has(String(newProgramId.value))) newProgramId.value = "";
  },
  { immediate: true }
);

/* Promote */
const promote = async () => {
  if (!newProgramId.value || !props.students.length) return;

  const userIds = props.students
    .map((s) => s?.user_detail?.user_id)
    .filter(Boolean);

  if (!userIds.length) return;

  promoting.value = true;
  try {
    emit("promote", { newProgramId: newProgramId.value, userIds });
  } finally {
    promoting.value = false;
    newProgramId.value = "";
    close();
  }
};

/* Small internal component */
const InfoField = defineComponent({
  name: "InfoField",
  props: { label: { type: String, required: true } },
  setup(props, { slots }) {
    return () =>
      h("div", {}, [
        h(
          "label",
          { class: "text-sm font-semibold text-gray-800 block mb-1" },
          props.label
        ),
        h(
          "div",
          {
            class:
              "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900",
          },
          slots.default ? slots.default() : "—"
        ),
      ]);
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>