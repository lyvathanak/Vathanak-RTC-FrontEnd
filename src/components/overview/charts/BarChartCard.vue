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
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
  scales: {
    /* =======================
       Y AXIS
       ======================= */
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

    /* =======================
       X AXIS
       ======================= */
    x: {
      title: {
        display: true,
        text: "User Roles",
        font: { size: 13, weight: "bold" },
      },
      ticks: {
        font: { size: 12 },
      },
      grid: {
        display: false,
      },
    },
  },
  ...props.options,
}));
</script>
