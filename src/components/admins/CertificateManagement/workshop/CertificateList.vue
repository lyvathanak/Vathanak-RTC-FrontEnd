<template>
  <ul>
    <li v-for="c in certificates" :key="c.certId" class="flex justify-between items-center border-b py-2">
      <span>{{ c.certId }} — {{ getParticipantName(c.participantId) }}</span>
      <div class="flex gap-2">
        <button class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" @click="$emit('update', c)">
          Edit
        </button>
        <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600" @click="$emit('delete', c.certId)">
          Delete
        </button>
      </div>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  certificates: Array,
  participants: Array
});

const emit = defineEmits(['update', 'delete']);

function getParticipantName(participantId) {
  const p = (defineProps().participants || []).find(p => p.id === participantId);
  return p ? p.name : "Unknown";
}
</script>
