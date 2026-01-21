<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">
        {{ title }}
      </h2>

      <select
        v-if="showRange"
        v-model="localRange"
        class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
        <option value="30">Last 30 days</option>
      </select>
    </div>

    <Line :data="computedData" :options="optionsComputed" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Line } from "vue-chartjs";

const props = defineProps({
  title: { type: String, default: "Line Chart" },

  // If you want parent control: pass v-model:range
  range: { type: [String, Number], default: "7" },
  showRange: { type: Boolean, default: true },

  // Accept either "line_datasets + line_labels" from API
  line_labels: { type: Array, default: () => [] },
  line_datasets: { type: Array, default: () => [] },

  // fallback (optional)
  fallbackSets: { type: Array, default: () => [] },

  options: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["update:range"]);

const localRange = ref(String(props.range));
watch(
  () => props.range,
  (v) => (localRange.value = String(v))
);
watch(localRange, (v) => emit("update:range", v));

function makeLabels(days) {
  const n = Number(days);
  return Array.from({ length: n }, (_, i) => `D${i + 1}`);
}

const defaultSets = computed(() => {
  // If parent provided fallbackSets, use them, else use your demo sets
  if (props.fallbackSets.length) return props.fallbackSets;

  const labels = makeLabels(localRange.value);
  return [
    {
      label: "Approved",
      data: labels.map((_, i) => Math.round(55 + 10 * Math.sin(i / 2))),
      color: "#2563eb",
      fill: "rgba(37,99,235,0.15)",
    },
    {
      label: "Rejected",
      data: labels.map((_, i) => Math.round(20 + 6 * Math.cos(i / 2))),
      color: "#16a34a",
      fill: "rgba(22,163,74,0.15)",
    },
    {
      label: "Pending",
      data: labels.map((_, i) => Math.round(8 + 3 * Math.sin(i / 3))),
      color: "#f59e0b",
      fill: "rgba(245,158,11,0.15)",
    },
  ];
});

const labelsComputed = computed(() => {
  if (props.line_labels?.length) return props.line_labels;
  return makeLabels(localRange.value);
});

const datasetsComputed = computed(() => {
  const labels = labelsComputed.value;

  const apiSets = Array.isArray(props.line_datasets) ? props.line_datasets : [];
  const sets = apiSets.length ? apiSets.slice(0, 3) : defaultSets.value.slice(0, 3);

  return sets.map((s, idx) => {
    const border = s.color || ["#2563eb", "#16a34a", "#f59e0b"][idx % 3];
    const fill = s.fill || ["rgba(37,99,235,0.15)", "rgba(22,163,74,0.15)", "rgba(245,158,11,0.15)"][idx % 3];

    return {
      label: s.label || `Series ${idx + 1}`,
      data: (s.data || []).slice(0, labels.length),
      tension: 0.35,
      borderColor: border,
      backgroundColor: fill,
      pointBackgroundColor: border,
      pointBorderColor: "#ffffff",
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
    };
  });
});

const computedData = computed(() => ({
  labels: labelsComputed.value,
  datasets: datasetsComputed.value,
}));

const optionsComputed = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: true } },
  ...props.options,
}));
</script>
