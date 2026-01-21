<template>
  <div :class="['flex flex-col gap-4 py-5', locale === 'kh' ? 'khmer-text' : '']">

    <!-- ================= FILTERS CARD ================= -->
    <div class="px-3 sm:px-5">
      <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <!-- Header -->
        <div class="mb-4">
          <h2 class="text-base font-semibold text-gray-800">
            {{ t('student_filters') || 'Student Filters' }}
          </h2>
          <p class="text-sm text-gray-500">
            Filter students by name, program, year, and more
          </p>
        </div>

        <!-- Filters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">

          <!-- Name -->
          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              v-model="filters.userName"
              type="text"
              placeholder="Student name"
              class="filter-input pl-9"
            />
          </div>

          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input v-model="filters.program" type="text" placeholder="Program" class="filter-input" />
          </div>
          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input v-model="filters.academicYear" type="text" placeholder="Academic year" class="filter-input" />
          </div>
          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input v-model="filters.generation" type="text" placeholder="Generation" class="filter-input" />
          </div>
          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input v-model="filters.year" type="text" placeholder="Year" class="filter-input" />
          </div>
          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input v-model="filters.department" type="text" placeholder="Department" class="filter-input" />
          </div>
          <div class="relative">
            <Search
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input v-model="filters.group" type="text" placeholder="Group" class="filter-input" />
          </div>
        </div>
      </div>
    </div>

    <!-- ================= TOP BAR ================= -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 sm:px-5 gap-4 mb-2">

      <!-- Promote Button -->
      <button
        @click="openPromoteModal"
        :disabled="selectedRowIds.length === 0"
        class="inline-flex items-center justify-center gap-2 rounded-lg
               bg-[#235AA6] text-white px-4 py-2.5 transition
               disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
      >
        <Plus class="w-4 h-4" />
        {{ t('promote_students') }}
      </button>
    </div>

    <!-- ================= TABLE ================= -->
    <div class="overflow-x-auto px-5">
      <UserProgramsTable
        :data="pagedRows"
        :loading="loading"
        :selected-row-indexes="selectedRowIds"
        :start-index="(page - 1) * pageSize"
        @select="handleRowSelect"
        @selectAll="handleSelectAll"
      />
    </div>

    <!-- ================= PAGINATION ================= -->
    <div class="px-3 sm:px-5">
      <Pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="filteredRows.length"
        :page-size-options="[5, 10, 25, 50, 100]"
        :item-label="t('students')"
      />
    </div>

    <!-- ================= PROMOTE MODAL ================= -->
    <PromoteStudentForm
      v-model="showPromoteModal"
      :students="selectedStudentsForPromotion"
      @promote="handlePromoteStudents"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Plus, Search } from "lucide-vue-next";

import Pagination from "@/components/features/Pagination.vue";
import UserProgramsTable from "@/components/admins/StudentManagement/UserProgramsTable.vue";
import PromoteStudentForm from "@/components/admins/StudentManagement/PromoteStudentForm.vue";

import { UserProgramCRUD } from "@/stores/apis/UserProgramCRUD.js";
import { showNotification } from "@/lib/notifications.js";

const { t, locale } = useI18n();

/* -------------------- STATE -------------------- */
const rows = ref([]);
const loading = ref(false);

const selectedRowIds = ref([]);
const selectedStudentsForPromotion = ref([]);

const page = ref(1);
const pageSize = ref(25);
const showPromoteModal = ref(false);

/* -------------------- FILTERS -------------------- */
const filters = ref({
  userName: "",
  program: "",
  academicYear: "",
  generation: "",
  year: "",
  department: "",
  group: ""
});

/* -------------------- LOAD DATA -------------------- */
const loadUserPrograms = async () => {
  loading.value = true;
  try {
    const res = await UserProgramCRUD.getAllUserPrograms();
    rows.value = (res.data || []).map(r => ({
      ...r,
      user_detail: r.user_detail || {},
      program: {
        ...(r.program || {}),
        academic_year: r.program?.academic_year || "—",
        degree_level: r.program?.degree_level || "—",
        department_name: r.program?.department?.department_name || "—"
      },
      generation: r.generation || {},
      group: (r.group || []).map(g => ({
        ...g,
        sub_department: g.sub_department || { name: "N/A" }
      }))
    }));
  } catch (err) {
    console.error(err);
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadUserPrograms);

/* -------------------- FILTERING -------------------- */
const filteredRows = computed(() =>
  rows.value.filter(r =>
    (`${r.user_detail?.latin_name} ${r.user_detail?.khmer_name}`.toLowerCase().includes(filters.value.userName.toLowerCase())) &&
    (r.program?.program_name || "").toLowerCase().includes(filters.value.program.toLowerCase()) &&
    (r.program?.academic_year || "").toLowerCase().includes(filters.value.academicYear.toLowerCase()) &&
    `${r.generation?.number_gen || ""}`.includes(filters.value.generation) &&
    `${r.year || ""}`.includes(filters.value.year) &&
    (r.program?.department_name || "").toLowerCase().includes(filters.value.department.toLowerCase()) &&
    (filters.value.group === "" ||
      r.group?.some(g => g.name?.toLowerCase().includes(filters.value.group.toLowerCase())))
  )
);

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

/* -------------------- SELECTION -------------------- */
const handleRowSelect = (id) => {
  selectedRowIds.value.includes(id)
    ? selectedRowIds.value = selectedRowIds.value.filter(x => x !== id)
    : selectedRowIds.value.push(id);
};

const handleSelectAll = (ids) => {
  selectedRowIds.value = ids;
};

/* -------------------- MODAL -------------------- */
const openPromoteModal = () => {
  if (!selectedRowIds.value.length) {
    showNotification(t("select_at_least_one_student"), "warning");
    return;
  }

  const selected = rows.value.filter(r => selectedRowIds.value.includes(r.id));

  if (new Set(selected.map(s => s.program?.id)).size > 1) {
    showNotification(t("all_students_must_be_same_program"), "error");
    return;
  }

  if (new Set(selected.map(s => s.program?.academic_year)).size > 1) {
    showNotification(t("all_students_must_be_same_academic_year"), "error");
    return;
  }

  selectedStudentsForPromotion.value = selected;
  showPromoteModal.value = true;
};

/* -------------------- PROMOTION -------------------- */
const handlePromoteStudents = async ({ newProgramId, generationId }) => {
  try {
    if (!newProgramId) {
      showNotification(t("select_program"), "warning");
      return;
    }

    const userIds = selectedStudentsForPromotion.value
      .map(s => s.user_detail?.user_id)
      .filter(Boolean);

    if (!userIds.length) {
      showNotification(t("no_students_selected"), "error");
      return;
    }

    const payload = {
      user_ids: userIds,
      program_id: newProgramId,
      generation_id: generationId ?? null
    };

    const res = await UserProgramCRUD.promoteMultipleStudents(payload);

    if (res?.created_count) {
      showNotification(
        `${res.created_count} student(s) promoted successfully 🎉`,
        "success"
      );
    }

    if (res?.skipped_count) {
      showNotification(
        t("some_students_already_promoted"),
        "warning"
      );
    }

    selectedRowIds.value = [];
    selectedStudentsForPromotion.value = [];

    await loadUserPrograms();
  } catch (err) {
    console.error(err);
    showNotification(t("error_promoting_students"), "error");
  } finally {
    showPromoteModal.value = false;
  }
};

</script>

<style scoped>
.khmer-text {
  font-size: 14px;
}

/* Reusable input style (Tailwind v4 SAFE) */
.filter-input {
  width: 100%;
  min-height: 40px;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
</style>
