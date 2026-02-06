<template>
  <form @submit.prevent="submitForm" class="space-y-3">
    <div>
      <label>Participant:</label>
      <select v-model="participantId" class="border p-2 rounded w-full">
        <option disabled value="">Select Participant</option>
        <option v-for="p in participants" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <div>
      <label>Workshop:</label>
      <select v-model="workshopId" class="border p-2 rounded w-full">
        <option disabled value="">Select Workshop</option>
        <option v-for="w in workshops" :key="w.id" :value="w.id">{{ w.title }}</option>
      </select>
    </div>

    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
      Create Certificate
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
defineProps({ participants: Array, workshops: Array });
const emit = defineEmits(['create']);

const participantId = ref('');
const workshopId = ref('');

function submitForm() {
  if (!participantId.value || !workshopId.value) return alert("Select both fields!");
  const certId = `WC${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
  emit('create', { certId, participantId: participantId.value, workshopId: workshopId.value, date: new Date().toISOString().split('T')[0] });
  participantId.value = '';
  workshopId.value = '';
}
</script>
