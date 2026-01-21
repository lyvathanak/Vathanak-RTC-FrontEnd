<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
    </h3>

    <Doughnut :data="donutData" :options="optionsComputed" :height="height" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";

const props = defineProps({
  title: { type: String, default: "Doughnut Chart" },
  labels: {
    type: Array,
    default: () => ["One", "Two", "Three", "Four", "Five"],
  },
  values: { type: Array, default: () => [10, 20, 30, 15, 25] },
  options: { type: Object, default: () => ({}) },
  height: { type: Number, default: 300 },
});

const donutData = computed(() => {
  const labels = props.labels || [];
  const values = props.values || [];

  // ✅ generate as many colors as needed
  const colors = labels.map((_, i) => `hsl(${(i * 47) % 360}, 70%, 55%)`);

  return {
    labels,
    datasets: [
      {
        label: props.title,
        data: values,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };
});

const optionsComputed = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { position: "bottom" } },
  ...props.options,
}));

</script>
