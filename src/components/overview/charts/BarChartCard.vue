<template>
  <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
    </h3>

    <!-- chart area fills remaining height -->
    <div class="flex-1 min-h-0">
      <Bar :data="barData" :options="optionsComputed" class="h-full w-full" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";

const props = defineProps({
  title: { type: String, default: "Bar Chart" },
  labels: { type: Array, default: () => ["A", "B", "C"] },
  values: { type: Array, default: () => [10, 20, 30] },
  options: { type: Object, default: () => ({}) },
});

const COLORS = ["#2563eb", "#16a34a", "#f59e0b"];

const barData = computed(() => {
  const colors = COLORS.slice(0, props.labels.length);
  return {
    labels: props.labels,
    datasets: [
      {
        label: props.title,
        data: props.values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 10,
      },
    ],
  };
});

const maxY = computed(() => {
  const m = Math.max(...(props.values || [0]));
  return m <= 10 ? 10 : Math.ceil(m * 1.2);
});

const optionsComputed = computed(() => ({
  responsive: true,
  maintainAspectRatio: false, // ✅ IMPORTANT (allow height stretch)
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: maxY.value,
      title: {
        display: true,
        text: "Number of Users",
        font: { size: 13, weight: "bold" },
      },
      ticks: {
        stepSize: Math.ceil(maxY.value / 5),
      },
      grid: {
        drawBorder: false,
        color: "#e5e7eb",
      },
    },
    x: {
      title: {
        display: true,
        text: "User Roles",
        font: { size: 13, weight: "bold" },
      },
      ticks: { font: { size: 12 } },
      grid: { display: false },
    },
  },
  ...props.options,
}));
</script>
