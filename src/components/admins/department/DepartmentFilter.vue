<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
    <!-- Top -->
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h3 class="text-sm sm:text-base font-bold text-gray-900">
          Department Filters
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
          Search and filter departments
        </p>
      </div>

      <button
        type="button"
        @click="clear"
        :disabled="disableClear"
        :class="[
          'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold transition active:scale-[0.99]',
          disableClear
            ? 'border-gray-200 text-gray-400'
            : 'border-red-200 text-red-600 hover:bg-red-50',
        ]">
        <X class="h-4 w-4" />
        Clear Filters
      </button>
    </div>

    <!-- Controls -->
    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <!-- Search -->
      <div>
        <label class="text-xs font-semibold text-gray-600">Search</label>
        <div class="relative mt-1">
          <input
            v-model="local.search"
            type="text"
            placeholder="Search departments…"
            class="h-11 w-full rounded-xl border border-gray-200 bg-white px-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]"
            @input="emitChange" />
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <!-- Head -->
      <BaseSelect
        v-model="local.head"
        label="Head"
        allLabel="All Heads"
        :options="headOptions"
        @change="emitChange" />

      <!-- Created -->
      <BaseSelect
        v-model="local.createdSort"
        label="Created"
        allLabel="Default"
        :options="createdSortOptions"
        @change="emitChange" />
    </div>
  </section>
</template>

<script setup>
import { reactive, watch, computed } from "vue";
import { Search, X } from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      search: "",
      head: "",
      createdSort: "",
      status: "",
    }),
  },
});

const emit = defineEmits(["update:modelValue", "clear"]);

const local = reactive({ ...props.modelValue });

watch(
  () => props.modelValue,
  (v) => Object.assign(local, v || {}),
  { deep: true },
);

const headOptions = [
  { label: "Assigned", value: "assigned" },
  { label: "Not assigned", value: "unassigned" },
];

const createdSortOptions = [
  { label: "Newest first", value: "new" },
  { label: "Oldest first", value: "old" },
];

const disableClear = computed(
  () => !local.search && !local.head && !local.createdSort && !local.status,
);

function emitChange() {
  emit("update:modelValue", { ...local });
}

function clear() {
  emit("update:modelValue", {
    search: "",
    head: "",
    createdSort: "",
    status: "",
  });
  emit("clear");
}
</script>
