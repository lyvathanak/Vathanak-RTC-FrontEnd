<template>
  <div class="flex flex-wrap justify-end gap-2">
    <button
      @click="$emit('approve')"
      :disabled="selectedCount === 0"
      class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base">
      <CheckCircle class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      Approve Selected ({{ selectedCount }})
    </button>

    <button
      @click="$emit('reject')"
      :disabled="selectedCount === 0"
      class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base">
      <X  class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      Reject Selected ({{ selectedCount }})
    </button>

    <button
      @click="$emit('export')"
      :disabled="selectedCount === 0"
      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base">
      <Download class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
      Export Selected ({{ selectedCount }})
    </button>
  </div>
</template>

<script setup>
import { CheckCircle, X , Download } from "lucide-vue-next";

defineProps({
  selectedCount: { type: Number, default: 0 },
});

defineEmits(["approve", "reject", "export"]);
</script>
