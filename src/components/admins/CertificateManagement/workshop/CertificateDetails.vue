<template>
  <div class="border p-4 rounded bg-gray-50">
    <p><strong>Certificate ID:</strong> {{ data.certId }}</p>
    <p><strong>Participant ID:</strong> {{ data.participantId }}</p>
    <p><strong>Workshop ID:</strong> {{ data.workshopId }}</p>
    <p><strong>Date:</strong> {{ data.date }}</p>
  </div>
</template>

<script setup>
defineProps({
  data: Object
});
</script>
