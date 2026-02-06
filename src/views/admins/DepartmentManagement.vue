<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <!-- Top bar -->

    <PageHeader
      :title="t('department_management')"
      subtitle="Track and manage your department applications">
      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="onAdd"
          class="h-10 inline-flex items-center gap-2 rounded-lg bg-[#235AA6] text-white px-4 font-semibold hover:bg-[#1f4f93] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#235AA6]">
          <Plus class="w-4 h-4" /><span class="text-sm">Add Department</span>
        </button>

        <button
          :disabled="exporting || loading"
          @click="onExport"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 border bg-[#235AA6] text-white border-gray-300 rounded-lg hover:bg-[#1f4f93] transition-colors text-sm font-medium focus:ring-[#235AA6]">
          <Download class="w-4 h-4" /><span class="text-sm">{{
            exporting ? "Exporting…" : "Export"
          }}</span>
        </button>
      </div>
    </PageHeader>

    <DepartmentFilter v-model="filters" @clear="loadAll" />

    <!-- Listing -->
    <div>
      <DepartmentTable
        :rows="pagedRows"
        :loading="loading"
        :deleting-id="deletingId"
        :empty-text="emptyText"
        @view="onView"
        @edit="onEdit"
        @delete="requestDelete" />
    </div>

    <!-- Pagination -->
    <div class="">
      <Pagination
        class="mx-auto"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total-items="pagedTotal"
        :page-size-options="[5, 10, 25, 50, 100]"
        item-label="Departments"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange" />
    </div>

    <!-- Delete dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @keydown.esc.prevent="closeDeleteDialog">
      <div
        class="bg-white w/full max-w-sm rounded-xl shadow-xl p-6"
        role="dialog"
        aria-modal="true">
        <div class="flex items-center gap-3 mb-3">
          <h3 class="text-lg font-semibold text-gray-900">Confirm Delete</h3>
        </div>
        <p class="text-sm text-gray-600 mb-6">
          Are you sure you want to delete
          <span class="font-medium">{{ deletingItem?.department_name }}</span
          >? This action cannot be undone.
        </p>
        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            @click="closeDeleteDialog"
            :disabled="deletingId === deletingItem?.id">
            Cancel
          </button>
          <button
            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            @click="confirmDelete"
            :disabled="deletingId === deletingItem?.id">
            {{ deletingId === deletingItem?.id ? "Deleting…" : "Delete" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddDepartmentModal v-model="showAdd" @saved="handleDeptSaved" />
    <EditDepartmentModal
      v-model="showEdit"
      :department="editRow"
      @saved="loadAll" />

    <ViewDepartmentModal
      :model-value="isViewOpen"
      :department="viewRow"
      @update:modelValue="
        (val) => {
          if (!val) closeView();
        }
      "
      @saved="handleViewSaved" />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  watchEffect,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";
import { Plus, Download, Search, Eye, Trash2 } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/features/PageHeader.vue";
import Pagination from "@/components/features/Pagination.vue";
import AddDepartmentModal from "@/components/admins/department/AddDepartmentModal.vue";
import ViewDepartmentModal from "@/components/admins/department/ViewDepartmentModal.vue";
import EditDepartmentModal from "@/components/admins/department/EditDepartmentModal.vue";
import DepartmentTable from "@/components/admins/department/DepartmentTable.vue";
import DepartmentFilter from "@/components/admins/department/DepartmentFilter.vue";

const { t } = useI18n();

/* Router */
const route = useRoute();
const router = useRouter();

/* State */
const loading = ref(false);
const error = ref(null);
const raw = ref([]);

const search = ref("");
const page = ref(1);
const pageSize = ref(10);
const deletingId = ref(null);
const exporting = ref(false);

const showAdd = ref(false);
const showEdit = ref(false);
const editRow = ref(null);

const showDeleteDialog = ref(false);
const deletingItem = ref(null);

/* View modal (route-driven) */
const isViewOpen = computed(() => !!route.params.deptId);
const viewRow = ref(null);
function onView(d) {
  router.push({
    name: "AdminDepartmentDetails",
    params: { lang: route.params.lang, deptId: d.id },
  });
}
function closeView() {
  router.push({
    name: "AdminDepartmentManagement",
    params: { lang: route.params.lang },
  });
}

function onEdit(d) {
  editRow.value = d?._raw ?? d; // prefer raw backend object if you stored it
  showEdit.value = true;
}

const filters = ref({
  search: "",
  head: "",
  createdSort: "",
  status: "",
});

watchEffect(() => {
  const id = route.params.deptId;
  if (!id) {
    viewRow.value = null;
    return;
  }
  const found = raw.value.find((r) => String(r.id) === String(id));
  viewRow.value = found?._raw ?? found ?? null;
});

/* Normalizer */
function toRow(it) {
  return {
    id: it.id,

    // ✅ match table field
    department_name: it.department_name ?? it.name ?? "",

    description: it.description ?? "",

    // ✅ match table field (object {name,email} or null)
    head_of_department: it.head_of_department ?? null,

    // ✅ match table field (string in DD-MM-YYYY HH:mm:ss)
    created_at: it.created_at ?? "",

    // optional if you want later
    updated_at: it.updated_at ?? "",

    // keep raw backend object
    _raw: it,
  };
}

/* Loaders */
async function loadAll() {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/managements/get_all_department");
    const arr = Array.isArray(data?.all_department) ? data.all_department : [];
    raw.value = arr.map(toRow);

    if (!raw.value.length) {
      error.value = "No departments found.";
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || "Load failed";
    error.value = msg;
    raw.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadSearch(q) {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get("/managements/search_department", {
      params: { search: q },
    });
    const arr = Array.isArray(data?.departments?.data)
      ? data.departments.data
      : [];
    raw.value = arr.map(toRow);
    if (!raw.value.length) {
      error.value = `No results for "${q}".`;
    }
  } catch (e) {
    const msg = e?.response?.data?.message || e?.message || "Search failed";
    error.value = msg;
    raw.value = [];
  } finally {
    loading.value = false;
  }
}

/* Choose endpoint */
async function load() {
  const q = (filters.value.search || "").trim();
  page.value = 1;
  if (q) return loadSearch(q);
  return loadAll();
}

onMounted(load);

/* Debounce search */
let searchTimer;
watch(
  () => filters.value.search,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(load, 300);
  },
);
function parseDMYDateTime(value) {
  if (!value || typeof value !== "string") return null;
  const [datePart, timePart] = value.split(" ");
  const [dd, mm, yyyy] = (datePart || "").split("-").map(Number);
  if (!dd || !mm || !yyyy) return null;

  const [hh = 0, mi = 0, ss = 0] = (timePart || "").split(":").map(Number);
  const d = new Date(yyyy, mm - 1, dd, hh, mi, ss);
  return Number.isNaN(d.getTime()) ? null : d;
}
function isAssignedHead(head) {
  if (!head) return false; // null/undefined
  // treat empty object as NOT assigned
  if (typeof head === "object") {
    return !!(head.id || head.name || head.email);
  }
  // if API returns string name/id
  return String(head).trim().length > 0;
}

const filteredRows = computed(() => {
  let rows = raw.value.slice();

  // Head filter
  if (filters.value.head === "assigned") {
    rows = rows.filter((r) => isAssignedHead(r.head_of_department));
  } else if (filters.value.head === "unassigned") {
    rows = rows.filter((r) => !isAssignedHead(r.head_of_department));
  }

  // Optional: Created sort (you already have parseDMYDateTime)
  if (filters.value.createdSort === "new") {
    rows.sort(
      (a, b) =>
        (parseDMYDateTime(b.created_at)?.getTime() || 0) -
        (parseDMYDateTime(a.created_at)?.getTime() || 0),
    );
  } else if (filters.value.createdSort === "old") {
    rows.sort(
      (a, b) =>
        (parseDMYDateTime(a.created_at)?.getTime() || 0) -
        (parseDMYDateTime(b.created_at)?.getTime() || 0),
    );
  }

  return rows;
});

/* Pagination */
const pagedTotal = computed(() => filteredRows.value.length);
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});
function handlePageChange() {
  /* slicing handled by computed */
}
function handlePageSizeChange() {
  page.value = 1;
}

/* keep page valid if data shrinks or size changes */
watch(
  () => filteredRows.value.length,
  () => {
    if ((page.value - 1) * pageSize.value >= raw.value.length) page.value = 1;
  },
);
watch(pageSize, () => {
  page.value = 1;
});

/* Create */
function onAdd() {
  showAdd.value = true;
}
async function handleDeptSaved(payload) {
  // close modal
  showAdd.value = false;
  // optimistic insert to top if payload provided
  if (payload?.id) raw.value.unshift(toRow(payload));
  page.value = 1;
  // single success toast (child stays silent)
  showNotification("Department created successfully!", "success");
  // sync with server
  await loadAll();
}

/* If View modal edits & emits "saved" */
async function handleViewSaved() {
  await loadAll();
  showNotification("Department updated successfully!", "success");
}

/* Delete */
function requestDelete(d) {
  deletingItem.value = d;
  showDeleteDialog.value = true;
}
function closeDeleteDialog() {
  showDeleteDialog.value = false;
  deletingItem.value = null;
}

async function confirmDelete() {
  const d = deletingItem.value;
  if (!d) return;
  deletingId.value = d.id;
  error.value = null;
  try {
    await api.delete(`/managements/delete_department/${d.id}`);
    raw.value = raw.value.filter((row) => row.id !== d.id);
    closeDeleteDialog();
    showNotification("Department deleted successfully!", "success");
  } catch (e) {
    const msg = `Delete failed: ${
      e?.response?.data?.message || e?.message || "Unknown error"
    }`;
    error.value = msg;
    showNotification(msg, "error");
  } finally {
    deletingId.value = null;
  }
}

/* Export */
function onExport() {
  try {
    exporting.value = true;
    const rows = pagedRows.value;
    if (!rows.length) {
      showNotification("Nothing to export.", "warning");
      return;
    }
    const headers = [
      "Department ID",
      "Code",
      "Department",
      "Description",
      "Program",
      "Head of Department",
      "Status",
    ];
    const csvRows = [headers];
    for (const r of rows) {
      csvRows.push([
        r.id,
        r.code ?? "",
        sanitizeCSV(r.department_name),
        sanitizeCSV(r.description),
        sanitizeCSV(r.__program),
        sanitizeCSV(r.head_of_department?.name || "Not assigned"),
        r.__status,
      ]);
    }
    const csv = csvRows.map((r) => r.map(fieldToCSV).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dt = new Date();
    const ts = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(
      2,
      "0",
    )}${String(dt.getDate()).padStart(2, "0")}_${String(dt.getHours()).padStart(
      2,
      "0",
    )}${String(dt.getMinutes()).padStart(2, "0")}`;
    a.href = url;
    a.download = `departments_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification(
      `Exported ${rows.length} department${rows.length > 1 ? "s" : ""}.`,
      "success",
    );
  } finally {
    exporting.value = false;
  }
}
function sanitizeCSV(v) {
  return v == null ? "" : String(v);
}
function fieldToCSV(v) {
  const s = String(v ?? "");
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/* Misc */
const openChip = ref(null);
function handleClickOutside(e) {
  const inMenuOrChip = e.target.closest(".rounded-lg.shadow-lg, .rounded-full");
  if (!inMenuOrChip) openChip.value = null;
}

const emptyText = computed(() =>
  (filters.value.search || "").trim()
    ? `No results for "${filters.value.search.trim()}".`
    : "No departments found.",
);

onMounted(() => document.addEventListener("click", handleClickOutside, true));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside, true),
);

onMounted(() => {
  filters.value = {
    search: "",
    head: "", // ✅ show all
    createdSort: "",
    status: "",
  };
  loadAll();
});
</script>

<style scoped>
.table-scroll {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}
.dept-table {
  table-layout: auto;
}

/* Sticky edges */
.sticky-left {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 2px 0 0 rgba(0, 0, 0, 0.04);
}
.sticky-right {
  position: sticky;
  right: 0;
  z-index: 2;
  background: #fff;
  box-shadow: -2px 0 0 rgba(0, 0, 0, 0.04);
}

/* Column helpers */
.col-name {
  white-space: normal;
  word-break: break-word;
}

/* Multi-line name (max 3 lines, then ellipsis) */
.name-3lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.25;
}

/* Description: single-line ellipsis */
.desc-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Phones / narrow */
@media (max-width: 768px) {
  .dept-table th,
  .dept-table td {
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .col-name {
    min-width: 320px;
  }
}

/* Very small */
@media (max-width: 380px) {
  .dept-table {
    min-width: 0;
  }
  .col-name {
    min-width: 0;
  }
  .dept-table th,
  .dept-table td {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
