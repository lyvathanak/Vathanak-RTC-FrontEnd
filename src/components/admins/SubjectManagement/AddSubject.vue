<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-100"
        role="dialog"
        aria-modal="true"
        @keydown.esc.prevent.stop="onClose">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          @click="onClose" />

        <!-- Center -->
        <div
          class="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
          <!-- Panel -->
          <div
            class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            @click.stop>
            <!-- Header (sticky) -->
            <div class="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
              <div
                class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3
                      id="promote-title"
                      class="text-base sm:text-lg font-bold text-gray-900">
                      ADD SUBJECT
                    </h3>

                    <div
                      class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6]/40 ring-1 ring-black/5"
                      :class="[locale === 'kh' ? 'khmer-text' : '']">
                      {{ t("add_subject") }}
                    </div>
                  </div>

                  <p class="mt-1 text-xs sm:text-sm text-gray-500">
                    Add a new subject to the system
                  </p>
                </div>

                <button
                  type="button"
                  class="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:scale-[0.98] transition"
                  @click="onClose"
                  aria-label="Close">
                  <X class="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-5 sm:px-6 py-5 max-h-[70vh] overflow-y-auto">
              <div
                v-if="errors.submit"
                class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ errors.submit }}
              </div>

              <!-- Section card -->
              <section
                class="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div
                  class="flex items-center gap-2 border-b border-gray-200 px-4 sm:px-5 py-4">
                  <div
                    class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#235AA6] ring-1 ring-black/5">
                    <Info class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-semibold text-gray-900">
                      Subject Information
                    </h3>
                    <p class="text-xs text-gray-500">
                      Fill in details to create a subject.
                    </p>
                  </div>
                </div>

                <div class="p-4 sm:p-5">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Subject Code (auto) -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Subject Code <span class="text-gray-400">(auto)</span>
                      </label>
                      <input
                        :value="form.subject_code || ''"
                        type="text"
                        disabled
                        placeholder="Will be generated after save"
                        class="h-11 rounded-xl border border-gray-200 px-3 outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-700" />
                      <p class="text-xs text-gray-500">
                        The system will generate the code automatically.
                      </p>
                    </div>

                    <!-- Subject Name -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Subject Name <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.trim="form.subject_name"
                        type="text"
                        placeholder="Enter Subject Name"
                        class="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]" />
                      <p
                        v-if="errors.subject_name"
                        class="text-xs text-red-600">
                        {{ errors.subject_name }}
                      </p>
                    </div>

                    <!-- Credit -->
                    <div class="flex flex-col gap-1.5 relative">
                      <label class="text-sm font-medium text-gray-700">
                        Subject Credit <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="creditInput"
                        @input="onCreditInput"
                        @keydown.enter.prevent="applyCreditFromInput"
                        @blur="hideCreditSuggest"
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="e.g., 1 or 1.50"
                        class="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]" />

                      <!-- Suggestion dropdown -->
                      <div
                        v-if="showCreditSuggest && creditSuggestions.length"
                        class="absolute left-0 right-0 top-full mt-2 z-20 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5">
                        <div class="max-h-56 overflow-auto py-1">
                          <button
                            v-for="opt in creditSuggestions"
                            :key="'cr-' + opt"
                            type="button"
                            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                            @mousedown.prevent="selectCreditSuggestion(opt)">
                            {{ formatCredit(opt) }}
                          </button>
                        </div>
                      </div>

                      <p v-if="errors.credit" class="text-xs text-red-600">
                        {{ errors.credit }}
                      </p>
                    </div>

                    <!-- Program -->
                    <div class="flex flex-col gap-1.5">
                      <!-- ⭐ star after label -->
                      <BaseSelect
                        v-model="form.program_id"
                        :options="programOptions"
                        label="Program *"
                        allLabel="All Programs"
                        placeholder="Select Program"
                        :required="true"
                        @change="onProgramChange" />
                      <p v-if="errors.program_id" class="text-xs text-red-600">
                        Program is required
                      </p>
                    </div>

                    <!-- Department (auto) -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Department <span class="text-gray-400">(auto)</span>
                      </label>
                      <input
                        :value="
                          selectedDepartmentName || 'Select a program first'
                        "
                        disabled
                        class="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 outline-none text-gray-700" />
                    </div>

                    <!-- Total Hours -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Total Time (hours) <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="totalHoursInput"
                        @input="onTotalHoursInput"
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="e.g., 48"
                        class="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]" />
                      <p v-if="errors.total_hours" class="text-xs text-red-600">
                        {{ errors.total_hours }}
                      </p>
                    </div>

                    <!-- Practice Hours -->
                    <div class="flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700">
                        Practice Time (hours)
                        <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="practiceHoursInput"
                        @input="onPracticeHoursInput"
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="e.g., 20"
                        class="h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]" />
                      <p
                        v-if="practiceExceedsTotal"
                        class="text-xs text-red-600">
                        Practice time cannot be greater than total time.
                      </p>
                      <p
                        v-else-if="errors.practice_hours"
                        class="text-xs text-red-600">
                        {{ errors.practice_hours }}
                      </p>
                    </div>

                    <!-- Description -->
                    <div class="md:col-span-2 flex flex-col gap-1.5">
                      <label class="text-sm font-medium text-gray-700"
                        >Description</label
                      >
                      <textarea
                        v-model.trim="form.description"
                        rows="3"
                        placeholder="Optional description"
                        class="min-h-24 rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] resize-y" />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Footer (sticky) -->
            <div class="sticky bottom-0 border-t bg-gray-50/90 backdrop-blur">
              <div
                class="px-5 sm:px-6 py-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition disabled:opacity-60"
                  @click="onClose"
                  :disabled="submitting">
                  Cancel
                </button>

                <button
                  type="button"
                  class="h-11 rounded-xl bg-[#235AA6] px-5 text-sm font-semibold text-white hover:bg-[#1e4a94] active:scale-[0.99] transition disabled:opacity-60"
                  @click="submit"
                  :disabled="submitting || practiceExceedsTotal">
                  <span v-if="submitting" class="animate-pulse">Saving…</span>
                  <span v-else>Save</span>
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
import { ref, watch, onMounted, computed } from "vue";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";
import { X, Info, ChevronDown } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const BASE = (import.meta.env.VITE_API_BASE_URL || "{{base_url}}").replace(
  /\/+$/,
  "",
);

