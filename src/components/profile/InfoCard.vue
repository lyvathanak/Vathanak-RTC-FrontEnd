<template>
  <section
    class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden"
  >
    <header class="p-5 border-b border-slate-100">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-xl bg-slate-50 text-[#235AA6]">
          <component :is="icon" class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
          <p class="text-sm text-slate-500">{{ subtitle }}</p>
        </div>
      </div>
    </header>

    <div class="p-5 space-y-3">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  icon: { type: [Object, Function], required: true }, // pass lucide icon component
});
</script>
