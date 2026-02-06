<template>
  <div class="p-6 space-y-6">
    <!-- ======= Program Info Card ======= -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 px-5 py-4">
        <h3 class="text-sm font-semibold text-gray-900">Program Information</h3>
        <p class="text-xs text-gray-500 mt-1">
          Basic details used to create a new program.
        </p>
      </div>

      <div class="p-5 space-y-5">
        <!-- Program Name + Academic Year -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="flex flex-col gap-2 min-w-0">
            <label class="text-xs font-semibold text-gray-700">
              Program Name <span class="text-red-600">*</span>
            </label>
            <Input
              v-model="program.name"
              placeholder="e.g., Computer Science"
              class="h-11 w-full rounded-xl border border-gray-200 bg-white placeholder:text-xs outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
              :class="
                program.name ? 'border-black ring-1 ring-black/10' : ''
              " />
            <p class="text-[11px] text-gray-500">
              This is the name shown to students.
            </p>
          </div>

          <div class="flex flex-col gap-2 min-w-0">
            <label class="text-xs font-semibold text-gray-700">
              Academic Year <span class="text-red-600">*</span>
            </label>

            <Input
              v-model="academicYear"
              placeholder="e.g., 2025-2026"
              class="h-11 w-full rounded-xl border border-gray-200 bg-white placeholder:text-xs outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
              :class="
                academicYear ? 'border-black ring-1 ring-black/10' : ''
              " />

            <p v-if="yearError" class="text-xs text-red-600">
              {{ yearError }}
            </p>
            <p v-else class="text-[11px] text-gray-500">
              Example formats: <span class="font-medium">2025-2026</span> or
              <span class="font-medium">2026</span>
            </p>
          </div>
        </div>

        <!-- Degree + Duration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Degree -->
          <div class="flex flex-col gap-2 min-w-0">
            <label class="text-xs font-semibold text-gray-700">
              Degree Level <span class="text-red-600">*</span>
            </label>

            <div class="relative">
              <select
                v-model="degreeLevel"
                class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 pr-10 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed appearance-none"
                :class="degreeLevel ? 'border-black ring-1 ring-black/10' : ''">
                <option value="" disabled>Select degree…</option>
                <option v-for="opt in DEGREE_OPTIONS" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>

              <span
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                aria-hidden="true">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>

            <p v-if="degreeError" class="text-xs text-red-600">
              {{ degreeError }}
            </p>
            <p v-else class="text-[11px] text-gray-500">
              Choose the official level for this program.
            </p>
          </div>

          <!-- Duration -->
          <div class="flex flex-col gap-2 min-w-0">
            <label class="text-xs font-semibold text-gray-700">
              Duration (years)
            </label>

            <input
              v-model.number="durationYears"
              type="number"
              min="1"
              class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
              placeholder="e.g., 4" />

            <p class="text-[11px] text-gray-500">
              Default is 1 year. Use the official duration.
            </p>
          </div>
        </div>

        <!-- Department -->
        <div class="grid grid-cols-1 gap-2">
          <!-- Department -->
          <div class="flex flex-col gap-2 min-w-0">
            <label class="text-xs font-semibold text-gray-700">
              Department <span class="text-red-600">*</span>
            </label>

            <div class="relative">
              <select
                v-model="departmentId"
                class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 pr-10 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed appearance-none"
                :disabled="loadingDepartments"
                :class="
                  departmentId ? 'border-black ring-1 ring-black/10' : ''
                ">
                <option value="" disabled>
                  {{
                    loadingDepartments
                      ? "Loading departments…"
                      : "Select department…"
                  }}
                </option>

                <option
                  v-for="d in departments"
                  :key="d.id"
                  :value="String(d.id)">
                  {{ d.department_name }}
                </option>
              </select>

              <span
                class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                aria-hidden="true">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>

              <!-- small spinner while loading -->
              <span
                v-if="loadingDepartments"
                class="absolute inset-y-0 right-10 flex items-center"
                aria-hidden="true">
                <span
                  class="h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></span>
              </span>
            </div>

            <p v-if="deptError" class="text-xs text-red-600">
              {{ deptError }}
            </p>
            <p v-else class="text-[11px] text-gray-500">
              Department controls what students see and where the program is
              grouped.
            </p>
          </div>

          <!-- Add Semester Button -->
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              @click="addSemester"
              class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#1f4f93] active:scale-[0.99]">
              <Plus class="w-4 h-4" />
              Add Semester
            </button>

            <p class="text-[11px] text-gray-500">
              Add semesters first, then assign subjects.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======= Semesters Section ======= -->
    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div
        class="border-b border-gray-200 px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Semesters</h3>
          <p class="text-xs text-gray-500 mt-1">
            Configure semester dates and attach subjects.
          </p>
        </div>

        <div class="text-xs text-gray-500">
          Total:
          <span class="font-semibold text-gray-800">{{
            semesters.length
          }}</span>
        </div>
      </div>

      <div class="p-5 space-y-4">
        <div
          v-for="(sem, idx) in semesters"
          :key="sem._key"
          class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <!-- Header -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
            @click="sem.expanded = !sem.expanded"
            :aria-expanded="sem.expanded ? 'true' : 'false'">
            <div class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                {{ sem.semester_number }}
              </div>
              <div class="text-left">
                <div class="text-sm font-semibold text-gray-900">
                  Semester {{ sem.semester_number }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ sem.semester_key || `Semester ${sem.semester_number}` }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 text-xs font-semibold"
                @click.stop="removeSemester(idx)">
                <Trash2 class="w-4 h-4 mr-1" />
                Remove
              </button>

              <ChevronRight
                class="w-5 h-5 text-gray-600 transition-transform"
                :class="sem.expanded ? 'rotate-90' : ''" />
            </div>
          </button>

          <!-- Body -->
          <div v-show="sem.expanded" class="px-5 pb-5 pt-2 space-y-5">
            <!-- Meta -->
            <div class="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div class="flex flex-col">
                <label class="text-xs font-semibold text-gray-700 mb-1">
                  Semester Number
                </label>
                <input
                  :value="sem.semester_number"
                  type="number"
                  disabled
                  class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm" />
              </div>

              <div class="flex flex-col md:col-span-3">
                <label class="text-xs font-semibold text-gray-700 mb-1">
                  Semester Key
                </label>
                <input
                  v-model="sem.semester_key"
                  type="text"
                  class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                  placeholder="e.g., Semester 1" />
              </div>

              <div class="flex flex-col">
                <label class="text-xs font-semibold text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  v-model="sem.start_date"
                  type="date"
                  class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20" />
              </div>

              <div class="flex flex-col">
                <label class="text-xs font-semibold text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  v-model="sem.end_date"
                  type="date"
                  class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20" />
              </div>
            </div>

            <!-- Subjects -->
            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div
                class="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <div class="text-sm font-semibold text-gray-900">
                    Subjects
                  </div>
                  <p class="text-xs text-gray-500">
                    Pick subjects — credit/hour will be filled automatically.
                  </p>
                </div>

                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black active:scale-[0.99]"
                  @click="addRow(sem.rows)"
                  :disabled="loadingSubjects">
                  <Plus class="w-4 h-4" />Add Subject
                </button>
              </div>

              <PickerTable
                :rows="sem.rows"
                :subjects="subjectOptions"
                @remove="(i) => sem.rows.splice(i, 1)"
                @subject-change="(p) => onSubjectPicked(sem, p)" />
            </div>
          </div>
        </div>

        <div
          v-if="!semesters.length"
          class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
          <div class="text-sm font-semibold text-gray-800">
            No semesters yet
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Click <span class="font-semibold">Add Semester</span> to start
            assigning subjects.
          </div>
        </div>
      </div>
    </section>

    <!-- ======= Footer Actions ======= -->
    <div
      class="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 py-4">
      <div class="flex items-center justify-end gap-3 px-1">
        <button
          type="button"
          @click="onCancel"
          class="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
          Cancel
        </button>

        <button
          type="button"
          @click="createProgram"
          :disabled="saving"
          class="inline-flex items-center rounded-xl bg-[#235AA6] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#1f4f93] disabled:opacity-60">
          <span
            v-if="saving"
            class="inline-block h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ saving ? "Saving…" : "Create Program" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  h,
  defineComponent,
  watch,
  computed,
} from "vue";
import api from "@/stores/apis/axios";
import { Input } from "@/components/ui/input";
import { Plus, ChevronRight, Trash2, ChevronDown } from "lucide-vue-next";

