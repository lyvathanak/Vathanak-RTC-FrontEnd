<template>
  <section
    class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-5 sm:px-6 py-5 border-b border-gray-100">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-extrabold text-gray-900">
            Filters
          </h2>
          <p class="text-sm text-gray-500 mt-1">Refine results by criteria</p>
        </div>
        <button
          type="button"
          @click="reset"
          :disabled="disabledClear"
          :class="[
            'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold transition active:scale-[0.99]',
            disabledClear
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-red-200 text-red-600 hover:bg-red-50',
          ]">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="px-5 sm:px-6 py-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <!-- Search -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">Search</label>
          <div class="relative">
            <Search
              class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              :value="search"
              @input="onSearchInput"
              type="text"
              :placeholder="placeholder"
              class="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 pr-10 text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60" />

            <button
              v-if="search && search.trim().length"
              type="button"
              @click="clearSearch"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Clear search">
              ✕
            </button>
          </div>
        </div>
        <!-- Status -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">Status</label>
          <BaseSelect
            v-model="statusModel"
            :options="statusOptions"
            allLabel="All Status"
            placeholder="All Status"
            @change="emitChange" />
        </div>

        <!-- Type -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">Type</label>
          <BaseSelect
            v-model="typeModel"
            :options="typeOptions"
            allLabel="All Types"
            placeholder="All Types"
            @change="emitChange" />
        </div>

        <!-- Start date -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">Start Date</label>
          <input
            :value="filters.startDate"
            type="date"
            @change="updateFilter('startDate', $event.target.value)"
            class="w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60" />
        </div>

        <!-- End date -->
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-gray-700">End Date</label>
          <input
            :value="filters.endDate"
            type="date"
            @change="updateFilter('endDate', $event.target.value)"
            class="w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60" />
        </div>

        <!-- optional empty cell to match 3-col grid (keeps layout clean) -->
        <div class="hidden md:block"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { Search } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  search: { type: String, default: "" },
  filters: {
    type: Object,
    default: () => ({
      status: "all",
      type: "all",
      startDate: "",
      endDate: "",
    }),
  },
  placeholder: {
    type: String,
    default: "Search by name, ID, or mission title...",
  },
});

const emit = defineEmits([
  "update:search",
  "update:filters",
  "change",
  "reset",
]);

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Overdue", value: "overdue" },
];

const typeOptions = [
  { label: "Conference", value: "conference" },
  { label: "Training", value: "training" },
  { label: "Field Trip", value: "field_trip" },
  { label: "Research", value: "research" },
  { label: "Meeting", value: "meeting" },
];

// ✅ "all" <-> "" mapping for BaseSelect All option
const statusModel = computed({
  get: () => (props.filters.status === "all" ? "" : props.filters.status),
  set: (v) => updateFilter("status", v === "" ? "all" : v),
});

const typeModel = computed({
  get: () => (props.filters.type === "all" ? "" : props.filters.type),
  set: (v) => updateFilter("type", v === "" ? "all" : v),
});

const emitChange = () => emit("change");

const onSearchInput = (e) => {
  emit("update:search", e.target.value);
  emit("change");
};

const clearSearch = () => {
  emit("update:search", "");
  emit("change");
};

const updateFilter = (key, value) => {
  emit("update:filters", { ...props.filters, [key]: value });
  emit("change");
};

const reset = () => {
  emit("update:filters", {
    status: "all",
    type: "all",
    startDate: "",
    endDate: "",
  });
  emit("update:search", "");
  emit("reset");
  emit("change");
};

const disabledClear = computed(() => {
  const hasSearch = !!props.search?.trim();
  const hasStatus = props.filters.status !== "all";
  const hasType = props.filters.type !== "all";
  const hasStart = !!props.filters.startDate;
  const hasEnd = !!props.filters.endDate;

  return (
    !(hasSearch || hasStatus || hasType || hasStart || hasEnd) || props.loading
  );
});
</script>
