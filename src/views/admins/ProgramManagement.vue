<!-- /src/pages/admins/program/ProgramIndex.vue -->
<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <!-- Header / Tools -->
    <PageHeader
      :title="t('programs_management')"
      subtitle="Track and manage your program applications">
      <!--  actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openCreate = true"
          class="h-10 inline-flex items-center gap-2 rounded-lg bg-[#235AA6] px-4 text-white font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2">
          <Plus class="h-4 w-4" />
          <span class="text-sm">Create Program</span>
        </button>
      </div>
    </PageHeader>

    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!--  search -->
      <div class="relative w-full md:w-md">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search programs…"
          class="w-full h-10 rounded-xl border px-10 pr-3 outline-none focus:ring-2 focus:ring-[#235AA6]"
          @input="debouncedFetch()" />
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>

    <!-- Filters -->
    <ProgramFilter
      title="Program Filters"
      subtitle="Filter programs by department, academic year, and degree level."
      clear-button-text="Clear"
      :auto-emit="true"
      :department-options="departmentFilterOptions"
      :academic-year-options="academicYearFilterOptions"
      :degree-level-options="degreeLevelFilterOptions"
      :initial-filters="initialProgramFilters"
      @update:filters="handleFiltersUpdate"
      @clear-filters="handleClearFilters"
      @filter-change="handleFilterChange" />

    <!-- Table -->
    <div class="">
      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <ListTable
          :key="columnsKey"
          :data="pagedRows"
          :loading="searching"
          :show-selection="false"
          :selected-ids="[]"
          :columns="columns"
          :sort-field="sortField"
          :sort-direction="sortDirection"
          :show-actions="true"
          :show-view-action="false"
          :show-edit-action="true"
          :show-delete-action="true"
          :show-clone-action="true"
          view-action-title="View program"
          edit-action-title="Edit program"
          delete-action-title="Delete program"
          clone-action-title="Clone program"
          empty-state-title="No programs found"
          empty-state-message="Try adjusting your search or filters."
          loading-message="Loading programs..."
          row-key="id"
          @edit="openEditFor($event)"
          @delete="askDelete($event)"
          @clone="openCloneFor($event)"
          @sort="onSort">
          <!-- Program -->
          <template #column-program_name="{ value }">
            <span
              class="font-semibold text-gray-900 whitespace-normal wrap-break-word leading-snug">
              {{ value || "—" }}
            </span>
          </template>

          <!-- Department -->
          <template #column-department_id="{ value }">
            <span
              class="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {{ getDepartmentName(value) }}
            </span>
          </template>

          <!-- Degree level -->
          <template #column-degree_level="{ value }">
            <span
              class="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
              {{ value || "—" }}
            </span>
          </template>

          <!-- Duration -->
          <template #column-duration_years="{ value }">
            <span>{{
              value ? value + (value > 1 ? " years" : " year") : "—"
            }}</span>
          </template>

          <template #column-academic_year="{ value }">
            <span>{{ value }}</span>
          </template>
        </ListTable>
      </div>
    </div>

    <!-- Pagination (uses your component API exactly) -->
    <div class="">
      <Pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="programs.length"
        :page-size-options="[5, 10, 25, 50, 100]"
        item-label="Programs"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange" />
    </div>

    <!-- Create -->
    <Dialog v-model:open="openCreate">
      <DialogContent
        class="max-w-none w-[90vw] sm:w-[80vw] sm:max-w-250 rounded-sm p-0">
        <div
          class="flex flex-col bg-gray-50 rounded-sm overflow-hidden max-h-[85vh]">
          <div
            class="sticky top-0 z-10 bg-white border-b rounded-t-sm flex items-center justify-between px-6 py-4">
            <DialogHeader class="p-0">
              <div class="flex items-center gap-2 flex-wrap">
                <DialogTitle class="text-lg font-semibold text-gray-900">
                  CREATE PROGRAM
                </DialogTitle>
                <!-- Badge -->
                <div
                  class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                  :class="[locale === 'kh' ? 'khmer-text' : '']">
                  {{ t("add_program") }}
                </div>
              </div>
              <DialogDescription class="text-sm text-gray-500">
                Fill program details, choose department, then add semesters &
                subjects.
              </DialogDescription>
            </DialogHeader>

            <button
              @click="openCreate = false"
              class="p-1 rounded hover:bg-gray-100"
              aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <AddProgramModal
              @success="onCreated"
              @cancel="openCreate = false" />
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Update -->
    <Dialog v-model:open="openEdit">
      <DialogContent
        class="max-w-none w-[90vw] sm:w-[80vw] sm:max-w-250 rounded-sm p-0">
        <div
          class="flex flex-col bg-gray-50 rounded-sm overflow-hidden max-h-[85vh]">
          <div
            class="sticky top-0 z-10 bg-white border-b rounded-t-sm flex items-center justify-between px-6 py-4">
            <DialogHeader class="p-0">
              <div class="flex items-center gap-2 flex-wrap">
                <DialogTitle class="text-lg font-semibold text-gray-900">
                  EDIT PROGRAM
                </DialogTitle>
                <!-- Badge -->
                <div
                  class="hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-[#235AA6] bg-blue-50 border border-[#235AA6] ring-1 ring-gray-200"
                  :class="[locale === 'kh' ? 'khmer-text' : '']">
                  {{ t("edit_program") }}
                </div>
              </div>
              <DialogDescription class="text-sm text-gray-500">
                Update base details then manage semesters & subjects.
              </DialogDescription>
            </DialogHeader>

            <button
              @click="openEdit = false"
              class="p-1 rounded hover:bg-gray-100"
              aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-4">
            <UpdateProgramModal
              v-if="editingProgram"
              :program="editingProgram"
              @success="onUpdated"
              @cancel="openEdit = false" />
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Clone Modal Component -->
    <CloneProgram
      v-model="openClone"
      :program="cloningProgram"
      :departments="departmentOptions"
      @success="handleCloneSuccess"
      @cancel="handleCloneCancel" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import api from "@/stores/apis/axios";