const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(["update:modelValue", "close", "created"]);

const submitting = ref(false);
const errors = ref({});

/* user id */
const currentUserId = ref(null);
async function fetchMeMaybe() {
  try {
    const { data } = await api.get("/auth/get_detail_user");
    currentUserId.value = data?.id ?? data?.user?.id ?? null;
  } catch (e) {
    console.error("[AddSubject] get_detail_user failed", e);
    currentUserId.value = null;
  }
}

/* reference */
const programs = ref([]);
const deptMap = ref(new Map());

function programDeptName(p) {
  return (
    p?.department?.department_name ||
    deptMap.value.get(String(p.department_id))?.name ||
    "Unknown"
  );
}

const programOptions = computed(() =>
  (programs.value || []).map((p) => ({
    value: String(p.id), // keep as string for stable matching
    label: `${p.program_name} — ${programDeptName(p)}`,
  })),
);

/* form */
const form = ref({
  subject_name: "",
  subject_code: "",
  total_hours: "",
  practice_hours: "",
  credit: "",
  description: "",
  program_id: "", // string id
});

/* derived department */
const selectedProgram = computed(
  () =>
    programs.value.find(
      (p) => String(p.id) === String(form.value.program_id),
    ) || null,
);
const selectedDepartmentId = computed(
  () =>
    selectedProgram.value?.department?.id ??
    selectedProgram.value?.department_id ??
    null,
);
const selectedDepartmentName = computed(
  () =>
    selectedProgram.value?.department?.department_name ||
    (selectedDepartmentId.value
      ? deptMap.value.get(String(selectedDepartmentId.value))?.name || ""
      : ""),
);
function onProgramChange(v) {
  // BaseSelect returns what you emit (string/number). We keep string.
  form.value.program_id = v == null ? "" : String(v);
}

/* inputs */
const totalHoursInput = ref("");
const practiceHoursInput = ref("");
function parseHourString(s) {
  if (s === "" || s == null) return "";
  const n = parseFloat(String(s));
  return Number.isFinite(n) && n >= 0 ? n : "";
}
function onTotalHoursInput() {
  form.value.total_hours = parseHourString(totalHoursInput.value);
}
function onPracticeHoursInput() {
  form.value.practice_hours = parseHourString(practiceHoursInput.value);
}

