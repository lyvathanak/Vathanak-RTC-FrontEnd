<template>
  <div class="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
    <table class="min-w-[900px] w-full table-fixed border-collapse">
      <thead>
        <tr class="bg-gray-50 text-gray-700">
          <th class="w-36 py-4 px-4 text-center font-bold text-sm border-b border-r border-gray-200 uppercase tracking-wider">
            Time
          </th>
          
          <th 
            v-for="d in days" 
            :key="d"
            class="py-4 px-2 text-center font-bold text-sm border-b border-gray-200 uppercase tracking-wider text-gray-600">
            {{ d }}
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="t in times" :key="t" class="hover:bg-gray-50/50 transition-colors">
          <td class="w-36 p-4 font-bold text-center text-sm text-gray-500 border-r border-b border-gray-100 bg-gray-50/30">
            {{ t }}
          </td>

          <TimetableCell
            v-for="d in days"
            :key="d + t"
            :data="getSlot(d, t)" 
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import TimetableCell from "./TimetableCell.vue";

defineProps({
  days: Array,
  times: Array,
  getSlot: Function,
});
</script>