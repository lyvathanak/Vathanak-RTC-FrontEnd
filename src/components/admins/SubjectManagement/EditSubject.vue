<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promote-title"
        tabindex="0"
        @keydown.esc.prevent.stop="close">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          @click="close" />

        <!-- Panel -->
        <div
          class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          :key="dialogKey"
          @click.stop>
          <!-- Header (sticky) -->
          <div class="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
            <div
              class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3
                    id="promote-title"
                    class="text-base sm:text-lg font-bold text-gray-900">
                    EDIT SUBJECT
                  </h3>

                  <div
                    class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6]/40"
                    :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("edit_subject") }}
                  </div>
                </div>

                <p class="mt-1 text-xs sm:text-sm text-gray-500">
                  Edit Subject Information
                </p>
              </div>

              <button
                type="button"
                class="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:scale-[0.98] transition"
                @click="close"
                aria-label="Close">
                <X class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-5 sm:px-6 py-5 max-h-[72vh] overflow-y-auto">
            <div
              v-if="errors.submit"
              class="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {{ errors.submit }}
            </div>

            <!-- Section card -->
            <section
              class="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div class="border-b border-gray-200 px-4 sm:px-5 py-4">
                <div class="flex items-center gap-2">
                  <Info class="w-4 h-4 text-gray-600" />
                  <h3 class="text-sm sm:text-base font-semibold text-gray-900">
                    Subject Information
                  </h3>
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  Update fields and save changes.
                </p>
              </div>

              <div class="p-4 sm:p-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Subject Code (read-only) -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-gray-700">
                      Subject Code
                    </label>
                    <input
                      :value="form.subject_code"
                      disabled
                      class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none" />
                    <p class="text-[11px] text-gray-500">
                      Code cannot be changed here.
                    </p>
                  </div>

                  <!-- Subject Name -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-gray-700">
                      Subject Name <span class="text-red-600">*</span>
                    </label>
                    <input
                      v-model.trim="form.subject_name"
                      class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/25"
                      placeholder="Enter Subject Name" />
                    <p
                      v-if="errors.subject_name"
                      class="text-[11px] text-red-600">
                      {{ errors.subject_name }}
                    </p>
                  </div>

                  <!-- Credit -->
                  <div class="flex flex-col gap-1.5 relative">
                    <label class="text-xs font-semibold text-gray-700">
                      Subject Credit <span class="text-red-600">*</span>
                    </label>
                    <input
                      v-model="creditInput"
                      @input="onCreditInput"
                      @keydown.enter.prevent="applyCreditFromInput"
                      @blur="hideCreditSuggest"
                      type="number"
                      step="0.25"
                      min="0"
                      placeholder="e.g., 1 or 1.5"
                      class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/25" />

                    <div
                      v-if="showCreditSuggest && creditSuggestions.length"
                      class="absolute left-0 right-0 top-full mt-1 z-30 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                      <div class="max-h-56 overflow-auto p-1">
                        <button
                          v-for="opt in creditSuggestions"
                          :key="'cr-' + opt"
                          type="button"
                          class="w-full rounded-lg text-left px-3 py-2 text-sm hover:bg-gray-50 active:bg-gray-100"
                          @mousedown.prevent="selectCreditSuggestion(opt)">
                          Credit
                          <span class="font-semibold">{{
                            formatCredit(opt)
                          }}</span>
                        </button>
                      </div>
                    </div>

                    <p v-if="errors.credit" class="text-[11px] text-red-600">
                      {{ errors.credit }}
                    </p>
                  </div>

                  <!-- Program -->
                  <div class="flex flex-col gap-1.5">
                    <BaseSelect
                      v-model="form.program_id"
                      :options="programOptions"
                      label="Program"
                      allLabel="All Programs"
                      placeholder="Select Program"
                      :required="true"
                      :disabled="submitting"
                      @change="onProgramChange" />

                    <p
                      v-if="errors.program_id"
                      class="text-[11px] text-red-600">
                      {{ errors.program_id || "Program is required" }}
                    </p>
                  </div>

                  <!-- Department (auto) -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-gray-700">
                      Department (auto) <span class="text-red-600">*</span>
                    </label>
                    <input
                      :value="
                        selectedDepartmentName || 'Select a program first'
                      "
                      disabled
                      class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none" />
                    <p
                      v-if="errors.department_id"
                      class="text-[11px] text-red-600">
                      {{ errors.department_id || "Department is required" }}
                    </p>
                  </div>

                  <!-- Total Time (hours) -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-gray-700">
                      Total Time (hours) <span class="text-red-600">*</span>
                    </label>
                    <input
                      v-model="totalHoursInput"
                      @input="onTotalHoursInput"
                      type="number"
                      step="0.25"
                      min="0"
                      placeholder="e.g., 48"
                      class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/25" />
                    <p
                      v-if="errors.total_hours"
                      class="text-[11px] text-red-600">
                      {{ errors.total_hours }}
                    </p>
                  </div>

                  <!-- Practice Time (hours) -->
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-gray-700">
                      Practice Time (hours) <span class="text-red-600">*</span>
                    </label>
                    <input
                      v-model="practiceHoursInput"
                      @input="onPracticeHoursInput"
                      type="number"
                      step="0.25"
                      min="0"
                      placeholder="e.g., 20"
                      class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/25" />
                    <p
                      v-if="practiceExceedsTotal"
                      class="text-[11px] text-red-600">
                      Practice time cannot be greater than total time.
                    </p>
                    <p
                      v-else-if="errors.practice_hours"
                      class="text-[11px] text-red-600">
                      {{ errors.practice_hours }}
                    </p>
                  </div>

                  <!-- Description -->
                  <div class="md:col-span-2 flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      v-model.trim="form.description"
                      rows="3"
                      class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/25 resize-y"
                      placeholder="Optional description" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Footer (sticky) -->
          <div class="sticky bottom-0 z-20 border-t bg-white/90 backdrop-blur">
            <div class="px-5 sm:px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.99]"
                @click="close"
                :disabled="submitting">
                Cancel
              </button>

              <button
                type="button"
                class="rounded-lg bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e4a94] active:scale-[0.99] transition disabled:opacity-60 inline-flex items-center gap-2"
                @click="submit"
                :disabled="submitting || practiceExceedsTotal">
                <span v-if="submitting" class="animate-pulse">Saving…</span>
                <span v-else>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";
