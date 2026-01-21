<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
    </h3>

    <Doughnut :data="donutData" :options="optionsComputed" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";

const props = defineProps({
  title: { type: String, default: "Doughnut Chart" },
  labels: { type: Array, default: () => ["One", "Two", "Three", "Four", "Five"] },
  values: { type: Array, default: () => [10, 20, 30, 15, 25] },
  options: { type: Object, default: () => ({}) },
});

const donutData = computed(() => ({
  labels: props.labels.slice(0, 5),
  datasets: [
    {
      label: props.title,
      data: props.values.slice(0, 5),
      backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"],
      borderColor: "#ffffff",
      borderWidth: 2,
    },
  ],
}));

const optionsComputed = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { position: "bottom" } },
  ...props.options,
}));
</script>
