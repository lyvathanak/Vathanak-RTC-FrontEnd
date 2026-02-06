<template>
  <div
    class="w-full bg-white border border-gray-200 rounded-2xl shadow-sm px-4 sm:px-5 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div class="flex items-center gap-3">
        <span
          class="inline-flex h-9 items-center rounded-full bg-gray-100 px-4 text-sm font-semibold text-gray-800">
          Week
        </span>
        <span class="text-sm text-gray-500">Filter timetable by week</span>
      </div>

      <div class="sm:ml-auto w-full sm:w-90">
        <BaseSelect
          class="rtc-week-select"
          allLabel="All weeks"
          :options="weekOptions"
          placeholder="Select week"
          :modelValue="props.modelValue"
          @update:modelValue="emit('update:modelValue', String($event))" />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseSelect from "@/components/features/BaseSelect.vue";
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  weeks: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const weekOptions = computed(() =>
  (props.weeks || []).map((w) => ({
    // if weeks already include "Week of ..." then just label: w
    label: String(w).startsWith("Week of") ? String(w) : `Week of ${w}`,
    value: String(w),
  })),
);
</script>

<style scoped>
/* If BaseSelect accepts class on its root, this will style the visible control nicely.
   If your BaseSelect doesn't forward classes to the <button>/<input>, paste BaseSelect.vue
   and I’ll target the correct internal element. */
.rtc-week-select :deep(button),
.rtc-week-select :deep(.trigger),
.rtc-week-select :deep(.base-select-trigger) {
  width: 100%;
  height: 44px; /* matches screenshot feel */
  border-radius: 14px;
  border: 1px solid #e5e7eb; /* gray-200 */
  background: #fff;
  padding: 0 44px 0 16px; /* space for chevron */
  font-weight: 600;
  color: #111827; /* gray-900 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Hover / focus */
.rtc-week-select :deep(button:hover),
.rtc-week-select :deep(.trigger:hover),
.rtc-week-select :deep(.base-select-trigger:hover) {
  border-color: #d1d5db; /* gray-300 */
}

.rtc-week-select :deep(button:focus),
.rtc-week-select :deep(button:focus-visible),
.rtc-week-select :deep(.trigger:focus-visible),
.rtc-week-select :deep(.base-select-trigger:focus-visible) {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12); /* soft blue ring */
  border-color: #93c5fd; /* blue-300 */
}
</style>
