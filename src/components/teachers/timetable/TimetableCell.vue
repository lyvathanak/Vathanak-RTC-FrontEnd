<template>
  <td class="border-t border-gray-200 px-2 py-3">
    <div
      v-if="data"
      class="relative h-32 rounded-md border bg-white px-3 py-2 shadow-sm flex flex-col justify-center">
      
      <span
        class="absolute top-1 right-2 text-xs bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
        {{ data.type || 'Course' }}
      </span>

      <div class="text-center font-extrabold text-sm text-gray-900">
        {{ data.subject?.subject_name || data.subject }}
      </div>

      <div class="text-center text-sm text-gray-600 mt-1">
        {{ data.group?.name || data.teacher || "—" }}
      </div>

      <span
        v-if="data.location || data.room"
        class="absolute bottom-1 right-2 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 rounded">
        {{ data.location?.name || data.room }}
      </span>
    </div>

    <div
      v-else
      class="h-32 rounded-md border border-gray-100 bg-gray-50/50">
      </div>
  </td>
</template>

<script setup>
defineProps({
  data: Object,
});
</script>