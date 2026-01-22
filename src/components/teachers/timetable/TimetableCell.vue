<template>
  <td class="border-b border-r border-gray-100 p-2 align-top h-36">
    <div
      v-if="data"
      class="relative w-full h-full rounded-lg border bg-white p-3 shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-indigo-300 group">
      
      <div class="flex justify-end">
        <span class="text-[10px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-600">
          {{ data.type || 'Course' }}
        </span>
      </div>

      <div class="text-center">
        <div class="font-bold text-sm text-gray-900 leading-tight line-clamp-2" :title="data.subject?.subject_name || data.subject">
          {{ data.subject?.subject_name || data.subject }}
        </div>
        
        <div class="text-xs text-gray-500 mt-1 font-medium truncate">
          {{ data.group?.name || data.teacher || "—" }}
        </div>
      </div>

      <div class="flex justify-between items-end mt-2">
         <span></span> 
         
         <span
          v-if="data.location || data.room"
          class="bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 rounded border border-red-100">
          {{ data.location?.name || data.room }}
        </span>
      </div>
    </div>

    <div
      v-else
      class="w-full h-full rounded-lg border border-dashed border-gray-200 bg-gray-50/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
       <span class="text-xs text-gray-300 font-medium">Free</span>
    </div>
  </td>
</template>

<script setup>
defineProps({
  data: Object,
});
</script>