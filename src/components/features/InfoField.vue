<template>
  <div class="rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition">
    <div class="flex items-start gap-3">
      <div class="mt-0.5 rounded-lg bg-gray-50 p-2 ring-1 ring-gray-100">
        <component v-if="icon" :is="icon" class="h-5 w-5 text-gray-600" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-gray-500">
          {{ label }}
        </p>

        <div class="mt-1 flex items-center gap-2">
          <p
            class="text-base sm:text-lg font-semibold text-gray-900 truncate"
            :class="valueClass">
            {{ value || "—" }}
          </p>

          <button
            v-if="copyable"
            type="button"
            class="text-xs px-2 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
            @click="$emit('copy')">
            Copy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: "—" },
  icon: { type: [Object, Function], default: null },
  valueClass: { type: String, default: "" },
  copyable: { type: Boolean, default: false },
});
defineEmits(["copy"]);
</script>
