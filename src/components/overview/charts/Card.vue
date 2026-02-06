<script setup>
import { computed } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  icon: { type: Function, default: null },

  valueClass: { type: String, default: "text-gray-900" },
  iconBgClass: { type: String, default: "bg-gray-100" },
  iconClass: { type: String, default: "text-gray-600" },
});

const formattedValue = computed(() => {
  const n = Number(props.value);
  if (Number.isFinite(n)) return new Intl.NumberFormat().format(n);
  return props.value ?? 0;
});
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">{{ label }}</p>
        <p class="text-2xl font-bold" :class="valueClass">
          {{ formattedValue }}
        </p>
      </div>

      <div v-if="icon" class="p-3 rounded-xl" :class="iconBgClass">
        <component :is="icon" class="w-6 h-6" :class="iconClass" />
      </div>
    </div>
  </div>
</template>
