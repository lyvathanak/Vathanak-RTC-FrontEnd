<template>
  <div class="flex items-center gap-3">
    <span class="text-sm font-semibold text-gray-600">Week</span>

    <div class="relative">
      <select
        :value="modelValue"
        @change="onChange"
        class="appearance-none border border-gray-300 bg-white rounded-lg px-4 py-2 pr-10 font-semibold shadow-sm">
        <option v-for="w in weeks" :key="w" :value="w">{{ w }}</option>
      </select>

      <span
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        ▾
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  weeks: Array,
});

const emit = defineEmits(["update:modelValue"]);

function onChange(e) {
  emit("update:modelValue", e.target.value);
}
</script>
