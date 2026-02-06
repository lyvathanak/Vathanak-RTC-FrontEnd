<template>
  <form @submit.prevent="submitEdit" class="space-y-3">
    <div>
      <label>Participant ID:</label>
      <input v-model="form.participantId" class="border p-2 rounded w-full" />
    </div>
    <div>
      <label>Workshop ID:</label>
      <input v-model="form.workshopId" class="border p-2 rounded w-full" />
    </div>
    <div>
      <label>Date:</label>
      <input type="date" v-model="form.date" class="border p-2 rounded w-full" />
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="px-3 py-1 bg-gray-400 text-white rounded" @click="$emit('close')">Cancel</button>
      <button type="submit" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
defineProps({ modelValue: Object });
const emit = defineEmits(['update','close']);

const form = reactive({ ...defineProps().modelValue });

function submitEdit() {
  emit('update', { ...form });
}
</script>