import AddProgramModal from "@/components/admins/program/AddProgramModal.vue";
import UpdateProgramModal from "@/components/admins/program/UpdateProgramModal.vue";
import CloneProgram from "@/components/admins/program/CloneProgram.vue";
import ListTable from "@/components/features/ListTable.vue";
import Pagination from "@/components/features/Pagination.vue";
import PageHeader from "@/components/features/PageHeader.vue";
import { useFilteredByDepartment } from "@/stores/global/FilterByDepartment.js";
import ProgramFilter from "@/components/admins/program/ProgramFilter.vue";
import { Plus, X, Search } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const S = (v) => String(v ?? "");

/* ---------- state ---------- */
const openCreate = ref(false);
const openEdit = ref(false);
const editingProgram = ref(null);
const openClone = ref(false);
const cloningProgram = ref(null);

/* programs (filtered dataset) */
const programs = ref([]);

/* departments lookup */
const { departmentOptions } = useFilteredByDepartment({ immediate: true });
const deptIndex = ref(new Map());

/* filters */
const searchTerm = ref("");
const searching = ref(false);
const selectedDeptLabel = ref("All");
const selectedAcademicYear = ref("All");
const selectedDegreeLevel = ref("All");

/* sorting */
const sortField = ref("");
const sortDirection = ref("asc");

/* pagination */
const page = ref(1);
const pageSize = ref(10);

/* responsive columns */
const isPhone = ref(false);
const columnsDesktop = [
  { key: "id", label: "ID", visible: true, sortable: true },
  { key: "program_name", label: "Program", visible: true, sortable: true },
  { key: "degree_level", label: "Degree Level", visible: true, sortable: true },
  { key: "duration_years", label: "Duration", visible: true, sortable: true },
  { key: "department_id", label: "Department", visible: true, sortable: true },
  {
    key: "academic_year",
    label: "Academic Year",
    visible: true,
    sortable: true,
  },
];
const columnsPhone = [
  { key: "id", label: "ID", visible: true, sortable: true },
  { key: "program_name", label: "Program", visible: true, sortable: true },
  { key: "department_id", label: "Department", visible: true, sortable: true },
];
const columns = computed(() => (isPhone.value ? columnsPhone : columnsDesktop));
const columnsKey = computed(
  () => `cols-${isPhone.value ? "phone" : "desktop"}`,
);

const departmentFilterOptions = computed(() => {
  return departmentOptions.value.map((d) => d.department_name || d.name);
});

const academicYearFilterOptions = computed(() => {
  return Array.from(
    new Set(
      programs.value.map((p) => p.academic_year).filter((y) => y && y !== "—"),
    ),
  ).sort();
});

const degreeLevelFilterOptions = computed(() => {
  return Array.from(
    new Set(programs.value.map((p) => p.degree_level).filter((d) => d)),
  ).sort();
});

const initialProgramFilters = computed(() => ({
  department: "All ",
  academic_year: "All",
  degree_level: "All",
}));

const filterKey = computed(
  () => `program-filter-${departmentOptions.value.length}`,
);

/* page slice */
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return programs.value.slice(start, start + pageSize.value);
});

/* helpers */
function buildDeptIndexFromPrograms(list) {
  const map = new Map();
  for (const d of departmentOptions.value) {
    const id = S(d.id);
    map.set(id, { id, department_name: d.department_name || d.name });
  }
  for (const p of list) {
    const d = p?.department;
    if (d?.id)
      map.set(S(d.id), {
        id: S(d.id),
        department_name: d.department_name || d.name,
      });
  }
  deptIndex.value = map;
}

