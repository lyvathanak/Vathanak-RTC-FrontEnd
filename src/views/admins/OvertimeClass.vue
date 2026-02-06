<template>
  <div class="dashboard max-w-6xl mx-auto p-6 font-sans">
    <h1 class="text-3xl font-bold text-center mb-8">Overtime Class Attendance</h1>

    <!-- Teacher Submissions -->
    <section class="card mb-6">
      <h2 class="text-2xl font-semibold mb-4">Pending Teacher Requests</h2>
      <RequestClassList :pendingRequests="pendingRequests" @assign-room="showAssignForm" />
      <p v-if="pendingRequests.length === 0" class="text-gray-600 mt-2">No pending requests.</p>
    </section>

    <!-- Room Assignment -->
    <section class="card mb-6">
      <RoomAssignmentForm
        v-for="req in requests"
        :key="req.id"
        :visible="showForm[req.id]"
        :request="req"
        :rooms="rooms"
        :buildings="buildings"
        @assigned="assignRoom"
      />
    </section>

    <!-- Assigned Rooms -->
    <section class="card">
      <h2 class="text-2xl font-semibold mb-4">Assigned Rooms</h2>
      <RoomAssignment
        :assignedRooms="assignedRooms"
        :getRequest="getRequest"
        :getRoom="getRoom"
        @edit="editAssignment"
        @delete="deleteAssignment"
      />
      <p v-if="assignedRooms.length === 0" class="text-gray-600 mt-2">No rooms assigned yet.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import RoomAssignmentForm from "@/components/admins/OvertimeClass/RoomAssignmentForm.vue";
import AssignedRoomsList from "@/components/admins/OvertimeClass/RoomAssignment.vue";
import RequestClassList from "@/components/admins/OvertimeClass/RequestClassList.vue";
import RoomAssignment from "@/components/admins/OvertimeClass/RoomAssignment.vue";

// ---------- MOCK DATA ----------
const requests = ref([
  { id: "R001", teacher: "Mr. Dara", course: "Web Development", department: "IT", type: "course", date: "2025-01-10" },
  { id: "R002", teacher: "Ms. Lina", course: "Network Lab", department: "IT", type: "practical", date: "2025-01-11" },
  { id: "R003", teacher: "Dr. Sok", course: "Physics Lab", department: "Science", type: "practical", date: "2025-01-12" },
]);

const rooms = ref([
  { id: "RM001", name: "IT Lecture Hall 1", building: "IT Building", capacity: 120, department: "IT" },
  { id: "RM002", name: "IT Lab 1", building: "IT Building", capacity: 30, department: "IT" },
  { id: "RM003", name: "Science Lab 1", building: "Science Building", capacity: 25, department: "Science" },
]);

const buildings = ["IT Building", "Science Building"];
const assignedRooms = ref([]);
const showForm = reactive({});

// ---------- COMPUTED ----------
const pendingRequests = computed(() =>
  requests.value.filter(r => !assignedRooms.value.some(a => a.requestId === r.id))
);

// ---------- METHODS ----------
function showAssignForm(requestId) {
  showForm[requestId] = true;
}

function assignRoom({ requestId, roomId, building }) {
  assignedRooms.value.push({ requestId, roomId, building, status: "pending" });
  showForm[requestId] = false;
}

function getRequest(requestId) {
  return requests.value.find(r => r.id === requestId) || {};
}

function getRoom(roomId) {
  return rooms.value.find(r => r.id === roomId) || {};
}

function editAssignment(requestId) {
  showForm[requestId] = true;
}

function deleteAssignment(requestId) {
  const index = assignedRooms.value.findIndex(a => a.requestId === requestId);
  if (index !== -1) assignedRooms.value.splice(index, 1);
}
</script>

<style scoped>
.dashboard { max-width: 900px; margin: auto; padding: 20px; font-family: Arial, sans-serif; }
.card { background: #fff; padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.input { border: 1px solid #ccc; padding: 6px; border-radius: 6px; }
button { cursor: pointer; }
</style>
