<template>
  <div
    class="flex items-center justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition p-5"
  >
    <!-- Left -->
    <div>
      <div class="text-3xl font-bold" :class="color">
        {{ value }}
      </div>
      <div class="text-gray-500 text-sm font-medium mt-1">
        {{ label }}
      </div>
    </div>

    <!-- Right Icon -->
    <div
      class="w-12 h-12 flex items-center justify-center rounded-full"
      :class="bgIcon"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: Number,
  color: String,
  bgIcon: String,
});
</script>
