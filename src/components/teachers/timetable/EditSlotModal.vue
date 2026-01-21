<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @keydown.esc.prevent="close">
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="close"
          aria-hidden="true" />

        <!-- Modal -->
        <div
          ref="panel"
          class="relative w-full max-w-md rounded-lg bg-white shadow-xl ring-1 ring-black/5"
          @click.stop>
          <!-- Header -->
          <div
            class="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div class="min-w-0">
              <h3 class="text-base font-extrabold text-gray-900">Edit Slot</h3>
              <p class="mt-1 text-sm text-gray-500 truncate">
                {{ day }} • {{ time }}
              </p>
            </div>

            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#235AA6]"
              @click="close"
              aria-label="Close">
              ✕
            </button>
          </div>

          <!-- Body -->
          <form class="space-y-4 px-5 py-4" @submit.prevent="save">
            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-gray-700">Subject</label>
              <input
                ref="firstInput"
                :value="local.subject"
                @input="setField('subject', $event.target.value)"
                placeholder="e.g. Math"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/20"
                autocomplete="off" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-gray-700">Teacher</label>
              <input
                :value="local.teacher"
                @input="setField('teacher', $event.target.value)"
                placeholder="e.g. Mr. Dara"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/20"
                autocomplete="off" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-semibold text-gray-700">Room</label>
              <input
                :value="local.room"
                @input="setField('room', $event.target.value)"
                placeholder="e.g. A-203"
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/20"
                autocomplete="off" />
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between border-t pt-4">
              <button
                type="button"
                class="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                @click="onDelete">
                Delete
              </button>

              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  @click="close">
                  Cancel
                </button>

                <button
                  type="submit"
                  class="rounded-lg bg-[#235AA6] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30"
                  :disabled="!canSave"
                  :class="!canSave ? 'opacity-50 cursor-not-allowed' : ''">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  day: { type: String, default: "" },
  time: { type: String, default: "" },
  modelValue: {
    type: Object,
    default: () => ({ subject: "", teacher: "", room: "" }),
  },
});

const emit = defineEmits(["update:modelValue", "close", "save", "delete"]);

const firstInput = ref(null);
const panel = ref(null);

// local editable copy (prevents weird reactivity bugs)
const local = reactive({
  subject: "",
  teacher: "",
  room: "",
});

watch(
  () => props.modelValue,
  (v) => {
    local.subject = v?.subject ?? "";
    local.teacher = v?.teacher ?? "";
    local.room = v?.room ?? "";
  },
  { immediate: true, deep: true }
);

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      firstInput.value?.focus?.();
    }
  }
);

function setField(key, value) {
  local[key] = value;

  // emit clean v-model update
  emit("update:modelValue", {
    ...props.modelValue,
    ...local,
    [key]: value,
  });
}

const canSave = computed(() => {
  // require subject (you can remove this rule if you want)
  return (local.subject || "").trim().length > 0;
});

function close() {
  emit("close");
}

function save() {
  // emit final save with clean payload
  emit("update:modelValue", { ...props.modelValue, ...local });
  emit("save");
}

function onDelete() {
  emit("delete");
  emit("close");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
