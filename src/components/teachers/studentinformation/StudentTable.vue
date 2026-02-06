<template>
  <ListTable
    :data="students"
    :loading="loading"
    :show-selection="showSelection"
    :selected-ids="selectedIds"
    :columns="columns"
    :sort-field="sortField"
    :sort-direction="sortDirection"
    :show-actions="showActions"
    :show-view-action="showViewAction"
    :show-edit-action="showEditAction"
    :show-delete-action="showDeleteAction"
    :view-action-title="viewActionTitle"
    :edit-action-title="editActionTitle"
    :delete-action-title="deleteActionTitle"
    :empty-state-title="emptyStateTitle"
    :empty-state-message="emptyStateMessage"
    :loading-message="loadingMessage"
    row-key="id"
    @view="$emit('view', $event)"
    @edit="$emit('edit', $event)"
    @delete="$emit('delete', $event)"
    @select="$emit('select', $event)"
    @selectAll="$emit('selectAll', $event)"
    @sort="$emit('sort', $event)">
    <!-- ID Card -->
    <template #column-id_card="{ value }">
      <span class="font-semibold text-gray-800 tracking-wide">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Khmer name -->
    <template #column-khmer_name="{ value }">
      <div class="min-w-0">
        <div class="font-semibold text-gray-900 khmer-text truncate">
          {{ value || "N/A" }}
        </div>
        <div class="text-xs text-gray-500 mt-0.5">Khmer name</div>
      </div>
    </template>

    <!-- Latin Name -->
    <template #column-latin_name="{ value, row }">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 flex items-center justify-center font-bold text-xs shrink-0">
          {{ getInitials(row?.latin_name || value) }}
        </div>

        <div class="min-w-0">
          <div class="font-semibold text-gray-900 truncate">
            {{ value || "N/A" }}
          </div>
          <div class="text-xs text-gray-500 mt-0.5">Latin name</div>
        </div>
      </div>
    </template>

    <!-- Gender -->
    <template #column-gender="{ value }">
      <span
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset"
        :class="
          value?.toLowerCase() === 'male'
            ? 'bg-blue-50 text-blue-700 ring-blue-200'
            : value?.toLowerCase() === 'female'
              ? 'bg-pink-50 text-pink-700 ring-pink-200'
              : 'bg-gray-50 text-gray-700 ring-gray-200'
        ">
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="
            value?.toLowerCase() === 'male'
              ? 'bg-blue-600'
              : value?.toLowerCase() === 'female'
                ? 'bg-pink-600'
                : 'bg-gray-500'
          " />
        {{ getGenderLabel(value) }}
      </span>
    </template>

    <!-- Date of Birth -->
    <template #column-date_of_birth="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
        :class="
          formatDate(value) === 'N/A'
            ? 'bg-gray-50 text-gray-400 ring-1 ring-gray-200'
            : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
        ">
        {{ formatDate(value) }}
      </span>
    </template>

    <!-- Phone -->
    <template #column-phone_number="{ value }">
      <span
        class="inline-flex items-center gap-2 font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 ring-1 ring-gray-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Email -->
    <template #column-email="{ value }">
      <a
        v-if="value"
        class="text-blue-600 hover:text-blue-700 hover:underline font-medium truncate block max-w-55"
        :href="`mailto:${value}`"
        @click.stop>
        {{ value }}
      </a>
      <span v-else class="text-gray-400">N/A</span>
    </template>

    <!-- ✅ Department name from API -->
    <template #column-department_name="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold ring-1 ring-inset ring-blue-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- ✅ Section name from API -->
    <template #column-section_name="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-inset ring-indigo-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Academic Year -->
    <template #column-academic_year="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold ring-1 ring-inset ring-green-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- ✅ Program name from API -->
    <template #column-program_name="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold ring-1 ring-inset ring-purple-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Grade -->
    <template #column-grade="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-inset ring-amber-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Custom actions -->
    <template #actions="{ row, index }">
      <slot name="actions" :row="row" :index="index" />
    </template>
  </ListTable>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import ListTable from "@/components/features/ListTable.vue";

defineProps({
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },

  showSelection: { type: Boolean, default: true },
  selectedIds: { type: Array, default: () => [] },

  columns: {
    type: Array,
    default: () => [
      { key: "id_card", label: "ID Card", visible: true, sortable: true },
      { key: "khmer_name", label: "Khmer Name", visible: true, sortable: true },
      { key: "latin_name", label: "Latin Name", visible: true, sortable: true },
      { key: "gender", label: "Gender", visible: true, sortable: true },
      {
        key: "date_of_birth",
        label: "Date of Birth",
        visible: true,
        sortable: true,
        type: "date",
      },
      { key: "phone_number", label: "Phone", visible: true, sortable: true },
      { key: "email", label: "Email", visible: true, sortable: true },

      // ✅ Use name fields (Teacher API)
      {
        key: "department_name",
        label: "Department",
        visible: true,
        sortable: true,
      },
      { key: "section_name", label: "Section", visible: true, sortable: true },
      {
        key: "academic_year",
        label: "Academic Year",
        visible: true,
        sortable: true,
      },
      { key: "program_name", label: "Program", visible: true, sortable: true },

      { key: "grade", label: "Grade", visible: true, sortable: true },
    ],
  },

  sortField: { type: String, default: "" },
  sortDirection: { type: String, default: "asc" },

  showActions: { type: Boolean, default: true },
  showViewAction: { type: Boolean, default: true },
  showEditAction: { type: Boolean, default: true },
  showDeleteAction: { type: Boolean, default: true },

  viewActionTitle: { type: String, default: "View student details" },
  editActionTitle: { type: String, default: "Edit student" },
  deleteActionTitle: { type: String, default: "Delete student" },

  emptyStateTitle: { type: String, default: "No students found" },
  emptyStateMessage: {
    type: String,
    default:
      "There are no students to display. Try adjusting your filters or add some students.",
  },

  loadingMessage: { type: String, default: "Loading students..." },
});

defineEmits(["view", "edit", "delete", "select", "selectAll", "sort"]);

// Helpers
function formatDate(dateString) {
  if (!dateString) return "N/A";

  // "DD-MM-YYYY"
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [dd, mm, yyyy] = dateString.split("-");
    const date = new Date(`${yyyy}-${mm}-${dd}`);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return "N/A";
  }

  // "DD-MM-YYYY HH:mm:ss"
  if (/^\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    const [d, t] = dateString.split(" ");
    const [dd, mm, yyyy] = d.split("-");
    const date = new Date(`${yyyy}-${mm}-${dd}T${t}`);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return "N/A";
  }

  // ISO fallback
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getGenderLabel(gender) {
  const g = (gender || "").toString().toLowerCase();
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  return gender || "N/A";
}

function getInitials(name) {
  const n = (name || "").toString().trim();
  if (!n) return "NA";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
</script>
