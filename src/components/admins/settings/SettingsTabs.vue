<template>
  <aside class="space-y-3">
    <!-- Mobile dropdown -->
    <div
      class="lg:hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <label class="text-xs font-semibold text-gray-700">
        {{ t("section") || "Section" }}
      </label>
      <select
        :value="activeTab"
        @change="onTabChange"
        class="mt-2 w-full h-11 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30">
        <option v-for="tab in tabs" :key="tab.key" :value="tab.key">
          {{ tab.label }}
        </option>
      </select>
    </div>

    <!-- Desktop tabs -->
    <div
      class="hidden lg:block rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="px-4 py-4 border-b">
        <h3
          :class="['text-sm sm:text-base font-bold text-gray-900', khmerClass]">
          {{ t("settings_sections") || "Settings sections" }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
          {{ t("choose_section") || "Choose a section to edit" }}
        </p>
      </div>

      <div class="p-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="$emit('update:activeTab', tab.key)"
          :class="[
            'w-full text-left rounded-2xl px-3 py-3 transition flex items-start gap-3',
            activeTab === tab.key
              ? 'bg-blue-50 ring-1 ring-[#235AA6]/20'
              : 'hover:bg-gray-50',
          ]">
          <div
            :class="[
              'mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center shrink-0',
              activeTab === tab.key
                ? 'bg-[#235AA6] text-white'
                : 'bg-gray-100 text-gray-700',
            ]">
            <component :is="tab.icon" class="h-4 w-4" />
          </div>

          <div class="min-w-0">
            <div :class="['text-sm font-bold text-gray-900', khmerClass]">
              {{ tab.label }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {{ tab.desc }}
            </div>
          </div>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  activeTab: {
    type: String,
    validator: (v) =>
      ["account", "security", "language", "notifications", "system"].includes(
        v,
      ),
  },

  tabs: {
    type: Array,
    required: true,
  },
  khmerClass: {
    type: String,
    default: "",
  },
  t: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["update:activeTab"]);

function onTabChange(e) {
  const value = e.target.value;
  emit("update:activeTab", value);
}
</script>