import { X, Info, ChevronDown } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import BaseSelect from "@/components/features/BaseSelect.vue";

const { t, locale } = useI18n();

/* Props & emits */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subject: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue", "close", "updated"]);

/* normalize incoming subject */
function normalizeIncoming(s) {
  const toNumOrEmpty = (v) => {
    if (v === "" || v == null) return "";
    const n = Number(v);
    return Number.isFinite(n) ? n : "";
  };
  return {
    id: s.id,
    subject_code:
      s.subject_code ?? s.subjectCode ?? s.code ?? s.course_code ?? "",
    subject_name:
      s.subject_name ?? s.subjectName ?? s.name ?? s.title ?? s.subject ?? "",
    department_id: s.department_id ?? s.departmentId ?? "",
    program_id: s.program_id ?? s.programId ?? "",
    credit: toNumOrEmpty(s.credit),
    total_hours: toNumOrEmpty(
      s.total_hours ?? s.total_hour ?? s.totalTime ?? s.totalHours,
    ),
    practice_hours: toNumOrEmpty(
      s.practice_hours ?? s.practice_hour ?? s.practiceTime ?? s.practiceHours,
    ),
    description: s.description ?? s.desc ?? "",
  };
}

/* state */
const submitting = ref(false);
const errors = ref({});
const form = ref(normalizeIncoming(props.subject));

/* dialog key */
const dialogKey = computed(
  () =>
    String(form.value?.id ?? "new") +
    "-" +
    (props.modelValue ? "open" : "closed"),
);

