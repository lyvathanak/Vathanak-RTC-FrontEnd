<template>
  <div class="flex items-start justify-between gap-4">
    <p class="text-sm text-slate-500 font-medium">{{ label }}</p>
    <p class="text-sm text-slate-900 font-semibold text-right break-words max-w-[60%]">
      {{ value || "-" }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
});
</script>