const DEGREE_OPTIONS = ["Bachelor", "High Bachelor", "Master", "PhD"];

// Computed options for BaseSelect
const degreeOptions = computed(() =>
  DEGREE_OPTIONS.map((d) => ({ label: d, value: d }))
);

const departmentOptions = computed(() =>
  (departments.value || []).map((d) => ({
    label: d.department_name,
    value: String(d.id),
  }))
);

/* ---------- Row table ---------- */
const PickerTable = defineComponent({
  name: "PickerTable",
  props: {
    rows: { type: Array, required: true }, // [{ subjectId, name, credit, hour }]
    subjects: { type: Array, required: true }, // [{ id, name, nameWithCode, credit, hour }]
  },
  emits: ["remove", "subject-change"],
  setup(props, { emit }) {
    return () =>
      h("div", { class: "overflow-x-auto border rounded-lg" }, [
        h("table", { class: "min-w-full text-sm" }, [
          h("thead", null, [
            h("tr", { class: "text-left bg-gray-100" }, [
              h("th", { class: "px-3 py-2 font-semibold w-72" }, "Subject"),
              h("th", { class: "px-3 py-2 font-semibold w-20" }, "Credit"),
              h("th", { class: "px-3 py-2 font-semibold w-24" }, "Hour"),
              h("th", { class: "px-3 py-2 font-semibold w-20" }, "Action"),
            ]),
          ]),
          h("tbody", null, [
            ...(props.rows.length
              ? props.rows.map((r, i) =>
                  h("tr", { class: "border-t", key: i }, [
                    // Subject select (with ChevronDown)
                    h("td", { class: "px-3 py-2" }, [
                      h("div", { class: "relative" }, [
                        h(
                          "select",
                          {
                            class:
                              "w-full border rounded px-2 py-2 bg-white focus:ring-2 focus:ring-black " +
                              "appearance-none pr-9",
                            value: r.subjectId || "",
                            onChange: (e) =>
                              emit("subject-change", {
                                index: i,
                                value: e.target.value,
                              }),
                          },
                          [
                            h("option", { value: "" }, "Select subject…"),
                            ...props.subjects.map((s) =>
                              h(
                                "option",
                                { key: s.id, value: s.id },
                                s.nameWithCode || s.name
                              )
                            ),
                          ]
                        ),
                        h(
                          "span",
                          {
                            class:
                              "pointer-events-none absolute inset-y-0 right-2 flex items-center",
                            "aria-hidden": "true",
                          },
                          [h(ChevronDown, { class: "w-4 h-4 text-gray-500" })]
                        ),
                      ]),
                    ]),
                    // Credit + Hour (readonly)
                    h("td", { class: "px-3 py-2" }, r.credit ?? ""),
                    h("td", { class: "px-3 py-2" }, r.hour ?? ""),
                    // Action
                    h("td", { class: "px-3 py-2" }, [
                      h(
                        "button",
                        {
                          type: "button",
                          class:
                            "inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 px-2.5 py-1.5 transition-colors",
                          title: "Remove",
                          onClick: (e) => {
                            e.stopPropagation?.();
                            emit("remove", i);
                          },
                        },
                        [h(Trash2, { class: "h-4 w-4" })]
                      ),
                    ]),
                  ])
                )
              : [
                  h("tr", { key: "empty" }, [
                    h(
                      "td",
                      {
                        class: "px-3 py-3 text-center text-gray-500 italic",
                        colSpan: 4,
                      },
                      "No subjects"
                    ),
                  ]),
                ]),
          ]),
        ]),
      ]);
  },
});

