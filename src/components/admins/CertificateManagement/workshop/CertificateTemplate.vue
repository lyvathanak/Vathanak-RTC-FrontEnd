<template>
  <div class="border p-6 rounded shadow bg-gray-50 w-96 text-center">
    <h2 class="text-2xl font-bold mb-2">CERTIFICATE OF PARTICIPATION</h2>
    <p class="mb-1">This is proudly presented to <strong>{{ participantName }}</strong></p>
    <p class="mb-1">for attending the workshop/training:</p>
    <h3 class="text-xl font-semibold mb-2">{{ workshopTitle }}</h3>
    <p>Trainer: {{ trainer }}</p>
    <p>Date: {{ date }}</p>
  </div>
</template>

<script setup>
defineProps({ data: Object, type: String });
import { participants, workshops } from "@/mock/workshopData.js";

const participant = participants.find(p => p.id === data.participantId);
const workshop = workshops.find(w => w.id === data.workshopId);

const participantName = participant ? participant.name : 'Unknown';
const workshopTitle = workshop ? workshop.title : 'Unknown';
const trainer = workshop ? workshop.trainer : 'Unknown';
const date = data.date;
</script>
