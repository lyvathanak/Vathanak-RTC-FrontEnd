<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Scroll container -->
    <div
      ref="scrollRef"
      class="overflow-x-auto"
      :class="[compact ? 'text-[13px]' : 'text-sm', 'relative']">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Header -->
        <thead
          class="bg-gray-50 sticky top-0 z-10"
          :class="scrolled ? 'shadow-sm' : ''">
          <tr class="text-[11px] uppercase tracking-wide text-gray-500">
            <!-- Select all -->
            <th v-if="showSelection" class="w-12 px-3 py-3">
              <input
                ref="selectAllRef"
                type="checkbox"
                :checked="isAllSelected"
                @change="handleSelectAll"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30" />
            </th>

            <!-- columns -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              class="px-3 py-3 text-left font-semibold text-gray-600"
              :class="column.sortable ? 'cursor-pointer select-none' : ''"
              @click="column.sortable ? handleSort(column.key) : null">
              <div
                class="flex items-center gap-1.5 rounded-lg px-2 py-1 -mx-2 transition"
                :class="
                  column.sortable
                    ? 'hover:bg-gray-100 active:bg-gray-200/60'
                    : ''
                ">
                <span class="truncate">{{ column.label }}</span>

                <span
                  v-if="column.sortable"
                  class="inline-flex items-center gap-1 text-[10px] text-gray-400">
                  <span v-if="sortField === column.key">
                    {{ sortDirection === "asc" ? "↑" : "↓" }}
                  </span>
                  <span v-else class="opacity-0 group-hover:opacity-100"
                    >↕</span
                  >
                </span>
              </div>
            </th>

            <th
              v-if="showActions"
              class="px-3 py-3 text-left font-semibold text-gray-600">
              Action
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="totalColumns" class="px-3 py-14 text-center">
              <div class="flex flex-col items-center gap-3">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600" />
                <div class="text-sm text-gray-500">{{ loadingMessage }}</div>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="data.length === 0">
            <td :colspan="totalColumns" class="px-3 py-16 text-center">
              <div class="mx-auto max-w-md flex flex-col items-center gap-2">
                <div
                  class="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                  <!-- simple empty icon -->
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    class="h-6 w-6"
                    stroke="currentColor"
                    stroke-width="2">
                    <path d="M4 7h16M4 12h10M4 17h16" />
                  </svg>
                </div>

                <div class="text-sm font-semibold text-gray-800">
                  {{ emptyStateTitle }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ emptyStateMessage }}
                </div>
              </div>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-else
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            class="transition-colors"
            :class="[
              zebra && index % 2 === 1 ? 'bg-gray-50/40' : '',
              selectedIds.includes(getRowId(row))
                ? 'bg-blue-50/70'
                : 'hover:bg-gray-50',
            ]">
            <!-- selection checkbox -->
            <td v-if="showSelection" class="px-3 py-3 align-middle">
              <input
                type="checkbox"
                :value="getRowId(row)"
                :checked="selectedIds.includes(getRowId(row))"
                @change="handleRowSelect(getRowId(row))"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30" />
            </td>

            <!-- Dynamic Columns -->
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              class="px-3 py-3 text-gray-700 align-middle"
              :class="compact ? 'py-2.5' : 'py-3'">
              <slot
                :name="`column-${column.key}`"
                :row="row"
                :value="getValue(row, column.key)"
                :column="column"
                :index="index">
                <span
                  v-if="column.type === 'badge'"
                  :class="
                    getBadgeClass(getValue(row, column.key), column.badgeConfig)
                  ">
                  {{ formatValue(getValue(row, column.key), column) }}
                </span>

                <span v-else class="truncate block">
                  {{ formatValue(getValue(row, column.key), column) }}
                </span>
              </slot>
            </td>

            <!-- Actions -->
            <td v-if="showActions" class="px-3 py-3 align-middle">
              <div class="flex items-center gap-2">
                <button
                  v-if="showViewAction"
                  type="button"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  :title="viewActionTitle"
                  @click="$emit('view', row)">
                  <Eye class="size-4" />
                </button>

                <button
                  v-if="showEditAction"
                  type="button"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  :title="editActionTitle"
                  @click="$emit('edit', row)">
                  <Pencil class="size-4" />
                </button>

                <button
                  v-if="showCloneAction"
                  type="button"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-green-200 text-green-700 hover:bg-green-50 active:bg-green-100/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  :title="cloneActionTitle"
                  @click="$emit('clone', row)">
                  <Copy class="size-4" />
                </button>

                <!-- Delete dialog -->
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <button
                      v-if="showDeleteAction"
                      type="button"
                      class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100/60 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                      :title="deleteActionTitle">
                      <Trash2 class="size-4" />
                    </button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle :class="isKhmer ? 'khmer-text' : ''">
                        {{ $t("delete_item") }}
                      </AlertDialogTitle>
                      <AlertDialogDescription
                        :class="isKhmer ? 'khmer-text' : ''">
                        {{ $t("delete_item_confirm") }}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel :class="isKhmer ? 'khmer-text' : ''">
                        {{ $t("cancel") }}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        class="bg-red-600 hover:bg-red-700 text-white"
                        :class="isKhmer ? 'khmer-text' : ''"
                        @click="$emit('delete', row)">
                        {{ $t("delete") }}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <slot name="actions" :row="row" :index="index" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Optional footer: shows selection count (auto-hides if no selection feature) -->
    <div
      v-if="showSelection"
      class="border-t bg-white px-4 py-3 text-xs text-gray-600 flex items-center justify-between">
      <span>
        Selected:
        <span class="font-semibold text-gray-800">{{
          selectedIds.length
        }}</span>
        /
        <span class="font-semibold text-gray-800">{{ data.length }}</span>
      </span>

      <span class="text-gray-400">
        {{
          isIndeterminate
            ? "Partial selection"
            : isAllSelected
              ? "All selected"
              : ""
        }}
      </span>
    </div>
  </div>