/* credit */
const creditInput = ref("");
const showCreditSuggest = ref(false);
const creditSuggestions = computed(() => {
  const set = new Set([0.5, 1, 1.5, 2, 2.5, 3]);
  const raw = (creditInput.value ?? "").toString().trim();
  if (raw) {
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
function formatCredit(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? x.toFixed(2) : "0.00";
}
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

/* validation */
const practiceExceedsTotal = computed(() => {
  const t = Number(form.value.total_hours);
  const p = Number(form.value.practice_hours);
  if (!Number.isFinite(t) || !Number.isFinite(p)) return false;
  return p > t;
});
function validate() {
  const e = {};
  if (!form.value.subject_name) e.subject_name = "Subject name is required";
  if (form.value.credit === "" || form.value.credit === null)
    e.credit = "Credit is required";

  const hasTotal =
    form.value.total_hours !== "" && form.value.total_hours != null;
  const hasPractice =
    form.value.practice_hours !== "" && form.value.practice_hours != null;
  if (!hasTotal) e.total_hours = "Total hour is required";
  if (!hasPractice) e.practice_hours = "Practice hour is required";

  const th = Number(form.value.total_hours);
  const ph = Number(form.value.practice_hours);
  if (hasTotal && (!Number.isFinite(th) || th < 0))
    e.total_hours = "Enter a valid non-negative hour";
  if (hasPractice && (!Number.isFinite(ph) || ph < 0))
    e.practice_hours = "Enter a valid non-negative hour";
  if (!e.practice_hours && practiceExceedsTotal.value)
    e.practice_hours = "Practice time cannot be greater than total time";

  if (!form.value.program_id) e.program_id = "Program is required";

  errors.value = e;
  return Object.keys(e).length === 0;
}

/* submit */
function onClose() {
  emit("update:modelValue", false);
  emit("close");
}
async function submit() {
  if (submitting.value) return;
  if (!validate()) {
    showNotification("Please fix validation errors.", "error");
    return;
  }
  submitting.value = true;
  errors.value = { ...errors.value, submit: "" };
  try {
    const payload = {
      subject_name: form.value.subject_name.trim(),
      total_hours: Number(form.value.total_hours),
      practice_hours: Number(form.value.practice_hours),
      credit: Number(form.value.credit),
      description: form.value.description?.trim() || null,
      program_id: Number(form.value.program_id), // ✅ convert here
    };

    const { data } = await api.post("/managements/create_subject", payload);
    const created = data?.subject;
    if (!created) throw new Error(data?.message || "Create subject failed");

    const p =
      created.program ||
      programs.value.find(
        (pp) => Number(pp.id) === Number(created.program_id),
      ) ||
      null;
    const deptId = p?.department_id ?? p?.department?.id ?? null;
    const deptName =
      p?.department?.department_name ||
      (deptId ? deptMap.value.get(String(deptId))?.name || null : null);

    const emitPayload = {
      ...created,
      department_id: deptId,
      department_name: deptName,
      program_name: p?.program_name ?? null,
      program: p
        ? {
            id: p.id,
            program_name: p.program_name,
            department_id: p.department_id,
          }
        : null,
      department: deptId || deptName ? { id: deptId, name: deptName } : null,
    };

    emit("created", emitPayload);
    showNotification("Subject created successfully!", "success");
    onClose();

    // reset
    Object.assign(form.value, {
      subject_name: "",
      subject_code: "",
      total_hours: "",
      practice_hours: "",
      credit: "",
      description: "",
      program_id: "",
    });
    creditInput.value = "";
    showCreditSuggest.value = false;
    totalHoursInput.value = "";
    practiceHoursInput.value = "";
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to create subject";
    errors.value.submit = msg;
    showNotification(msg, "error");
  } finally {
    submitting.value = false;
  }
}

/* lifecycle */
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    errors.value = {};
    totalHoursInput.value =
      form.value.total_hours !== "" && form.value.total_hours != null
        ? String(form.value.total_hours)
        : "";
    practiceHoursInput.value =
      form.value.practice_hours !== "" && form.value.practice_hours != null
        ? String(form.value.practice_hours)
        : "";
  },
);

onMounted(async () => {
  await fetchMeMaybe();

  // departments
  try {
    const { data } = await api.get("/managements/get_all_department");
    const list = Array.isArray(data?.all_department) ? data.all_department : [];
    const rows = list.map((d) => ({
      id: Number(d.id),
      name: String(d.department_name),
    }));
    deptMap.value = new Map(rows.map((d) => [String(d.id), d]));
  } catch {
    deptMap.value = new Map();
  }

  // programs
  try {
    const { data } = await api.get("/managements/get_all_program");
    const plist = Array.isArray(data?.programs) ? data.programs : [];
    programs.value = plist.map((p) => ({
      id: Number(p.id),
      program_name: String(p.program_name),
      department_id: Number(p.department_id),
      department: p.department
        ? {
            id: Number(p.department.id),
            department_name: String(p.department.department_name),
          }
        : null,
    }));
  } catch (e) {
    console.error("Failed to load programs", e);
    programs.value = [];
  }
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