/* reference data */
const departments = ref([]);
const deptMap = ref(new Map());
const programs = ref([]);
const depsLoaded = ref(false);

/* Hours as strings */
const totalHoursInput = ref(
  form.value.total_hours !== "" ? String(form.value.total_hours) : "",
);
const practiceHoursInput = ref(
  form.value.practice_hours !== "" ? String(form.value.practice_hours) : "",
);
const parseHourString = (s) => {
  if (s === "" || s == null) return "";
  const n = parseFloat(String(s));
  return Number.isFinite(n) && n >= 0 ? n : "";
};
function onTotalHoursInput() {
  form.value.total_hours = parseHourString(totalHoursInput.value);
}
function onPracticeHoursInput() {
  form.value.practice_hours = parseHourString(practiceHoursInput.value);
}

/* Credit */
const creditInput = ref(
  form.value.credit !== "" ? String(form.value.credit) : "",
);
const showCreditSuggest = ref(false);
const creditSuggestions = computed(() => {
  const set = new Set([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6]);
  const raw = String(creditInput.value || "").trim();
  if (raw !== "") {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) {
      const b = Math.floor(n);
      set.add(b);
      set.add(b + 0.5);
      set.add(b + 1);
      set.add(b + 1.5);
    }
  }
  return Array.from(set)
    .sort((a, b) => a - b)
    .slice(0, 8);
});
const formatCredit = (n) => Number(n ?? 0).toFixed(2);
function onCreditInput() {
  showCreditSuggest.value = true;
  const v = Number(creditInput.value);
  form.value.credit = Number.isFinite(v) ? v : "";
}
function selectCreditSuggestion(val) {
  creditInput.value = String(val);
  form.value.credit = Number(val);
  showCreditSuggest.value = false;
}
function applyCreditFromInput() {
  const v = Number(creditInput.value);
  if (Number.isFinite(v)) form.value.credit = v;
  showCreditSuggest.value = false;
}
function hideCreditSuggest() {
  setTimeout(() => (showCreditSuggest.value = false), 120);
}

/* Rule: practice must not exceed total */
const practiceExceedsTotal = computed(() => {
  const t = Number(form.value.total_hours);
  const p = Number(form.value.practice_hours);
  if (!Number.isFinite(t) || !Number.isFinite(p)) return false;
  return p > t;
});

/* program -> department auto bindings */
const selectedProgram = computed(() => {
  const pid = Number(form.value.program_id);
  if (!Number.isFinite(pid)) return null;
  return programs.value.find((p) => Number(p.id) === pid) || null;
});

const selectedDepartmentId = computed(
  () => selectedProgram.value?.department_id ?? "",
);
const selectedDepartmentName = computed(() => {
  const id = selectedDepartmentId.value;
  return id ? deptMap.value.get(String(id))?.name || `#${id}` : "";
});
function onProgramChange(v) {
  // normalize program_id to number or ""
  const pid = v === "" || v == null ? "" : Number(v);
  form.value.program_id = Number.isFinite(pid) ? pid : "";

  const depId = selectedDepartmentId.value;
  form.value.department_id = depId || "";
}

const programOptions = computed(() =>
  (programs.value || []).map((p) => ({
    label: `${p.name}${programDeptSuffix(p)}`,
    value: p.id,
  })),
);

function programDeptSuffix(p) {
  const dname = p?.department_id
    ? (deptMap.value.get(String(p.department_id))?.name ?? "")
    : "";
  return dname ? ` — ${dname}` : "";
}

