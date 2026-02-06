<template>
  <ul>
    <li v-for="assignment in assignedRooms" :key="assignment.requestId" class="mb-3 flex flex-col gap-2 border-b pb-3">
      <div>
        <p class="font-bold">{{ getRequest(assignment.requestId).course }} - {{ getRequest(assignment.requestId).teacher }}</p>
        <p class="text-sm text-gray-600">{{ getRoom(assignment.roomId).name }} • {{ getRoom(assignment.roomId).building }}</p>
        <p class="text-sm">
          Status: <span :class="assignment.status === 'confirmed' ? 'text-green-600' : 'text-yellow-500'">{{ assignment.status }}</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button v-if="assignment.status === 'pending'" class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" @click="$emit('edit', assignment.requestId)">Edit</button>
        <button class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" @click="$emit('delete', assignment.requestId)">Delete</button>
      </div>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  assignedRooms: Array,
  getRequest: Function,
  getRoom: Function
});
const emit = defineEmits(["edit", "delete"]);
</script>
