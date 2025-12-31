<template>
  <div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Pending -->
    <StatusCard
      label="Pending"
      :value="pending"
      color="text-orange-500"
      bgIcon="bg-orange-50">
      <Clock class="w-6 h-6 text-orange-500" />
    </StatusCard>

    <!-- Approved -->
    <StatusCard
      label="Approved"
      :value="approved"
      color="text-emerald-500"
      bgIcon="bg-emerald-50">
      <CheckCircle2 class="w-6 h-6 text-emerald-500" />
    </StatusCard>

    <!-- Rejected -->
    <StatusCard
      label="Rejected"
      :value="rejected"
      color="text-red-500"
      bgIcon="bg-red-50">
      <XCircle class="w-6 h-6 text-red-500" />
    </StatusCard>

    <!-- Total -->
    <StatusCard
      label="Total Requests"
      :value="total"
      color="text-blue-600"
      bgIcon="bg-blue-50">
      <ClipboardList class="w-6 h-6 text-blue-600" />
    </StatusCard>

    <!-- Urgent -->
    <StatusCard
      v-if="userType === 'admin'"
      label="Two Days Left"
      :value="urgent"
      color="text-red-600"
      bgIcon="bg-red-100">
      <AlertTriangle class="w-6 h-6 text-red-600" />
    </StatusCard>
  </div>
</template>

<script setup>
import StatusCard from "./StatusCard.vue";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
} from "lucide-vue-next";

defineProps({
  userType: { type: String, default: "teacher,student,hod" },
  pending: { type: Number, default: 0 },
  approved: { type: Number, default: 0 },
  rejected: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  urgent: { type: Number, default: 0 },
});
</script>