function normalizePrograms(list, programMap) {
  return (list || []).map((p) => {
    const isCloned = !!p.original_program_id;
    const original = isCloned ? programMap.get(p.original_program_id) : null;

    const displayName =
      isCloned && original
        ? `${p.program_name} (from ${original.program_name} – ${original.academic_year})`
        : p.program_name;

    return {
      id: p.id,
      program_name: displayName,
      raw_program_name: p.program_name,
      degree_level: p.degree_level,
      duration_years: p.duration_years,
      department_id: p.department_id ?? p.department?.id ?? null,
      department: p.department ?? null,
      academic_year: p.academic_year ?? "—",
      original_program_id: p.original_program_id ?? null,
    };
  });
}

/* API */
async function apiListAllPrograms() {
  const { data } = await api.get("/managements/get_all_program");
  const raw = data?.programs || [];
  const map = new Map(raw.map((p) => [p.id, p]));
  return normalizePrograms(raw, map);
}

async function apiListProgramsByDepartmentId(deptId) {
  const { data } = await api.get("/managements/get_program_by", {
    params: { department_id: deptId },
  });
  return normalizePrograms(data?.programs || []);
}

async function apiSearchPrograms(q) {
  const { data } = await api.get("/managements/search_paginate_program", {
    params: { search: q },
  });
  return normalizePrograms(data?.programs?.data || []);
}

async function apiDeleteProgram(id) {
  await api.delete(`/managements/remove_program/${id}`);
}

async function apiCloneProgram(id, academicYear = null) {
  const payload = { program_id: id };

  if (academicYear) {
    payload.academic_year = academicYear;
  }

  const { data } = await api.post("/managements/clone_program", payload);
  return normalizePrograms([data?.program || {}])[0];
}

async function apiListAllProgramsRaw() {
  const { data } = await api.get("/managements/get_all_program");
  return data?.programs || [];
}

async function fetchCatalog() {
  searching.value = true;
  try {
    const raw = (await apiListAllProgramsRaw()) || [];
    const map = new Map(raw.map((p) => [p.id, p]));
    const normalized = normalizePrograms(raw, map);

    programs.value = normalized;
    buildDeptIndexFromPrograms(normalized);
    page.value = 1;
  } catch (err) {
    console.error("fetchCatalog failed:", err);
    programs.value = [];
  } finally {
    searching.value = false;
  }
}

function getDepartmentName(id) {
  if (!id) return "—";
  return deptIndex.value.get(String(id))?.department_name || "—";
}

/* Clone functions */
async function handleCloneSuccess(payload) {
  try {
    const clonedProgram = await apiCloneProgram(
      payload.program_id,
      payload.academic_year,
    );

    await applyFiltersToList();

    // Show success notification (you'll need to implement this)
    showNotification(
      `Program "${clonedProgram.program_name}" cloned successfully.`,
      "success",
    );
  } catch (err) {
    console.error("Clone failed:", err);
    showNotification(
      err?.response?.data?.message || err?.message || "Clone failed",
      "error",
    );
  }
}

function handleCloneCancel() {
  cloningProgram.value = null;
  openClone.value = false;
}

function openCloneFor(row) {
  cloningProgram.value = { ...row };
  openClone.value = true;
}

/* Filter functions */
function labelToValue(label, key) {
  if (!label || label === "All") return "";
  if (key === "department") {
    const found = departmentOptions.value.find(
      (d) => (d.department_name || d.name) === label,
    );
    return found ? S(found.id) : "";
  }
  return label;
}

async function applyFiltersToList() {
  const q = searchTerm.value.trim().toLowerCase();
  const deptId = labelToValue(selectedDeptLabel.value, "department");
  const academicYear = labelToValue(
    selectedAcademicYear.value,
    "academic_year",
  );
  const degreeLevel = labelToValue(selectedDegreeLevel.value, "degree_level");

  searching.value = true;
  try {
    let list = await apiListAllPrograms();

    list = list.filter((p) => {
      const matchesName = q
        ? (p.program_name || "").toLowerCase().includes(q)
        : true;
      const matchesDept = deptId ? S(p.department_id) === deptId : true;
      const matchesYear = academicYear
        ? p.academic_year === academicYear
        : true;
      const matchesDegree = degreeLevel ? p.degree_level === degreeLevel : true;

      return matchesName && matchesDept && matchesYear && matchesDegree;
    });

    programs.value = list;
    buildDeptIndexFromPrograms(list);
    applySort();
    page.value = 1;
  } catch (e) {
    console.error("applyFiltersToList failed:", e);
  } finally {
    searching.value = false;
  }
}

function handleFiltersUpdate(f) {
  selectedDeptLabel.value = f.department || "All";
  selectedAcademicYear.value = f.academic_year || "All";
  selectedDegreeLevel.value = f.degree_level || "All";
  applyFiltersToList();
}

