<template>
  <section :class="className">
    <SectionTitle :title="title" :subtitle="subtitle" />
    <TimetableTable
      :days="days"
      :times="times"
      :getSlot="getSlot"
      :readOnly="readOnly"
      @edit="$emit('edit', $event)" />
  </section>
</template>

<script setup>
import SectionTitle from "@/components/teachers/timetable/SectionTitle.vue";
import TimetableTable from "@/components/teachers/timetable/TimetableTable.vue";

defineProps({
  title: String,
  subtitle: String,
  period: String,
  className: { type: String, default: "" },
  days: Array,
  times: Array,
  getSlot: Function,
  readOnly: { type: Boolean, default: false },
});

defineEmits(["edit"]);
</script>
