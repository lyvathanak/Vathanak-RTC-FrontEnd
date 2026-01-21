<template>
  <div class="overflow-x-auto border rounded-lg bg-white">
    <table class="min-w-[900px] w-full">
      <thead>
        <tr class="bg-gray-50">
          <th class="w-36 py-4 border-b border-r border-gray-200">Time</th>
          <th v-for="d in days" :key="d">{{ d }}</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="t in times" :key="t">
          <td class="font-semibold text-center text-md">{{ t }}</td>

          <TimetableCell
            v-for="d in days"
            :key="d + t"
            :data="getSlot(d, t)"
            @edit="$emit('edit', { day: d, time: t })" />
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
  getSlot: Function, // ⬅️ NOT slot
});

defineEmits(["edit"]);
</script>
