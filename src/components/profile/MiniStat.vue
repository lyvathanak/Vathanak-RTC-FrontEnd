<template>
  <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <div class="flex items-center gap-2 text-slate-500 text-xs font-semibold">
      <component :is="icon" class="w-4 h-4" />
      {{ label }}
    </div>
    <div class="mt-1 text-sm font-bold text-slate-900 break-words">
      {{ value || "-" }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
});
</script>
