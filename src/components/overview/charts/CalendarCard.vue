<template>
  <div class="rounded-2xl bg-[#235AA6] p-3.5 shadow-xl">
    <!-- inner frame -->
    <div
      class="rounded-[22px] overflow-hidden ">
      <div class="p-4 sm:p-5">
        <!-- Search -->
        <div
          class="flex items-center gap-2 rounded-full px-4 py-3 mb-5 bg-white/10 ring-1 ring-white/15 backdrop-blur-md focus-within:ring-white/30 focus-within:bg-white/12 transition">
          <Search class="w-4 h-4 text-white/80" />
          <input
            v-model="localSearch"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/65" />
        </div>

        <!-- Month header -->
        <div class="flex items-center justify-between mb-3">
          <div
            class="text-white font-extrabold tracking-tight text-[15px] sm:text-base">
            {{ monthLabel }}
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="prevMonth"
              class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/18 active:bg-white/25 ring-1 ring-white/15 hover:ring-white/25 flex items-center justify-center transition"
              aria-label="Previous month">
              <ChevronLeft class="w-5 h-5 text-white" />
            </button>

            <button
              type="button"
              @click="nextMonth"
              class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/18 active:bg-white/25 ring-1 ring-white/15 hover:ring-white/25 flex items-center justify-center transition"
              aria-label="Next month">
              <ChevronRight class="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <!-- Datepicker -->
        <VueDatePicker
          v-model="localDate"
          inline
          auto-apply
          :enable-time-picker="false"
          :month-change-on-scroll="false"
          :hide-offset-dates="false"
          :day-class="dayClass"
          class="calendar-blue" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Search, ChevronLeft, ChevronRight } from "lucide-vue-next";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const props = defineProps({
  modelValue: { type: [Date, String, Number, null], default: () => new Date() },
  searchValue: { type: String, default: "" },
  markedDates: { type: Array, default: () => [] },
  searchPlaceholder: { type: String, default: "Search" },
});

const emit = defineEmits(["update:modelValue", "update:searchValue"]);

const localDate = ref(
  props.modelValue ? new Date(props.modelValue) : new Date(),
);
const localSearch = ref(props.searchValue);

watch(
  () => props.modelValue,
  (v) => (localDate.value = v ? new Date(v) : new Date()),
);
watch(localDate, (v) => emit("update:modelValue", v));

watch(
  () => props.searchValue,
  (v) => (localSearch.value = v),
);
watch(localSearch, (v) => emit("update:searchValue", v));

const monthLabel = computed(() => {
  const d =
    localDate.value instanceof Date
      ? localDate.value
      : new Date(localDate.value);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
});

function prevMonth() {
  const d = new Date(localDate.value);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  localDate.value = d;
}

function nextMonth() {
  const d = new Date(localDate.value);
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  localDate.value = d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const marked = computed(() =>
  props.markedDates.map((x) => new Date(x)).filter((d) => !isNaN(d.getTime())),
);

function dayClass(date) {
  const d = new Date(date);
  return marked.value.some((m) => sameDay(m, d)) ? "has-dot" : "";
}
</script>

<style scoped>
/* transparent base */
.calendar-blue :deep(.dp__main),
.calendar-blue :deep(.dp__menu),
.calendar-blue :deep(.dp__calendar) {
  border: none !important;
  background: transparent !important;
  width: 100%;
}

/* hide built-in header/buttons */
.calendar-blue :deep(.dp__month_year_wrap),
.calendar-blue :deep(.dp__calendar_header_separator),
.calendar-blue :deep(.dp__arrow_top),
.calendar-blue :deep(.dp__button),
.calendar-blue :deep(.dp__action_row),
.calendar-blue :deep(.dp__action_buttons) {
  display: none !important;
}

/* weekday header */
.calendar-blue :deep(.dp__calendar_header) {
  display: grid !important;
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: 10px !important;
  margin-bottom: 10px;

  color: rgba(255, 255, 255, 0.82);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.calendar-blue :deep(.dp__calendar_header_item) {
  text-align: center !important;
}

/* ✅ keep all weeks stable */
.calendar-blue :deep(.dp__calendar) {
  min-height: 312px; /* prevents layout jump between months */
}

/* week rows */
.calendar-blue :deep(.dp__calendar_row) {
  display: grid !important;
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: 10px !important;
  padding: 2px 0;
}

/* center cell */
.calendar-blue :deep(.dp__calendar_item) {
  display: flex !important;
  justify-content: center !important;
}

/* day circle */
.calendar-blue :deep(.dp__cell_inner) {
  width: min(46px, 100%) !important;
  aspect-ratio: 1 / 1 !important;
  height: auto !important;

  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 14px;

  transition:
    transform 0.12s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
  position: relative;
}

/* hover */
.calendar-blue :deep(.dp__cell_inner:hover) {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}

/* outside month */
.calendar-blue :deep(.dp__cell_offset),
.calendar-blue :deep(.dp__cell_disabled) {
  opacity: 0.32;
}

/* selected */
.calendar-blue :deep(.dp__active_date) {
  background: #ffffff !important;
  color: #2f63f6 !important;
  font-weight: 900 !important;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.18);
}

/* remove today ring */
.calendar-blue :deep(.dp__today) {
  border: none !important;
}

/* ✅ REAL 3 dots (cleaner than "•••") */
.calendar-blue :deep(.has-dot.dp__cell_inner)::after {
  content: "";
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    -6px 0 0 rgba(255, 255, 255, 0.92),
    6px 0 0 rgba(255, 255, 255, 0.92);
}

/* dots when selected */
.calendar-blue :deep(.has-dot.dp__active_date)::after {
  background: rgba(47, 99, 246, 0.95);
  box-shadow:
    -6px 0 0 rgba(47, 99, 246, 0.95),
    6px 0 0 rgba(47, 99, 246, 0.95);
}
/* --- TODAY focus (soft glow) --- */
.calendar-blue :deep(.dp__today:not(.dp__active_date)) {
  background: rgba(255, 255, 255, 0.12) !important;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.35),
    0 0 18px rgba(255, 255, 255, 0.25);
  font-weight: 800;
}

/* keep today text strong */
.calendar-blue :deep(.dp__today:not(.dp__active_date)) {
  color: #ffffff !important;
}

/* when today IS selected → selected style wins */
.calendar-blue :deep(.dp__today.dp__active_date) {
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.22) !important;
}
</style>