function handleClearFilters() {
  selectedDeptLabel.value = "All";
  selectedAcademicYear.value = "All";
  selectedDegreeLevel.value = "All";
  applyFiltersToList();
}

function handleFilterChange() {}

/* sorting */
function onSort({ field, direction }) {
  sortField.value = field;
  sortDirection.value = direction;
  applySort();
  page.value = 1;
}

function applySort() {
  const f = sortField.value;
  const dir = sortDirection.value;
  if (!f) return;
  programs.value = [...programs.value].sort((a, b) => {
    let av = a[f];
    let bv = b[f];
    if (typeof av === "string") {
      av = av.toLowerCase();
      bv = String(bv || "").toLowerCase();
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

/* delete */
const programToDelete = ref(null);

function askDelete(row) {
  programToDelete.value = row?.id;
  confirmDeleteProgram();
}

async function confirmDeleteProgram() {
  const id = programToDelete.value;
  if (!id) return;
  try {
    await apiDeleteProgram(id);
    await applyFiltersToList();
  } catch (err) {
    alert(err?.response?.data?.message || err?.message || "Delete failed");
  } finally {
    programToDelete.value = null;
  }
}

/* create / edit */
function onCreated() {
  openCreate.value = false;
  applyFiltersToList();
}

function openEditFor(p) {
  editingProgram.value = { ...p };
  openEdit.value = true;
}

async function onUpdated() {
  openEdit.value = false;
  await applyFiltersToList();
}

/* debounce search */
let debounceTimer;

function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => applyFiltersToList(), 300);
}

/* pagination handlers */
function handlePageChange() {
  // No-op, slicing done in computed
}

function handlePageSizeChange() {
  page.value = 1;
}

/* keep page valid when list length or size changes */
watch(
  () => programs.value.length,
  () => {
    if ((page.value - 1) * pageSize.value >= programs.value.length)
      page.value = 1;
  },
);

watch(pageSize, () => {
  page.value = 1;
});

/* media query watcher */
function attachMQ() {
  const mqPhone = window.matchMedia("(max-width: 768px)");
  const update = () => {
    isPhone.value = !!mqPhone.matches;
  };
  update();
  mqPhone.addEventListener?.("change", update) || mqPhone.addListener?.(update);
  return () =>
    mqPhone.removeEventListener?.("change", update) ||
    mqPhone.removeListener?.(update);
}

let detachMQ = null;

onMounted(async () => {
  await fetchCatalog();
  detachMQ = attachMQ();
});

onUnmounted(() => {
  if (detachMQ) detachMQ();
});

// Notification function (you need to implement this based on your app)
function showNotification(message, type) {
  // Implement your notification system here
  alert(`${type}: ${message}`);
}
</script>

<style scoped>
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
:deep(table) {
  table-layout: auto;
}

/* Phones (≤768px) */
@media (max-width: 768px) {
  :deep(table) {
    min-width: 900px;
  }

  :deep(thead th:first-child),
  :deep(tbody td:first-child) {
    position: sticky;
    left: 0;
    background: #fff;
    z-index: 2;
    width: 56px;
    min-width: 56px;
    box-shadow: 2px 0 0 rgba(0, 0, 0, 0.04);
  }
  :deep(thead th:last-child),
  :deep(tbody td:last-child) {
    position: sticky;
    right: 0;
    background: #fff;
    z-index: 2;
    width: 78px;
    min-width: 78px;
    box-shadow: -2px 0 0 rgba(0, 0, 0, 0.04);
  }
  :deep(thead th:nth-child(2)),
  :deep(tbody td:nth-child(2)) {
    white-space: normal;
    word-break: break-word;
    line-height: 1.25;
  }
  :deep(thead th:nth-child(3)),
  :deep(tbody td:nth-child(3)) {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

/* Tablets (769px–1180px) */
@media (min-width: 769px) and (max-width: 1180px) {
  :deep(table) {
    min-width: 1080px;
  }
  :deep(thead th:first-child),
  :deep(tbody td:first-child) {
    position: sticky;
    left: 0;
    background: #fff;
    z-index: 2;
    width: 64px;
    min-width: 64px;
    box-shadow: 2px 0 0 rgba(0, 0, 0, 0.04);
  }
  :deep(thead th:last-child),
  :deep(tbody td:last-child) {
    position: sticky;
    right: 0;
    background: #fff;
    z-index: 2;
    width: 84px;
    min-width: 84px;
    box-shadow: -2px 0 0 rgba(0, 0, 0, 0.04);
  }
  :deep(thead th:nth-child(2)),
  :deep(tbody td:nth-child(2)) {
    white-space: normal;
    word-break: break-word;
  }
}
</style>