/* ---------- state ---------- */
const emit = defineEmits(["success", "cancel"]);

const saving = ref(false);
const program = reactive({ code: "", name: "" });

const degreeLevel = ref("");
const degreeError = ref("");

const durationYears = ref(1);
const academicYear = ref("");

const yearError = ref("");

const departments = ref([]);
const departmentId = ref("");
const loadingDepartments = ref(false);
const deptError = ref("");

const semesters = ref([]);
const subjectOptions = ref([]);
const loadingSubjects = ref(false);

/* ---------- code suggestion ---------- */
const suggestedCode = ref("");
function acronymFromName(name = "") {
  if (!name.trim()) return "PRG";
  const cleaned = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const stop = new Set(["and", "of", "in", "for", "the", "with", "&"]);
  const parts = cleaned.split(" ").filter((w) => !stop.has(w.toLowerCase()));
  if (parts.length >= 2)
    return parts
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4);
  const w = parts[0] || "PRG";
  let ac = w
    .replace(/[aeiou]/gi, "")
    .slice(0, 4)
    .toUpperCase();
  if (ac.length < 2) ac = w.slice(0, 4).toUpperCase();
  return ac;
}
function yytwo() {
  return String(new Date().getFullYear()).slice(-2);
}
watch(
  () => program.name,
  () => {
    const prefix = `${acronymFromName(program.name)}${yytwo()}`;
    suggestedCode.value = `${prefix}-001`;
  }
);