/* sync with props */
watch(
  () => props.subject,
  (v) => {
    const norm = normalizeIncoming(v || {});
    form.value = norm;
    totalHoursInput.value =
      norm.total_hours !== "" ? String(norm.total_hours) : "";
    practiceHoursInput.value =
      norm.practice_hours !== "" ? String(norm.practice_hours) : "";
    creditInput.value = norm.credit !== "" ? String(norm.credit) : "";

    if (
      depsLoaded.value &&
      form.value.program_id &&
      !form.value.department_id
    ) {
      const depId = programs.value.find(
        (p) => Number(p.id) === Number(form.value.program_id),
      )?.department_id;
      if (depId) form.value.department_id = depId;
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (open) => {
    if (open) errors.value = {};
  },
);

/* Validate & submit */
function validate() {
  const e = {};
  if (!form.value.subject_name) e.subject_name = "Subject name is required";
  if (form.value.credit === "" || !Number.isFinite(Number(form.value.credit)))
    e.credit = "Valid credit is required";
  if (
    form.value.total_hours === "" ||
    !Number.isFinite(Number(form.value.total_hours))
  )
    e.total_hours = "Valid total hours required";
  if (
    form.value.practice_hours === "" ||
    !Number.isFinite(Number(form.value.practice_hours))
  )
    e.practice_hours = "Valid practice hours required";
  if (practiceExceedsTotal.value)
    e.practice_hours = "Practice time cannot be greater than total time";
  if (!form.value.program_id) e.program_id = "Program is required";
  if (!form.value.department_id) e.department_id = "Department is required";
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function submit() {
  if (!validate()) {
    showNotification("Please fix validation errors.", "error");
    return;
  }
  submitting.value = true;
  errors.value = { ...errors.value, submit: "" };
  try {
    const id = form.value.id;
    const payload = {
      subject_name: form.value.subject_name.trim(),
      department_id: Number(form.value.department_id),
      program_id: Number(form.value.program_id),
      credit: Number(form.value.credit),
      total_hours: Number(form.value.total_hours),
      practice_hours: Number(form.value.practice_hours),
      description: form.value.description?.trim() || null,
    };
    const { data } = await api.put(
      `/managements/update_subject/${id}`,
      payload,
    );

    const updated = data?.subject || {
      id,
      subject_name: payload.subject_name,
      subject_code: form.value.subject_code,
      description: payload.description,
      credit: payload.credit,
      total_hours: payload.total_hours,
      practice_hours: payload.practice_hours,
      program_id: payload.program_id,
      department_id: payload.department_id,
    };

    emit("updated", updated);
    showNotification("Subject updated successfully!", "success");
    emit("update:modelValue", false);
    emit("close");
  } catch (err) {
    const res = err?.response?.data;
    if (res?.errors && typeof res.errors === "object") {
      errors.value = Object.fromEntries(
        Object.entries(res.errors).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : String(v),
        ]),
      );
    }
    const msg = res?.message || err?.message || "Update subject failed";
    errors.value.submit = msg;
    showNotification(msg, "error");
  } finally {
    submitting.value = false;
  }
}
function close() {
  emit("update:modelValue", false);
  emit("close");
}

/* Fetch deps on mount */
async function fetchDeps() {
  try {
    const [{ data: dres }, { data: pres }] = await Promise.all([
      api.get("/managements/get_all_department"),
      api.get("/managements/get_all_program"),
    ]);

    const dlist = Array.isArray(dres?.all_department)
      ? dres.all_department
      : [];
    departments.value = dlist.map((d) => ({
      id: Number(d.id),
      name: String(d.department_name),
    }));
    deptMap.value = new Map(departments.value.map((d) => [String(d.id), d]));

    const plist = Array.isArray(pres?.programs) ? pres.programs : [];
    programs.value = plist.map((p) => ({
      id: Number(p.id),
      name: String(p.program_name),
      department_id: Number(p.department_id),
    }));
  } catch {
    departments.value = [];
    deptMap.value = new Map();
    programs.value = [];
  } finally {
    depsLoaded.value = true;
    if (form.value.program_id && !form.value.department_id) {
      const depId = programs.value.find(
        (p) => Number(p.id) === Number(form.value.program_id),
      )?.department_id;
      if (depId) form.value.department_id = depId;
    }
  }
}

onMounted(() => {
  fetchDeps();
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

/* optional: nicer scrollbar on webkit */
*::-webkit-scrollbar {
  width: 10px;
}
*::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: content-box;
}
</style>
