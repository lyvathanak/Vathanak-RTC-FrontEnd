<template>
  <transition name="fade-up">
    <div
      v-if="show"
      class="sticky bottom-3 z-20 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-4 py-3 shadow-lg">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div class="text-sm font-semibold text-gray-800">
          You have unsaved changes
        </div>

        <div class="flex items-center gap-2 justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
            :disabled="saving"
            @click="$emit('reset')">
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f4f93] transition disabled:opacity-60"
            :disabled="saving || !!passwordError"
            @click="$emit('save')">
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  saving: {
    type: Boolean,
    required: true,
  },
  passwordError: {
    type: String,
    default: "",
  },
});

defineEmits(["reset", "save"]);
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.18s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
