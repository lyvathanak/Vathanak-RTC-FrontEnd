<template>
  <div :class="['flex items-end justify-between mb-3', className]">
    <div class="flex items-start gap-3">
      <!-- Icon Circle -->
      <div
        v-if="showIcon"
        :class="[
          'flex items-center justify-center rounded-full shrink-0',
          iconSizeClass,
          iconBgClass
        ]"
      >
        <!-- Morning -->
        <Sun
          v-if="resolvedPeriod === 'morning'"
          class="w-5 h-5"
          :class="iconIconClass"
        />

        <!-- Afternoon -->
        <SunMoon
          v-else-if="resolvedPeriod === 'afternoon'"
          class="w-5 h-5"
          :class="iconIconClass"
        />

        <!-- Fallback -->
        <span
          v-else
          :class="['rounded-full', dotSizeClass, iconDotClass]"
        />
      </div>

      <!-- Text -->
      <div>
        <h3 class="text-lg sm:text-xl font-extrabold text-gray-900">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { computed } from "vue";
import { Sun, SunMoon } from "lucide-vue-next";

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  className: { type: String, default: "" },

  /**
   * "morning" | "afternoon" | "custom"
   * If not provided → auto-detect from title
   */
  period: { type: String, default: "" },

  showIcon: { type: Boolean, default: true },
});

/* auto detect from title */
const resolvedPeriod = computed(() => {
  if (props.period) return props.period.toLowerCase();
  if (/morning/i.test(props.title)) return "morning";
  if (/afternoon/i.test(props.title)) return "afternoon";
  return "custom";
});

/* background circle */
const iconBgClass = computed(() => {
  switch (resolvedPeriod.value) {
    case "morning":
      return "bg-yellow-100";
    case "afternoon":
      return "bg-blue-100";
    default:
      return "bg-gray-100";
  }
});

/* icon color */
const iconIconClass = computed(() => {
  switch (resolvedPeriod.value) {
    case "morning":
      return "text-yellow-600";
    case "afternoon":
      return "text-blue-600";
    default:
      return "text-gray-400";
  }
});

/* fallback dot color */
const iconDotClass = computed(() => {
  switch (resolvedPeriod.value) {
    case "morning":
      return "bg-yellow-500";
    case "afternoon":
      return "bg-blue-600";
    default:
      return "bg-gray-400";
  }
});

/* sizes */
const iconSizeClass = "w-9 h-9";
const dotSizeClass = "w-3 h-3";
</script>
