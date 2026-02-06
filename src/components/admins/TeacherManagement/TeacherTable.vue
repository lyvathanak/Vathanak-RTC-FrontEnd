<template>
  <ListTable
    :data="teachers"
    :loading="loading"
    :selected-ids="selectedIds"
    :columns="columnsToUse"
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
    @sort="$emit('sort', $event)">
    <!-- ID -->
    <template #column-id_card="{ value }">
      <span class="font-semibold text-gray-900 tracking-wide">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Khmer Name (premium) -->
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

    <!-- Email (clickable + nicer) -->
    <template #column-email="{ value }">
      <a
        v-if="value"
        class="font-medium text-blue-600 hover:text-blue-700 hover:underline truncate block max-w-60"
        :href="`mailto:${value}`"
        @click.stop>
        {{ value }}
      </a>
      <span v-else class="text-gray-400">N/A</span>
    </template>

    <!-- Phone (pill style) -->
    <template #column-phone_number="{ value }">
      <span
        class="inline-flex items-center gap-2 font-mono text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 ring-1 ring-gray-200">
        {{ formatPhone(value) }}
      </span>
    </template>

    <!-- Department (badge premium) -->
    <template #column-department="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold ring-1 ring-inset ring-purple-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Program (badge premium) -->
    <template #column-program="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-inset ring-emerald-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Section (badge premium) -->
    <template #column-section="{ value }">
      <span
        class="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-inset ring-indigo-200">
        {{ value || "N/A" }}
      </span>
    </template>

    <!-- Custom Actions Slot -->
    <template #actions="{ row, index }">
      <slot name="actions" :row="row" :index="index" />
    </template>
  </ListTable>
</template>

<script setup>
import { defineProps, defineEmits, computed, watchEffect } from "vue";
import ListTable from "@/components/features/ListTable.vue";

// Props
const props = defineProps({
  // Data props
  teachers: {
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
      { key: "id_card", label: "ID", visible: true, sortable: true },
      {
        key: "khmer_name",
        label: "Khmer Fullname",
        visible: true,
        sortable: true,
      },
      {
        key: "latin_name",
        label: "Latin Fullname",
        visible: true,
        sortable: true,
      },

      { key: "gender", label: "Gender", visible: true, sortable: true },
      { key: "email", label: "Email", visible: true, sortable: true },
      { key: "phone_number", label: "Phone", visible: true, sortable: false },

      { key: "department", label: "Department", visible: true, sortable: true },

      // ✅ NEW
      { key: "program", label: "Program", visible: true, sortable: true },

      // ✅ already have, keep it
      { key: "section", label: "Section", visible: true, sortable: true },
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
    default: "View teacher details",
  },
  editActionTitle: {
    type: String,
    default: "Edit teacher",
  },
  deleteActionTitle: {
    type: String,
    default: "Delete teacher",
  },

  // Empty state customization
  emptyStateTitle: {
    type: String,
    default: "No teachers found",
  },
  emptyStateMessage: {
    type: String,
    default:
      "There are no teachers to display. Try adjusting your filters or add some teachers.",
  },

  // Loading message
  loadingMessage: {
    type: String,
    default: "Loading teachers...",
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

const columnsToUse = computed(() => {
  const cols = Array.isArray(props.columns) ? [...props.columns] : [];

  if (!cols.some((c) => c.key === "gender")) {
    const latinIndex = cols.findIndex((c) => c.key === "latin_name");
    const insertAt = latinIndex >= 0 ? latinIndex + 1 : 3;

    cols.splice(insertAt, 0, {
      key: "gender",
      label: "Gender",
      visible: true,
      sortable: true,
    });
  }

  return cols;
});
// Helper methods (teacher-specific formatting)
const getInitials = (name) => {
  if (!name) return "T";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const getStatusBadgeClass = (status) => {
  const classes = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Suspended: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
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

const formatPhone = (phone) => {
  if (!phone) return "N/A";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 8) return phone; // keep original
  // simple grouping for KH: 3-3-3 or fallback
  if (digits.length === 9)
    return digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  if (digits.length === 10)
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  return phone;
};
watchEffect(() => console.log("StudentTable columns:", props.columns));
// Expose methods for parent component
defineExpose({
  getInitials,
  getStatusBadgeClass,
  formatPhone,
  getGenderLabel,
});
</script>
