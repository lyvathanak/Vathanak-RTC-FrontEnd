<template>
  <SectionTitle
    :title="title"
    :subtitle="subtitle"
    :className="className"
    :period="period"
  />

  <TimetableTable
    :days="days"
    :times="times"
    :getSlot="getSlot"
    :readOnly="readOnly"
    @edit="$emit('edit', $event)"
  />
</template>

<script setup>
import SectionTitle from "./SectionTitle.vue";
import TimetableTable from "./TimetableTable.vue";

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  className: { type: String, default: "" },

  // "morning" | "afternoon" | "custom"
  period: { type: String, default: "" },

  // ✅ NEW: for HOD view (disable clicking edit)
  readOnly: { type: Boolean, default: false },

  days: { type: Array, default: () => [] },
  times: { type: Array, default: () => [] },
  getSlot: { type: Function, required: true },
});

defineEmits(["edit"]);
</script>
