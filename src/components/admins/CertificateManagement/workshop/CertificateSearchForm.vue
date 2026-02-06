<template>
  <div class="flex gap-2">
    <input 
      v-model="certId" 
      type="text" 
      placeholder="Enter Certificate ID" 
      class="border p-2 rounded flex-1"
    />
    <button 
      class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      @click="$emit('extract', certId)"
    >
      Search
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const certId = ref('');
</script>