/* ---------- helpers ---------- */
function addSemester() {
  semesters.value.push({
    _key: uid(),
    expanded: true,
    semester_number: semesters.value.length + 1,
    semester_key: `Semester ${semesters.value.length + 1}`,
    start_date: "",
    end_date: "",
    rows: [],
  });
}
function removeSemester(index) {
  semesters.value.splice(index, 1);
  renumberSemesters();
}
function renumberSemesters() {
  semesters.value.forEach((s, i) => {
    s.semester_number = i + 1;
    if (!s.semester_key || /^Semester\s+\d+$/i.test(s.semester_key)) {
      s.semester_key = `Semester ${i + 1}`;
    }
  });
}
function addRow(target) {
  target.push({ subjectId: "", name: "", credit: null, hour: null });
}

function onSubjectPicked(sem, { index, value }) {
  const r = sem.rows[index];
  if (!r) return;
  r.subjectId = value || "";
  const found = subjectOptions.value.find(
    (s) => String(s.id) === String(value)
  );
  if (found) {
    r.name = found.name;
    r.credit = found.credit;
    r.hour = found.hour;
  } else {
    r.name = "";
    r.credit = null;
    r.hour = null;
  }
}

/* ---------- fetchers ---------- */
async function fetchDepartments() {
  loadingDepartments.value = true;
  try {
    const { data } = await api.get("/managements/get_all_department");
    departments.value = Array.isArray(data?.all_department)
      ? data.all_department
      : [];
  } catch (e) {
    departments.value = [];
    console.error("❌ Departments load failed:", e?.response?.data || e);
  } finally {
    loadingDepartments.value = false;
  }
}

