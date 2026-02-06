<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <!-- Header -->
    <PageHeader
      :title="t('subjects_management')"
      subtitle="Track and manage your subject applications">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="h-10 inline-flex items-center gap-2 rounded-lg bg-[#235AA6] px-4 text-white font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235AA6]"
          @click.stop.prevent="openAddModal">
          <Plus class="h-4 w-4" />
          <span class="text-sm">Add Subject</span>
        </button>

        <button
          type="button"
          class="h-10 inline-flex items-center gap-2 rounded-lg bg-[#235AA6] px-4 text-white font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235AA6] disabled:opacity-60"
          :disabled="exporting || loading"
          @click.stop.prevent="exportData">
          <span
            v-if="exporting"
            class="inline-block h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
          <Download v-else class="h-4 w-4" />
          <span class="text-sm">{{ exporting ? "Exporting…" : "Export" }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Search -->
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div class="relative w-full md:w-md">
        <!-- Search icon -->
        <Search
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        <!-- Input -->
        <input
          v-model="search"
          type="text"
          placeholder="Search subjects code, name…"
          class="h-10 w-full rounded-xl border px-10 pr-10 outline-none focus:ring-2 focus:ring-[#235AA6]"
          @input="debouncedFetch()" />

        <!-- Clear button -->
        <button
          v-if="search"
          type="button"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search">
          ✕
        </button>
      </div>
    </div>

    <!-- Filters -->
    <SubjectFilters
      v-model="filters"
      :loading-ref-data="loadingRefData"
      :departments-with-programs="departmentsWithPrograms"
      :filtered-program-options="filteredProgramOptions"
      :filtered-academic-options="filteredAcademicOptions"
      @dept-change="onDeptFilterChange"
      @program-change="onProgramFilterChange"
      @clear="clearAllFilters" />

    <!-- Table -->
    <SubjectTable
      :subjects="subjects"
      :loading="loading"
      :deleting-id="deletingId"
      :format-credit="formatCredit"
      :format-hour="formatHour"
      :program-name-from-subject="programNameFromSubject"
      :department-name-from-subject="departmentNameFromSubject"
      @view="viewSubject"
      @edit="editSubject"
      @ask-delete="(s) => (subjectToDelete = s)"
      @confirm-delete="confirmDelete" />

    <!-- Pagination -->
    <div class="px-3 sm:px-5">
      <Pagination
        class="mx-auto"
        :current-page="page"
        :page-size="pageSize"
        :total-items="meta.total"
        :page-size-options="[10, 25, 50, 100]"
        item-label="subjects"
        @update:current-page="page = $event"
        @update:pageSize="(v) => (pageSize = Number(v) || 10)"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange" />
    </div>

    <!-- Modals -->
    <AddSubject v-model="openAdd" @created="onCreated" />
    <ViewSubject
      v-model="openView"
      :subject="activeSubject"
      @edit="onEditFromView"
      @updated="onUpdated" />
    <EditSubject
      :key="activeSubject?.id || 'edit'"
      v-model="openEdit"
      :subject="activeSubject"
      @updated="onUpdated" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import {
  Plus,
  Download,
  Search,
  Building2,
  GraduationCap,
  ChevronDown,
  Loader2,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { useSubject } from "@/stores/global/useSubject.js";
import PageHeader from "@/components/features/PageHeader.vue";
import Pagination from "@/components/features/Pagination.vue";
import SubjectTable from "@/components/admins/SubjectManagement/SubjectTable.vue";
import AddSubject from "@/components/admins/SubjectManagement/AddSubject.vue";
import ViewSubject from "@/components/admins/SubjectManagement/ViewSubject.vue";
import EditSubject from "@/components/admins/SubjectManagement/EditSubject.vue";
import SubjectFilters from "@/components/admins/SubjectManagement/SubjectFilters.vue";

const { t } = useI18n();
function clearSearch() {
  search.value = ""; 
  debouncedFetch();
}

const {
  loading,
  exporting,
  subjects,
  meta,
  page,
  pageSize,
  search,
  filters,

  loadingRefData,
  departmentsWithPrograms,
  filteredProgramOptions,
  filteredAcademicOptions, // ✅ add this

  subjectToDelete,
  deletingId,

  formatCredit,
  formatHour,
  programNameFromSubject,
  departmentNameFromSubject,

  fetchRefData,
  fetchSubjects,
  onDeptFilterChange,
  onProgramFilterChange, // ✅ add this
  clearAllFilters, // ✅ add this
  confirmDelete,
  exportData,
  handlePageChange,
  handlePageSizeChange,
  debouncedFetch,
} = useSubject();

/* modals */
const openAdd = ref(false);
const openView = ref(false);
const openEdit = ref(false);
const activeSubject = ref({});

function openAddModal() {
  openAdd.value = true;
}

function onCreated() {
  fetchSubjects(1);
}

function viewSubject(s) {
  activeSubject.value = { ...s };
  nextTick(() => (openView.value = true));
}

function editSubject(s) {
  activeSubject.value = { ...s };
  nextTick(() => (openEdit.value = true));
}

function onEditFromView(s) {
  activeSubject.value = { ...(s || activeSubject.value) };
  openView.value = false;
  nextTick(() => (openEdit.value = true));
}

function onUpdated() {
  fetchSubjects(page.value);
}

onMounted(async () => {
  try {
    await fetchRefData();
    await fetchSubjects(1);
  } catch (e) {
    console.error("SubjectManagement mounted error:", e);
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
select:focus + svg {
  color: #235aa6;
}
</style>
