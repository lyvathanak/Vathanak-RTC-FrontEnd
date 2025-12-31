<template>
  <div
    class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 wrapper">
    <!-- Pending -->
    <div
      class="relative rounded-xl border-t-4 border-[#FF7700] bg-white shadow-md p-5 text-center hover:shadow-xl transition-shadow duration-300">
      <div class="flex justify-center items-center gap-2">
        <Clock class="w-5 h-5 text-[#FF7700]" />
        <div class="text-2xl font-bold text-[#FF7700]">{{ pending }}</div>
      </div>
      <div class="text-gray-500 mt-2 text-sm sm:text-base font-medium">
        Pending
      </div>
    </div>

    <!-- Approved -->
    <div
      class="relative rounded-xl border-t-4 border-[#10B981] bg-white shadow-md p-5 text-center hover:shadow-xl transition-shadow duration-300">
      <div class="flex justify-center items-center gap-2">
        <CheckCircle2 class="w-5 h-5 text-[#10B981]" />
        <div class="text-2xl font-bold text-[#10B981]">{{ approved }}</div>
      </div>
      <div class="text-gray-500 mt-2 text-sm sm:text-base font-medium">
        Approved
      </div>
    </div>

    <!-- Rejected -->
    <div
      class="relative rounded-xl border-t-4 border-[#FF4040] bg-white shadow-md p-5 text-center hover:shadow-xl transition-shadow duration-300">
      <div class="flex justify-center items-center gap-2">
        <XCircle class="w-5 h-5 text-[#FF4040]" />
        <div class="text-2xl font-bold text-[#FF4040]">{{ rejected }}</div>
      </div>
      <div class="text-gray-500 mt-2 text-sm sm:text-base font-medium">
        Rejected
      </div>
    </div>

    <!-- Total -->
    <div
      class="relative rounded-xl border-t-4 border-[#235AA6] bg-white shadow-md p-5 text-center hover:shadow-xl transition-shadow duration-300">
      <div class="flex justify-center items-center gap-2">
        <ClipboardList class="w-5 h-5 text-[#235AA6]" />
        <div class="text-2xl font-bold text-[#235AA6]">{{ total }}</div>
      </div>
      <div class="text-gray-500 mt-2 text-sm sm:text-base font-medium">
        Total Requests
      </div>
    </div>

    <!-- Urgent (≤2 days left) -->
    <div
      v-if="userType === 'admin'"
      class="relative rounded-xl border-t-4 border-[#FF0000] bg-white shadow-md p-5 text-center hover:shadow-xl transition-shadow duration-300">
      <div class="flex justify-center items-center gap-2">
        <AlertTriangle class="w-5 h-5 text-[#FF0000]" />
        <div class="text-2xl font-bold text-[#FF0000]">{{ urgent }}</div>
      </div>
      <div class="text-gray-500 mt-2 text-sm sm:text-base font-medium">
        Two Days Left
      </div>
    </div>
  </div>
</template>

<script setup>
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
