<template>
  <section
    class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-extrabold text-gray-900">Filters</h2>
          <p class="text-sm text-gray-500 mt-1">Refine results by criteria</p>
        </div>

        <button
          type="button"
          @click="clear"
          :disabled="disableClear"
          :class="[
            'inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold transition',
            disableClear
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-red-200 text-red-600 hover:bg-red-50',
          ]">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="px-6 py-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <!-- Search -->
        <div class="md:col-span-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>

          <div class="relative">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="local.search"
              type="text"
              placeholder="Search by name, ID, or mission title..."
              class="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]"
              @input="emitFilters" />
          </div>
        </div>

        <!-- Status -->
        <div class="md:col-span-4">
          <BaseSelect
            v-model="local.status"
            label="Status"
            :options="statusOptions"
            all-label="All Status"
            placeholder="All Status"
            @change="emitFilters" />
        </div>

        <!-- Type -->
        <div class="md:col-span-4">
          <BaseSelect
            v-model="local.type"
            label="Type"
            :options="typeOptions"
            all-label="All Types"
            placeholder="All Types"
            @change="emitFilters" />
        </div>

        <!-- Start Date -->
        <div class="md:col-span-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>

          <div class="relative">
            <input
              v-model="local.startDate"
              type="date"
              class="w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]"
              @change="onStartDateChanged" />
            <Calendar
              class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <!-- End Date -->
        <div class="md:col-span-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>

          <div class="relative">
            <input
              v-model="local.endDate"
              type="date"
              :min="local.startDate || undefined"
              class="w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 pr-11 text-sm font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]"
              @change="emitFilters" />
            <Calendar
              class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          <p v-if="dateError" class="mt-2 text-[11px] text-red-600">
            {{ dateError }}
          </p>
        </div>

        <!-- Empty column to match screenshot spacing -->
        <div class="hidden md:block md:col-span-4"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive } from "vue";
import { Search, Calendar } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const emit = defineEmits(["update:filters", "change"]);

const local = reactive({
  search: "",
  status: "",
  type: "",
  startDate: "",
  endDate: "",
});

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const typeOptions = [
  { label: "Mission", value: "mission" },
  { label: "Training", value: "training" },
  { label: "Meeting", value: "meeting" },
];

const disableClear = computed(() => {
  return (
    !local.search &&
    !local.status &&
    !local.type &&
    !local.startDate &&
    !local.endDate
  );
});

const dateError = computed(() => {
  if (!local.startDate || !local.endDate) return "";
  return local.endDate < local.startDate
    ? "End date must be after start date."
    : "";
});

function emitFilters() {
  // normalize dates
  if (local.startDate && local.endDate && local.endDate < local.startDate) {
    local.endDate = local.startDate;
  }

  const payload = {
    search: local.search,
    status: local.status,
    type: local.type,
    startDate: local.startDate,
    endDate: local.endDate,
  };

  emit("update:filters", payload);
  emit("change", payload);
}

function onStartDateChanged() {
  if (local.startDate && local.endDate && local.endDate < local.startDate) {
    local.endDate = local.startDate;
  }
  emitFilters();
}

function clear() {
  local.search = "";
  local.status = "";
  local.type = "";
  local.startDate = "";
  local.endDate = "";
  emitFilters();
}
</script>
