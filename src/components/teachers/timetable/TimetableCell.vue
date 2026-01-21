<template>
  <td
    class="border-t border-gray-200 px-2 py-3 cursor-pointer hover:border-[#235AA6]/5"
    @click="$emit('edit')">
    <!-- HAS DATA -->
    <div
      v-if="data"
      class="relative h-32 rounded-md border bg-white px-3 py-2 shadow-sm flex flex-col justify-center transition hover:shadow-md hover:border-[#235AA6]/30 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30">
      <!-- Course label (top-right) -->
      <span
        class="absolute top-1 right-2 text-xs bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
        Course
      </span>

      <!-- Subject -->
      <div class="text-center font-extrabold text-sm text-gray-900">
        {{ data.subject }}
      </div>

      <!-- Teacher -->
      <div class="text-center text-sm text-gray-600 mt-1">
        {{ data.teacher || "—" }}
      </div>

      <!-- Room badge (bottom-right) -->
      <span
        class="absolute bottom-1 right-2 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 rounded">
        {{ data.room || "—" }}
      </span>
    </div>

    <!-- EMPTY SLOT -->
    <div
      v-else
      class="h-32 border border-dashed rounded-md text-gray-400 flex flex-col items-center justify-center gap-2 text-sm hover:text-[#235AA6] hover:border-[#235AA6]/40 transition">
      <CircleFadingPlus class="w-6 h-6" />
      <span>Add class</span>
    </div>
  </td>
</template>

<script setup>
import { CircleFadingPlus } from "lucide-vue-next";
defineProps({
  data: Object,
});

defineEmits(["edit"]);
</script>
