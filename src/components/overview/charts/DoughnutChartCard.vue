<template>
  <div class="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      {{ title }}
    </h3>

    <!-- chart area fills remaining height -->
    <div class="flex-1 min-h-0">
      <Doughnut
        :data="donutData"
        :options="optionsComputed"
        class="h-full w-full" />
    </div>
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
});

const donutData = computed(() => {
  const labels = props.labels || [];
  const values = props.values || [];
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
  maintainAspectRatio: false, // ✅ IMPORTANT
  plugins: { legend: { position: "bottom" } },
  ...props.options,
}));
</script>
