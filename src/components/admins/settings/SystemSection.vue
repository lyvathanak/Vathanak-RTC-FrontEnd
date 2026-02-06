<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b bg-white">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <div
            class="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Settings class="h-5 w-5 text-[#235AA6]" />
          </div>

          <div class="min-w-0">
            <h3
              :class="[
                'text-sm sm:text-base font-bold text-gray-900',
                khmerClass,
              ]">
              {{ safeT("system", "System") }}
            </h3>
            <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
              {{ safeT("system_desc", "Admin preferences and defaults") }}
            </p>
          </div>
        </div>

        <span
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 shrink-0">
          <ShieldAlert class="h-3.5 w-3.5" />
          {{ safeT("admin_only", "Admin only") }}
        </span>
      </div>
    </div>

    <div class="p-4 sm:p-6 space-y-5">
      <!-- Preferences -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Default academic year -->
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <label class="text-xs font-extrabold text-gray-700">
            {{ safeT("default_academic_year", "Default academic year") }}
          </label>
          <p class="text-xs text-gray-500 mt-1">
            {{
              safeT(
                "default_academic_year_desc",
                "Used as the default when creating new records",
              )
            }}
          </p>

          <div class="mt-3 relative">
            <Calendar
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              :value="modelValue.defaultAcademicYear"
              @input="onText('defaultAcademicYear', $event)"
              type="text"
              placeholder="2025-2026"
              class="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]" />
          </div>
        </div>

        <!-- Sidebar default -->
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <label class="text-xs font-extrabold text-gray-700">
            {{ safeT("sidebar_default", "Sidebar default") }}
          </label>
          <p class="text-xs text-gray-500 mt-1">
            {{
              safeT(
                "sidebar_default_desc",
                "Choose how the sidebar appears by default",
              )
            }}
          </p>

          <!-- Button Select -->
          <div
            class="mt-3 inline-flex rounded-2xl border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              @click="update('sidebarDefault', 'icon')"
              :class="[
                'px-4 py-2 text-sm font-bold rounded-xl transition focus:outline-none',
                modelValue.sidebarDefault === 'icon'
                  ? 'bg-white text-[#235AA6] shadow ring-1 ring-[#235AA6]/20'
                  : 'text-gray-600 hover:text-gray-900',
              ]">
              <PanelLeft class="h-4 w-4 inline mr-1.5" />
              {{ safeT("sidebar_icon_mode", "Icon mode") }}
            </button>

            <button
              type="button"
              @click="update('sidebarDefault', 'expanded')"
              :class="[
                'px-4 py-2 text-sm font-bold rounded-xl transition focus:outline-none',
                modelValue.sidebarDefault === 'expanded'
                  ? 'bg-white text-[#235AA6] shadow ring-1 ring-[#235AA6]/20'
                  : 'text-gray-600 hover:text-gray-900',
              ]">
              <PanelLeftOpen class="h-4 w-4 inline mr-1.5" />
              {{ safeT("sidebar_expanded", "Expanded") }}
            </button>
          </div>
        </div>

        <!-- Compact tables (switch) -->
        <div
          class="rounded-2xl border border-gray-200 bg-white p-4 md:col-span-2">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-sm font-extrabold text-gray-900">
                {{ safeT("compact_tables", "Compact tables") }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{
                  safeT(
                    "compact_tables_desc",
                    "Reduce spacing for dense data tables",
                  )
                }}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              :aria-checked="modelValue.compactTables"
              @click="update('compactTables', !modelValue.compactTables)"
              :class="[
                'switch',
                modelValue.compactTables ? 'switch--on' : 'switch--off',
              ]">
              <span
                :class="[
                  'switch-dot',
                  modelValue.compactTables
                    ? 'switch-dot--on'
                    : 'switch-dot--off',
                ]" />
            </button>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
        <div class="flex items-start gap-3">
          <div
            class="h-10 w-10 rounded-2xl bg-white border border-red-200 flex items-center justify-center shrink-0">
            <TriangleAlert class="h-5 w-5 text-red-600" />
          </div>

          <div class="min-w-0">
            <p class="text-sm font-extrabold text-red-800">
              {{ safeT("danger_zone", "Danger zone") }}
            </p>
            <p class="text-xs text-red-700 mt-1">
              {{
                safeT(
                  "danger_zone_desc",
                  "Be careful. These actions can affect system data.",
                )
              }}
            </p>

            <div class="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                @click="emit('clearCache')">
                <Eraser class="h-4 w-4" />
                {{ safeT("clear_cache", "Clear cache") }}
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
                @click="emit('lockAccount')">
                <Lock class="h-4 w-4" />
                {{ safeT("lock_account", "Lock account") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Optional tip -->
      <div class="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p class="text-sm font-semibold text-[#235AA6]">
          {{
            safeT(
              "system_tip",
              "Tip: Save changes to apply admin defaults system-wide.",
            )
          }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import {
  Settings,
  ShieldAlert,
  Calendar,
  PanelLeft,
  ChevronDown,
  TriangleAlert,
  Eraser,
  Lock,
  PanelLeftOpen,
} from "lucide-vue-next";

const { t, te } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      defaultAcademicYear: "",
      compactTables: false,
      sidebarDefault: "icon",
    }),
  },
  khmerClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "clearCache", "lockAccount"]);

function update(key, value) {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

function onText(key, e) {
  update(key, e.target.value);
}

function onSelect(key, e) {
  update(key, e.target.value);
}

/** ✅ No i18n missing-key warning */
function safeT(key, fallback) {
  return te(key) ? t(key) : fallback;
}
</script>

<style scoped>
/* Switch */
.switch {
  position: relative;
  width: 46px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(229, 231, 235, 1);
  transition:
    background 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
  outline: none;
  flex-shrink: 0;
}
.switch--off {
  background: #fff;
}
.switch--on {
  background: rgba(35, 90, 166, 1);
  border-color: rgba(35, 90, 166, 1);
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.18);
}
.switch:focus-visible {
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.18);
  border-color: rgba(35, 90, 166, 1);
}

.switch-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 999px;
  transition:
    left 140ms ease,
    background 120ms ease,
    border-color 120ms ease;
  border: 1px solid rgba(229, 231, 235, 1);
  background: #fff;
}
.switch-dot--off {
  left: 3px;
}
.switch-dot--on {
  left: 21px;
  border-color: rgba(255, 255, 255, 0.35);
}
</style>
