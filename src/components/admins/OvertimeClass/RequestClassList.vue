<template>
  <ul>
    <li
      v-for="req in pendingRequests"
      :key="req.id"
      class="mb-3 border-b pb-3 flex justify-between items-center"
    >
      <div>
        <p class="font-bold">{{ req.course }} ({{ req.type }})</p>
        <p class="text-sm text-gray-600">
          {{ req.teacher }} • {{ req.department }} • {{ req.date }}
        </p>
      </div>
      <button
        class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="$emit('assign-room', req.id)"
      >
        Assign Room
      </button>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({ pendingRequests: Array });
const emit = defineEmits(["assign-room"]);
</script>
