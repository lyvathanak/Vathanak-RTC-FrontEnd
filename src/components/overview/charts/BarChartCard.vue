<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
    </h3>

    <Bar :data="barData" :options="optionsComputed" :height="height" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";

const props = defineProps({
  title: { type: String, default: "Bar Chart" },
  labels: { type: Array, default: () => ["A", "B", "C"] },
  values: { type: Array, default: () => [10, 20, 30] },
  height: { type: Number, default: 300 },
  options: { type: Object, default: () => ({}) },
});

const COLORS = ["#2563eb", "#16a34a", "#f59e0b"];

const barData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      data: props.values,
      backgroundColor: COLORS,
      borderColor: COLORS,
      borderWidth: 1,
      borderRadius: 10,
    },
  ],
}));

const optionsComputed = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      min: 0,
      max: 2000,
      ticks: { stepSize: 500 },
      grid: { drawBorder: false },
    },
    x: { grid: { display: false } },
  },
  ...props.options,
}));
</script>
