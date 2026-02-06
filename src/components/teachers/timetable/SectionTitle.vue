<template>
  <!-- Single root + inherit class from parent -->
  <div
    v-bind="$attrs"
    class="mb-4 rounded-2xl border border-gray-200 bg-white px-4 sm:px-5 py-4 shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <!-- Left: icon + text -->
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div
          v-if="showIcon"
          :class="[
            'flex items-center justify-center shrink-0 rounded-xl ring-1',
            iconSizeClass,
            iconBgClass,
            iconRingClass,
          ]">
          <!-- Morning -->
          <Sun
            v-if="resolvedPeriod === 'morning'"
            class="h-5 w-5"
            :class="iconIconClass"
          />

          <!-- Afternoon -->
          <SunMoon
            v-else-if="resolvedPeriod === 'afternoon'"
            class="h-5 w-5"
            :class="iconIconClass"
          />

          <!-- Fallback -->
          <span v-else :class="['rounded-full', dotSizeClass, iconDotClass]" />
        </div>

        <!-- Text -->
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm text-gray-500 mt-1">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right: badge -->
      <div class="hidden sm:flex items-center gap-2">
        <span
          :class="[
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1',
            badgeBgClass,
            badgeTextClass,
            badgeRingClass,
          ]">
          {{ badgeText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Sun, SunMoon } from "lucide-vue-next";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },

  // "morning" | "afternoon" | "custom"
  period: { type: String, default: "" },
  showIcon: { type: Boolean, default: true },
});

/* auto detect */
const resolvedPeriod = computed(() => {
  if (props.period) return props.period.toLowerCase();
  if (/morning/i.test(props.title)) return "morning";
  if (/afternoon/i.test(props.title)) return "afternoon";
  return "custom";
});

/* icon bg + ring + icon color */
const iconBgClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "bg-yellow-50";
  if (resolvedPeriod.value === "afternoon") return "bg-blue-50";
  return "bg-gray-50";
});

const iconRingClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "ring-yellow-100";
  if (resolvedPeriod.value === "afternoon") return "ring-blue-100";
  return "ring-gray-200";
});

const iconIconClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "text-yellow-700";
  if (resolvedPeriod.value === "afternoon") return "text-blue-700";
  return "text-gray-500";
});

/* fallback dot */
const iconDotClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "bg-yellow-600";
  if (resolvedPeriod.value === "afternoon") return "bg-blue-700";
  return "bg-gray-500";
});

/* badge */
const badgeText = computed(() => {
  if (resolvedPeriod.value === "morning") return "AM";
  if (resolvedPeriod.value === "afternoon") return "PM";
  return "Schedule";
});

const badgeBgClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "bg-yellow-50";
  if (resolvedPeriod.value === "afternoon") return "bg-blue-50";
  return "bg-gray-50";
});

const badgeTextClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "text-yellow-700";
  if (resolvedPeriod.value === "afternoon") return "text-blue-700";
  return "text-gray-600";
});

const badgeRingClass = computed(() => {
  if (resolvedPeriod.value === "morning") return "ring-yellow-100";
  if (resolvedPeriod.value === "afternoon") return "ring-blue-100";
  return "ring-gray-200";
});

/* sizes */
const iconSizeClass = "w-10 h-10";
const dotSizeClass = "w-3 h-3";
</script>