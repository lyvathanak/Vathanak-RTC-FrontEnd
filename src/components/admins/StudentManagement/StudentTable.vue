student Management
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
        <!-- avatar initials -->
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

    <!-- Department -->
    <template #column-department_id="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold ring-1 ring-inset ring-blue-200">
        {{ getDepartmentName(value) }}
      </span>
    </template>

    <!-- Section -->
    <template #column-sub_department_id="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-inset ring-indigo-200">
        {{ getSectionName(value) }}
      </span>
    </template>

    <!-- Academic Year -->
    <template #column-academic_year="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold ring-1 ring-inset ring-green-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- ✅ Program (FIXED SLOT NAME) -->
    <template #column-program_id="{ value }">
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

// Props
const props = defineProps({
  // Data props
  students: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },

  // Selection props
  showSelection: {
    type: Boolean,
    default: true,
  },
  selectedIds: {
    type: Array,
    default: () => [],
  },

  // Column configuration
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
      { key: "phone_number", label: "Phone", visible: true, sortable: true }, // Changed from phone
      { key: "email", label: "Email", visible: true, sortable: true },
      {
        key: "department_id",
        label: "Department",
        visible: true,
        sortable: true,
      }, // Changed from department
      {
        key: "sub_department_id",
        label: "Section",
        visible: true,
        sortable: true,
      }, // Changed from section
      {
        key: "academic_year",
        label: "Academic Year",
        visible: true,
        sortable: true,
      },
      { key: "program_id", label: "Program", visible: true, sortable: true }, // Changed from degree to program_id
      { key: "grade", label: "Grade", visible: true, sortable: true },
    ],
  },

  // Sorting props
  sortField: {
    type: String,
    default: "",
  },
  sortDirection: {
    type: String,
    default: "asc",
    validator: (value) => ["asc", "desc"].includes(value),
  },

  // Action props
  showActions: {
    type: Boolean,
    default: true,
  },
  showViewAction: {
    type: Boolean,
    default: true,
  },
  showEditAction: {
    type: Boolean,
    default: true,
  },
  showDeleteAction: {
    type: Boolean,
    default: true,
  },

  // Action titles (for accessibility)
  viewActionTitle: {
    type: String,
    default: "View student details",
  },
  editActionTitle: {
    type: String,
    default: "Edit student",
  },
  deleteActionTitle: {
    type: String,
    default: "Delete student",
  },

  // Empty state customization
  emptyStateTitle: {
    type: String,
    default: "No students found",
  },
  emptyStateMessage: {
    type: String,
    default:
      "There are no students to display. Try adjusting your filters or add some students.",
  },

  // Loading message
  loadingMessage: {
    type: String,
    default: "Loading students...",
  },
});

// Emits
const emit = defineEmits([
  "view",
  "edit",
  "delete",
  "select",
  "selectAll",
  "sort",
]);

import { ref, onMounted } from "vue";
import { useDepartment } from "@/stores/global/useDepartment";
import { useSection } from "@/stores/global/useSection";

// Use composables for department and section data
const { departments, getAllDepartments, getDepartmentById } = useDepartment();
const { sections, getAllSections, getSectionById } = useSection();

// Fetch data on component mount
onMounted(async () => {
  try {
    await Promise.all([getAllDepartments(), getAllSections()]);
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
});

// Department name lookup
const getDepartmentName = (id) => {
  const dept = getDepartmentById(id);
  return dept ? dept.department_name : "N/A";
};

// Section name lookup
const getSectionName = (id) => {
  const section = getSectionById(id);
  return section ? section.name : "N/A";
};

// Helper methods (student-specific formatting)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  // handle "DD-MM-YYYY"
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [dd, mm, yyyy] = dateString.split("-");
    const date = new Date(`${yyyy}-${mm}-${dd}`); // convert to ISO-like
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return "N/A";
  }

  // handle "DD-MM-YYYY HH:mm:ss"
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

  // fallback for ISO strings
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getGenderLabel = (gender) => {
  const labels = {
    Male: "Male",
    Female: "Female",
    male: "Male",
    female: "Female",
  };
  return labels[gender] || gender || "N/A";
};

const getGenderBadgeClass = (gender) => {
  const classes = {
    Male: "bg-blue-100 text-blue-800",
    Female: "bg-pink-100 text-pink-800",
    male: "bg-blue-100 text-blue-800",
    female: "bg-pink-100 text-pink-800",
  };
  return classes[gender] || "bg-gray-100 text-gray-800";
};

const getInitials = (name) => {
  const n = (name || "").toString().trim();
  if (!n) return "NA";

  const parts = n.split(/\s+/).filter(Boolean);

  // If only one word => first 2 letters
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  // If multiple words => first letter of first + last
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
};

// Expose methods for parent component
defineExpose({
  formatDate,
  getGenderLabel,
  getGenderBadgeClass,
  getDepartmentName,
  getSectionName,
  getInitials,
});
</script>
