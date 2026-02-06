<template>
  <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
    <!-- Total -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm text-gray-600">Total</div>
        <Layers class="w-6 h-6 text-gray-500" />
      </div>
      <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
    </div>

    <!-- Pending -->
    <div class="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm text-yellow-600">Pending</div>
        <Clock class="w-6 h-6 text-yellow-600" />
      </div>
      <div class="text-2xl font-bold text-yellow-700">
        {{ stats.pending }}
      </div>
    </div>

    <!-- In Progress -->
    <div class="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm text-blue-600">In Progress</div>
        <Loader class="w-6 h-6 text-blue-600 animate-spin" />
      </div>
      <div class="text-2xl font-bold text-blue-700">
        {{ stats.in_progress }}
      </div>
    </div>

    <!-- Completed -->
    <div class="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm text-green-600">Completed</div>
        <CheckCircle class="w-6 h-6 text-green-600" />
      </div>
      <div class="text-2xl font-bold text-green-700">
        {{ stats.completed }}
      </div>
    </div>

    <!-- Overdue -->
    <div class="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm text-orange-600">Overdue</div>
        <AlertTriangle class="w-6 h-6 text-orange-600" />
      </div>
      <div class="text-2xl font-bold text-orange-700">
        {{ stats.overdue }}
      </div>
    </div>

    <!-- Cancelled -->
    <div class="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-sm text-red-600">Cancelled</div>
        <XCircle class="w-6 h-6 text-red-600" />
      </div>
      <div class="text-2xl font-bold text-red-700">{{ stats.cancelled }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Layers,
  Clock,
  Loader,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-vue-next";
const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      cancelled: 0,
    }),
  },
});

// optional: ensure template never shows undefined
const stats = computed(() => ({
  total: props.stats?.total ?? 0,
  pending: props.stats?.pending ?? 0,
  in_progress: props.stats?.in_progress ?? 0,
  completed: props.stats?.completed ?? 0,
  overdue: props.stats?.overdue ?? 0,
  cancelled: props.stats?.cancelled ?? 0,
}));
</script>
