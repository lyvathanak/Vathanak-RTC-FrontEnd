<template>
  <div class="mb-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Left: title & subtitle -->
      <div>
        <h1
          :class="[
            'text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight',
            titleColor,
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ title }}
        </h1>

        <p v-if="subtitle" class="text-gray-500 text-sm sm:text-base mt-1">
          {{ subtitle }}
        </p>
      </div>

      <!-- Right slot (actions) -->
      <div class="flex items-center gap-3">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  titleColor: {
    type: String,
    default: "text-[#235AA6]",
  },
});

const { locale } = useI18n();
</script>
