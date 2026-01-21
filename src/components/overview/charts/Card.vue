<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">
          {{ label }}
        </p>
        <p class="text-3xl font-bold" :class="valueClass">
          {{ value ?? "—" }}
        </p>
      </div>

      <div class="p-3 rounded-full" :class="iconBgClass">
        <component
          :is="icon"
          class="w-6 h-6"
          :class="iconClass" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "—" },

  icon: { type: [Object, Function], required: true },

  valueClass: { type: String, default: "text-gray-900" },
  iconBgClass: { type: String, default: "bg-gray-100" },
  iconClass: { type: String, default: "text-gray-600" },
});
</script>
