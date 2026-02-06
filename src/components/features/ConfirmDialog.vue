<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        @click="close" />

      <!-- Dialog -->
      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descId"
          @click.stop>
          <!-- Header -->
          <div
            class="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
            <div
              class="mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center ring-1"
              :class="iconWrapClass">
              <component :is="icon" class="h-5 w-5" :class="iconClass" />
            </div>

            <div class="flex-1 min-w-0">
              <h3 :id="titleId" class="text-base font-extrabold text-gray-900">
                {{ title }}
              </h3>
              <p :id="descId" class="text-sm text-gray-500 mt-1">
                {{ message }}
              </p>
            </div>

            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="close"
              :disabled="loading"
              aria-label="Close">
              ✕
            </button>
          </div>

          <!-- Optional extra content -->
          <div v-if="$slots.default" class="px-5 pt-4">
            <slot />
          </div>

          <!-- Actions -->
          <div
            class="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              class="h-10 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              @click="close"
              :disabled="loading">
              {{ cancelText }}
            </button>

            <button
              ref="confirmBtn"
              type="button"
              class="h-10 px-4 rounded-xl font-semibold text-white disabled:cursor-not-allowed"
              :class="confirmBtnClass"
              @click="!loading && $emit('confirm')"
              :disabled="loading">
              <span v-if="loading" class="inline-flex items-center gap-2">
                <span
                  class="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
                Processing...
              </span>
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch, ref, nextTick } from "vue";
import { AlertTriangle } from "lucide-vue-next";

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "Confirm Action" },
  message: { type: String, default: "Are you sure you want to continue?" },
  type: { type: String, default: "warning" }, // warning | success | info | danger
  confirmText: { type: String, default: "Confirm" },
  cancelText: { type: String, default: "Cancel" },
  loading: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: AlertTriangle },
});

const emit = defineEmits(["close", "confirm"]);

const titleId = "confirm-dialog-title";
const descId = "confirm-dialog-desc";

const confirmBtn = ref(null);

const close = () => {
  if (props.loading) return;
  emit("close");
};

const onKeydown = (e) => {
  if (!props.open) return;
  if (e.key === "Escape") close();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

watch(
  () => props.open,
  async (v) => {
    if (v) {
      await nextTick();
      confirmBtn.value?.focus();
    }
  },
);

const iconWrapClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-red-50 ring-red-100";
    case "success":
      return "bg-green-50 ring-green-100";
    case "info":
      return "bg-blue-50 ring-blue-100";
    default:
      return "bg-yellow-50 ring-yellow-100";
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "text-red-600";
    case "success":
      return "text-green-600";
    case "info":
      return "text-blue-600";
    default:
      return "text-yellow-600";
  }
});

const confirmBtnClass = computed(() => {
  switch (props.type) {
    case "danger":
      return "bg-red-600 hover:bg-red-700 disabled:bg-red-400";
    case "success":
      return "bg-green-600 hover:bg-green-700 disabled:bg-green-400";
    case "info":
      return "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400";
    default:
      return "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400";
  }
});
</script>
