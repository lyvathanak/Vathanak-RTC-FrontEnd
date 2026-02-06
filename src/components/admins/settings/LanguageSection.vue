<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div class="px-4 sm:px-5 py-4 border-b bg-white">
      <h3 :class="['text-sm sm:text-base font-bold text-gray-900', khmerClass]">
        {{ t("language") || "Language & Region" }}
      </h3>
      <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
        {{ t("language_desc") || "Customize language and formats" }}
      </p>
    </div>

    <div class="p-4 sm:p-5 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- App language -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ t("app_language") || "App language" }}
          </label>

          <div class="h-11 flex items-center">
            <ChangLanguage v-model="appLanguage" :navigate="false" />
          </div>
        </div>

        <!-- Date format (buttons) -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ t("date_format") || "Date format" }}
          </label>

          <div class="segmented">
            <button
              v-for="opt in dateOptions"
              :key="opt.value"
              type="button"
              @click="update('dateFormat', opt.value)"
              :class="segmentClass(modelValue.dateFormat === opt.value)">
              <span class="truncate">{{ opt.label }}</span>
              <span
                v-if="modelValue.dateFormat === opt.value"
                class="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30">
                ✓
              </span>
            </button>
          </div>

          <p class="text-xs text-gray-500">
            Example:
            <span class="font-semibold text-gray-700">{{ datePreview }}</span>
          </p>
        </div>

        <!-- Time format (buttons) -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ t("time_format") || "Time format" }}
          </label>

          <div class="segmented">
            <button
              v-for="opt in timeOptions"
              :key="opt.value"
              type="button"
              @click="update('timeFormat', opt.value)"
              :class="segmentClass(modelValue.timeFormat === opt.value)">
              <span class="truncate">{{ opt.label }}</span>
              <span
                v-if="modelValue.timeFormat === opt.value"
                class="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30">
                ✓
              </span>
            </button>
          </div>

          <p class="text-xs text-gray-500">
            Example:
            <span class="font-semibold text-gray-700">{{ timePreview }}</span>
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p class="text-sm font-semibold text-[#235AA6]">
          Tip: You can apply language immediately by setting
          <code>locale.value</code> when you save.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import ChangLanguage from "@/components/language/ChangLanguage.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  t: { type: Function, required: true },
  khmerClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

function update(key, value) {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

const appLanguage = computed({
  get: () => props.modelValue.appLanguage,
  set: (val) => update("appLanguage", val),
});

const dateOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const timeOptions = [
  { value: "24h", label: "24 hours" },
  { value: "12h", label: "12 hours" },
];

// Small preview (no extra libs)
const datePreview = computed(() => {
  const d = new Date(2026, 0, 20); // Jan 20, 2026
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());

  const fmt = props.modelValue.dateFormat;
  if (fmt === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
  if (fmt === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
});

const timePreview = computed(() => {
  const fmt = props.modelValue.timeFormat;
  // Example time: 14:05
  if (fmt === "12h") return "2:05 PM";
  return "14:05";
});

function segmentClass(active) {
  return ["segment", active ? "segment--active" : "segment--inactive"];
}
</script>

<style scoped>
/* Tailwind-like segmented control but in CSS to keep it perfect and consistent */
.segmented {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

@media (min-width: 768px) {
  .segmented {
    gap: 10px;
  }
}

.segment {
  height: 44px;
  padding: 0 14px;
  border-radius: 16px; /* close to rounded-2xl */
  border: 1px solid rgba(229, 231, 235, 1); /* gray-200 */
  font-weight: 700;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 120ms ease,
    background 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease,
    color 120ms ease;
  outline: none;
  user-select: none;
}

.segment:active {
  transform: scale(0.99);
}

.segment--inactive {
  background: #ffffff;
  color: rgba(17, 24, 39, 1); /* gray-900 */
}

.segment--inactive:hover {
  background: rgba(243, 244, 246, 1); /* gray-100 */
}

.segment--active {
  background: #235aa6;
  color: #ffffff;
  border-color: #235aa6;
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.22);
}

.segment:focus-visible {
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.22);
  border-color: #235aa6;
}
</style>
