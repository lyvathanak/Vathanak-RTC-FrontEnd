<template>
  <td
    class="border-t border-gray-200 px-2 py-3 hover:border-[#235AA6]/5"
    :class="readOnly ? 'cursor-default' : 'cursor-pointer'"
    @click="onClick">
    <!-- HAS DATA -->
    <div
      v-if="data"
      class="relative h-32 rounded-md border bg-white px-3 py-2 shadow-sm flex flex-col justify-center transition hover:shadow-md hover:border-[#235AA6]/30 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30">
      <span
        class="absolute top-1 right-2 text-xs bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
        Course
      </span>

      <div class="text-center font-extrabold text-sm text-gray-900">
        {{ data.subject }}
      </div>

      <div class="text-center text-sm text-gray-600 mt-1">
        {{ data.teacher || "—" }}
      </div>

      <span
        class="absolute bottom-1 right-2 text-xs bg-[#235AA6]/10 text-[#235AA6] px-2 py-0.5 rounded font-semibold">
        {{ data.room || "—" }}
      </span>
    </div>

    <!-- EMPTY -->
    <div
      v-else
      class="h-32 rounded-md border border-dashed bg-gray-50 text-gray-400 flex items-center justify-center"
      :class="readOnly ? '' : 'hover:bg-[#235AA6]/5'">
      <span class="text-sm font-semibold">
        {{ readOnly ? "—" : "+ Add class" }}
      </span>
    </div>
  </td>
</template>

<script setup>
const props = defineProps({
  data: Object,
  readOnly: { type: Boolean, default: false },
});

const emit = defineEmits(["edit"]);

function onClick() {
  if (props.readOnly) return;
  emit("edit");
}
</script>