</template>

<script setup>
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { computed, defineProps, defineEmits, ref, watch, onMounted } from "vue";
import { Eye, Pencil, Trash2, Copy } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
const isKhmer = computed(() => locale.value === "kh");

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },

  rowKey: { type: [String, Function], default: "id_card" },

  showSelection: { type: Boolean, default: false },
  selectedIds: { type: Array, default: () => [] },

  columns: { type: Array, required: true },

  sortField: { type: String, default: "" },
  sortDirection: {
    type: String,
    default: "asc",
    validator: (v) => ["asc", "desc"].includes(v),
  },

  showActions: { type: Boolean, default: true },
  showViewAction: { type: Boolean, default: true },
  showEditAction: { type: Boolean, default: true },
  showCloneAction: { type: Boolean, default: false },
  showDeleteAction: { type: Boolean, default: true },

  viewActionTitle: { type: String, default: "View details" },
  editActionTitle: { type: String, default: "Edit item" },
  cloneActionTitle: { type: String, default: "Clone item" },
  deleteActionTitle: { type: String, default: "Delete item" },

  emptyStateTitle: { type: String, default: "No data found" },
  emptyStateMessage: { type: String, default: "There is no data to display." },

  loadingMessage: { type: String, default: "Loading..." },

  // ✅ UI toggles (optional; safe defaults)
  zebra: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
});

const emit = defineEmits([
  "view",
  "edit",
  "clone",
  "delete",
  "select",
  "selectAll",
  "sort",
]);

const visibleColumns = computed(() =>
  props.columns.filter((c) => c.visible !== false),
);

const totalColumns = computed(() => {
  let count = visibleColumns.value.length;
  if (props.showSelection) count++;
  if (props.showActions) count++;
  return count;
});

const isAllSelected = computed(
  () => props.data.length > 0 && props.selectedIds.length === props.data.length,
);

const isIndeterminate = computed(
  () =>
    props.selectedIds.length > 0 &&
    props.selectedIds.length < props.data.length,
);

/** ✅ Fix indeterminate (Vue requires setting DOM property) */
const selectAllRef = ref(null);
watch(isIndeterminate, (val) => {
  if (selectAllRef.value) selectAllRef.value.indeterminate = val;
});

/** ✅ Sticky header shadow on scroll */
const scrollRef = ref(null);
const scrolled = ref(false);
onMounted(() => {
  const el = scrollRef.value;
  if (!el) return;
  const onScroll = () => (scrolled.value = el.scrollTop > 0);
  el.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

const getRowKey = (row, index) =>
  typeof props.rowKey === "function"
    ? props.rowKey(row, index)
    : row[props.rowKey] || index;

const getRowId = (row) =>
  typeof props.rowKey === "function" ? props.rowKey(row) : row[props.rowKey];

const getValue = (row, key) => key.split(".").reduce((obj, k) => obj?.[k], row);

const formatValue = (value, column) => {
  if (value === null || value === undefined) return "N/A";
  switch (column.type) {
    case "date":
      return formatDate(value);
    case "currency":
      return formatCurrency(value);
    case "number":
      return formatNumber(value);
    default:
      return value;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const formatCurrency = (amount) => {
  if (isNaN(amount)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatNumber = (number) => {
  if (isNaN(number)) return number;
  return new Intl.NumberFormat().format(number);
};

const getBadgeClass = (value, badgeConfig = {}) => {
  const base =
    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  if (badgeConfig.classes && badgeConfig.classes[value])
    return `${base} ${badgeConfig.classes[value]}`;
  return `${base} bg-gray-100 text-gray-800`;
};

const handleSelectAll = () =>
  emit("selectAll", isAllSelected.value ? [] : props.data.map(getRowId));
const handleRowSelect = (id) => emit("select", id);

const handleSort = (field) => {
  const column = props.columns.find((c) => c.key === field);
  if (!column || !column.sortable) return;
  const dir =
    props.sortField === field && props.sortDirection === "asc" ? "desc" : "asc";
  emit("sort", { field, direction: dir });
};

defineExpose({
  getValue,
  formatValue,
  formatDate,
  formatCurrency,
  formatNumber,
  getBadgeClass,
});
</script>

<style scoped>
/* Scrollbar */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