async function fetchSubjects() {
  loadingSubjects.value = true;
  try {
    const { data } = await api.get("/managements/get_all_subjects");
    const arr = Array.isArray(data?.subjects?.data) ? data.subjects.data : [];
    subjectOptions.value = arr.map((s) => ({
      id: s.id,
      name: s.subject_name || s.name || "",
      nameWithCode: [s.subject_code, s.subject_name]
        .filter(Boolean)
        .join(" — "),
      credit: Number(s.credit ?? 0),
      hour: Number(s.total_hours ?? 0),
    }));
  } catch (e) {
    subjectOptions.value = [];
    console.error("⚠️ Subjects load failed:", e?.response?.data || e);
  } finally {
    loadingSubjects.value = false;
  }
}

/* ---------- bulk helpers ---------- */
async function bulkAddSubjectsToSemester(semesterId, subjectIds) {
  if (!semesterId || !Array.isArray(subjectIds) || subjectIds.length === 0)
    return;
  await api.post("/managements/add_subject_to_semester", {
    semester_id: Number(semesterId),
    subject_ids: subjectIds.map(Number),
  });
}

async function bulkRemoveSubjectsFromSemester(semesterId, subjectIds) {
  if (!semesterId || !Array.isArray(subjectIds) || subjectIds.length === 0)
    return;
  await api.delete("/managements/remove_subject_from_semester", {
    data: {
      semester_id: Number(semesterId),
      subject_ids: subjectIds.map(Number),
    },
  });
}

/* ---------- submit flow ---------- */
async function createProgram() {
  deptError.value = "";
  degreeError.value = "";
  yearError.value = "";

  if (!program.name?.trim()) {
    // keep it simple; optional if you want required program name
  }
  if (!departmentId.value) deptError.value = "Department is required.";
  if (!degreeLevel.value) degreeError.value = "Degree level is required.";
  if (!academicYear.value) yearError.value = "Academic Year is required.";

  if (deptError.value || degreeError.value || yearError.value) return;

  saving.value = true;
  try {
    const payloadProgram = {
      program_name: program.name?.trim() || null,
      degree_level: degreeLevel.value,
      duration_years: Number(durationYears.value || 1),
      department_id: Number(departmentId.value),
      sub_department_id: null,
      academic_year: academicYear.value,
    };

    const createRes = await api.post(
      "/managements/create_new_program",
      payloadProgram
    );
    const createdProgram = createRes?.data?.program;
    const programId = Number(createdProgram?.id);
    if (!programId) throw new Error("Program was not created.");

    for (const sem of semesters.value) {
      if (!sem.start_date || !sem.end_date) continue;

      const semPayload = {
        program_id: programId,
        semester_number: Number(sem.semester_number),
        semester_key: String(
          sem.semester_key || `Semester ${sem.semester_number}`
        ).trim(),
        start_date: sem.start_date,
        end_date: sem.end_date,
      };

      let createdSemId = null;
      try {
        const r = await api.post(
          "/managements/create_new_semester_program",
          semPayload
        );
        createdSemId = r?.data?.semester?.id ?? null;
      } catch (e) {
        console.error("❌ Create semester failed:", e?.response?.data || e);
      }

      if (createdSemId) {
        const subjectIds = sem.rows
          .map((row) => Number(row.subjectId))
          .filter((n) => Number.isFinite(n) && n > 0);

        try {
          await bulkAddSubjectsToSemester(createdSemId, subjectIds);
        } catch (e) {
          console.error(
            "⚠️ Bulk add subjects to semester failed:",
            e?.response?.data || e
          );
        }
      }
    }

    emit("success", createdProgram);

    // reset
    program.code = "";
    program.name = "";
    degreeLevel.value = "";
    durationYears.value = 1;
    departmentId.value = "";
    academicYear.value = "";
    semesters.value = [];
  } catch (err) {
    alert(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to create program."
    );
    console.error("❌ Create Program flow failed:", err);
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  emit("cancel");
}

/* ---------- init ---------- */
onMounted(async () => {
  await Promise.all([fetchDepartments(), fetchSubjects()]);
});

/* utils */
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
</script>
