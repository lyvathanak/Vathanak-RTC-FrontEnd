<template>
  <div class="space-y-1.5">
    <label v-if="label" class="text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div class="relative" ref="root">
      <!-- Trigger -->
      <button
        ref="btn"
        type="button"
        @click="toggle"
        :disabled="disabled"
        :aria-expanded="open"
        aria-haspopup="listbox"
        class="w-full h-11 rounded-2xl border bg-white px-4 text-sm font-semibold flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
        :class="[
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-200 focus:ring-[#235AA6]/30 focus:border-[#235AA6]',
          modelValue ? 'ring-1 ring-black/10 border-black' : '',
        ]">
        <span class="truncate">
          {{ selectedLabel || placeholder }}
        </span>

        <component
          :is="open ? ChevronUp : ChevronDown"
          class="h-4 w-4 shrink-0 text-gray-500" />
      </button>

      <!-- Dropdown -->
      <teleport :to="teleportTo">
        <transition name="fade">
          <div
            v-if="open && !disabled"
            ref="menu"
            role="listbox"
            class="fixed z-99999 rounded-2xl border bg-white shadow-lg p-2 max-h-64 overflow-auto"
            :style="dropdownStyle"
            @mousedown.stop
            @click.stop>
            <!-- All option -->
            <button
              v-if="allLabel"
              type="button"
              role="option"
              :aria-selected="isSelected('')"
              @click="select('')"
              class="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50"
              :class="isSelected('') ? 'bg-gray-100 font-semibold' : ''">
              {{ allLabel }}
            </button>

            <!-- Options -->
            <button
              v-for="opt in options"
              :key="String(opt.value)"
              type="button"
              role="option"
              :aria-selected="isSelected(opt.value)"
              @click="select(opt.value)"
              class="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50"
              :class="isSelected(opt.value) ? 'bg-gray-100 font-semibold' : ''">
              {{ opt.label }}
            </button>
          </div>
        </transition>
      </teleport>
    </div>

    <p v-if="hint" class="text-[11px] leading-4 text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { ChevronDown, ChevronUp } from "lucide-vue-next";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, default: () => [] }, // [{label, value}]
  placeholder: { type: String, default: "Select..." },
  label: { type: String, default: "" },
  required: { type: Boolean, default: false },
  allLabel: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: "" },
  teleportTo: { type: String, default: "body" },
  error: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const open = ref(false);
const root = ref(null);
const btn = ref(null);
const menu = ref(null);

const dropdownStyle = ref({
  top: "0px",
  left: "0px",
  width: "0px",
  transform: "none",
});

const selectedLabel = computed(() => {
  const mv = String(props.modelValue ?? "");
  if (mv === "" && props.allLabel) return props.allLabel;
  return props.options.find((o) => String(o.value) === mv)?.label || "";
});

function isSelected(v) {
  return String(v) === String(props.modelValue ?? "");
}

function close() {
  open.value = false;
}

function select(v) {
  emit("update:modelValue", v);
  emit("change", v);
  close();
}

function updatePosition() {
  const el = btn.value;
  if (!el) return;

  const r = el.getBoundingClientRect();
  const gap = 8;
  const menuMaxH = 256;

  const spaceBelow = window.innerHeight - r.bottom;
  const spaceAbove = r.top;
  const openUp = spaceBelow < menuMaxH && spaceAbove > spaceBelow;

  // clamp left so it stays in viewport
  const left = Math.max(8, Math.min(r.left, window.innerWidth - r.width - 8));

  dropdownStyle.value = {
    left: `${left}px`,
    width: `${r.width}px`,
    // when opening up: anchor at button top, then translateY(-100%)
    top: openUp ? `${r.top - gap}px` : `${r.bottom + gap}px`,
    transform: openUp ? "translateY(-100%)" : "none",
  };
}

async function toggle() {
  if (props.disabled) return;

  open.value = !open.value;
  if (open.value) {
    await nextTick();
    updatePosition();
  }
}

function onDocMouseDown(e) {
  if (!open.value) return;

  const inRoot = root.value?.contains(e.target);
  const inMenu = menu.value?.contains(e.target);
  if (!inRoot && !inMenu) close();
}

function onKeyDown(e) {
  if (!open.value) return;
  if (e.key === "Escape") close();
}

function onWinChange() {
  if (!open.value) return;
  updatePosition();
}

onMounted(() => {
  document.addEventListener("mousedown", onDocMouseDown);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onWinChange);
  window.addEventListener("scroll", onWinChange, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocMouseDown);
  document.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", onWinChange);
  window.removeEventListener("scroll", onWinChange, true);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
