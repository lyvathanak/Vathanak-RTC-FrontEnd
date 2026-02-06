<template>
  <!-- Outer blue frame like the picture -->
  <div class="rounded-xl bg-[#235AA6] p-4 shadow-lg">
    <div class="rounded-[22px] overflow-hidden bg-[#235AA6]">
      <!-- Blue calendar area -->
      <div class="p-4">
        <!-- Search (darker pill inside blue) -->
        <div
          class="flex items-center gap-2 rounded-full px-4 py-3 mb-5 bg-black/15 ring-1 ring-white/10">
          <Search class="w-4 h-4 text-white/80" />
          <input
            v-model="localSearch"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/70" />
        </div>

        <!-- Month header -->
        <div class="flex items-center justify-between mb-3">
          <div class="text-white font-semibold text-base">
            {{ monthLabel }}
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="prevMonth"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 flex items-center justify-center transition">
              <ChevronLeft class="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              @click="nextMonth"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 flex items-center justify-center transition">
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

      <!-- White sheet (overlap like the picture) -->
      <div class="relative bg-white rounded-t-[26px] -mt-1 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-800">
            {{ sheetTitle }}
          </h3>

          <button
            type="button"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <MoreHorizontal class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs text-gray-500">{{ titleLabel }}</label>
            <input
              v-model="form.title"
              class="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#235AA6]"
              :placeholder="titlePlaceholder" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-500">{{ dateLabel }}</label>
              <input
                v-model="form.date"
                type="date"
                class="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#235AA6]" />
            </div>

            <div>
              <label class="text-xs text-gray-500">{{ timeLabel }}</label>
              <input
                v-model="form.time"
                type="time"
                class="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#235AA6]" />
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-500">{{ inviteLabel }}</label>
            <input
              v-model="form.invite"
              class="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#235AA6]"
              :placeholder="invitePlaceholder" />
          </div>

          <button
            type="button"
            @click="submit"
            class="w-full py-3 rounded-xl bg-[#235AA6] text-white text-sm font-semibold hover:opacity-95 active:opacity-90 transition">
            {{ submitText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-vue-next";

// ✅ Correct import (default export)
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const props = defineProps({
  modelValue: { type: [Date, String, Number, null], default: () => new Date() },
  searchValue: { type: String, default: "" },

  // ✅ dates that should show the 3-dot indicator under the number
  markedDates: { type: Array, default: () => [] }, // array of Date | string | number

  sheetTitle: { type: String, default: "Add new list" },
  searchPlaceholder: { type: String, default: "Search" },

  titleLabel: { type: String, default: "Title" },
  titlePlaceholder: { type: String, default: "Title" },

  dateLabel: { type: String, default: "Date" },
  timeLabel: { type: String, default: "Time" },

  inviteLabel: { type: String, default: "Invite people" },
  invitePlaceholder: { type: String, default: "Invite people" },

  submitText: { type: String, default: "Submit List" },
});

const emit = defineEmits(["update:modelValue", "update:searchValue", "submit"]);

const localDate = ref(
  props.modelValue ? new Date(props.modelValue) : new Date()
);
const localSearch = ref(props.searchValue);

watch(
  () => props.modelValue,
  (v) => (localDate.value = v ? new Date(v) : new Date())
);

watch(localDate, (v) => emit("update:modelValue", v));
watch(
  () => props.searchValue,
  (v) => (localSearch.value = v)
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

const form = reactive({ title: "", date: "", time: "", invite: "" });

function submit() {
  emit("submit", { selectedDate: localDate.value, ...form });
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// add dots like the screenshot
const marked = computed(() =>
  props.markedDates.map((x) => new Date(x)).filter((d) => !isNaN(d.getTime()))
);

function dayClass(date) {
  const d = new Date(date);
  const has = marked.value.some((m) => sameDay(m, d));
  return has ? "has-dot" : "";
}
</script>

<style scoped>
/* --- base remove default blocks --- */
.calendar-blue :deep(.dp__main),
.calendar-blue :deep(.dp__menu),
.calendar-blue :deep(.dp__calendar) {
  border: none !important;
  background: transparent !important;
  width: 100%;
}

/* hide DatePicker built-in header */
.calendar-blue :deep(.dp__month_year_wrap),
.calendar-blue :deep(.dp__calendar_header_separator),
.calendar-blue :deep(.dp__arrow_top),
.calendar-blue :deep(.dp__button),
.calendar-blue :deep(.dp__action_row),
.calendar-blue :deep(.dp__action_buttons) {
  display: none !important;
}

/* weekday labels like picture */
/* ✅ make header always 7 columns */
.calendar-blue :deep(.dp__calendar_header) {
  display: grid !important;
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: clamp(4px, 1.2vw, 10px) !important;

  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 10px;
}

.calendar-blue :deep(.dp__calendar_header_item) {
  text-align: center !important;
  color: rgba(255, 255, 255, 0.85);
}

/* ✅ make each week row always 7 columns */
.calendar-blue :deep(.dp__calendar_row) {
  display: grid !important;
  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
  gap: clamp(4px, 1.2vw, 10px) !important;
}

/* each cell wrapper centers the circle */
.calendar-blue :deep(.dp__calendar_item) {
  display: flex !important;
  justify-content: center !important;
}

/* ✅ day circle scales to fit column, never overflow */
.calendar-blue :deep(.dp__cell_inner) {
  width: min(46px, 100%) !important;
  aspect-ratio: 1 / 1 !important; /* keeps perfect circle */
  height: auto !important;

  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: rgba(255, 255, 255, 0.92);
  font-weight: 600;
  transition: background 0.15s ease, transform 0.08s ease;
  position: relative;
  font-size: clamp(11px, 2.6vw, 14px);
}

/* hover */
.calendar-blue :deep(.dp__cell_inner:hover) {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}

/* outside month */
.calendar-blue :deep(.dp__cell_offset),
.calendar-blue :deep(.dp__cell_disabled) {
  opacity: 0.35;
}

/* selected day = white circle (like picture) */
.calendar-blue :deep(.dp__active_date) {
  background: #ffffff !important;
  color: #2f63f6 !important;
  font-weight: 800 !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
}

/* remove today border ring (picture doesn’t show ring) */
.calendar-blue :deep(.dp__today) {
  border: none !important;
}

/* --- three dots under certain dates --- */
.calendar-blue :deep(.has-dot.dp__cell_inner)::after {
  content: "•••";
  position: absolute;
  bottom: 2px;
  font-size: 9px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
}

/* keep dots visible even if selected (but blue dots) */
.calendar-blue :deep(.has-dot.dp__active_date)::after {
  color: rgba(47, 99, 246, 0.9);
}
</style>
