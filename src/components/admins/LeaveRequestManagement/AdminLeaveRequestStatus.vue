<template>
  <LeaveRequestStatus
    :pending="pending"
    :approved="approved"
    :rejected="rejected"
    :total="total"
    :urgent="urgent"
  />
</template>

<script setup>
import LeaveRequestStatus from '@/components/features/LeaveRequestStatus.vue';
defineProps({
  pending: { type: Number, default: 0 },
  approved: { type: Number, default: 0 },
  rejected: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  urgent: { type: Number, default: 0 }, // 👈 new
});
</script>
