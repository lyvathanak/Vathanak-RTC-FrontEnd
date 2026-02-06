<template>
  <div v-if="visible" class="mt-4 p-4 border rounded bg-gray-50">
    <h3 class="font-semibold mb-2">Assign Room for {{ request.course }} ({{ request.type }})</h3>

    <div class="flex flex-wrap gap-2 items-center">
      <select v-model="form.building" class="input">
        <option disabled value="">Select Building</option>
        <option v-for="b in buildings" :key="b" :value="b">{{ b }}</option>
      </select>

      <select v-model="form.roomId" class="input">
        <option disabled value="">Select Room</option>
        <option v-for="r in filteredRooms" :key="r.id" :value="r.id">{{ r.name }} ({{ r.capacity }} seats)</option>
      </select>

      <button
        class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        @click="confirmAssign"
        :disabled="!form.roomId || !form.building"
      >
        Confirm Assign
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from "vue";

const props = defineProps({
  visible: Boolean,
  request: Object,
  rooms: Array,
  buildings: Array
});
const emit = defineEmits(["assigned"]);

const form = reactive({ building: "", roomId: "" });

watch(() => props.request, () => {
  form.building = "";
  form.roomId = "";
});

const filteredRooms = computed(() =>
  props.rooms.filter(r => r.department === props.request.department && r.building === form.building)
);

function confirmAssign() {
  emit("assigned", { requestId: props.request.id, roomId: form.roomId, building: form.building });
  form.building = "";
  form.roomId = "";
}
</script>

<style scoped>
.input { border: 1px solid #ccc; padding: 6px; border-radius: 6px; }
</style>
