<template>
  <section class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-6 sm:mb-8">
      <Newspaper class="w-6 h-6 sm:w-7 sm:h-7 text-[#235AA6]" />
      <h2
        :class="[
          'text-lg sm:text-xl md:text-2xl font-bold text-[#235AA6]',
          locale === 'kh' ? 'khmer-text' : '',
        ]">
        {{ t("feedback") }}
      </h2>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center gap-2 text-gray-500 text-sm sm:text-base border rounded-xl bg-white p-6"
      :class="[locale === 'kh' ? 'khmer-text' : '']">
      <div
        class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
      {{ t("loading_feedback") }}
    </div>

    <!-- Empty -->
    <div
      v-else-if="items.length === 0"
      class="text-center text-gray-500 text-sm sm:text-base border rounded-xl bg-white p-6"
      :class="[locale === 'kh' ? 'khmer-text' : '']">
      <div class="flex flex-col items-center gap-2">
        <Newspaper class="w-10 h-10 text-gray-400" />
        <p>{{ t("no_feedback_yet") }}</p>
      </div>
    </div>

    <!-- Feedback List -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <article
        v-for="fb in pagedItems"
        :key="fb.id"
        class="group rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all duration-200 p-4 sm:p-5">
        <div class="space-y-3 sm:space-y-4">
          <!-- From -->
          <div>
            <label
              :class="[
                'block text-xs uppercase tracking-wide font-medium text-gray-500 mb-1',
                locale === 'kh' ? 'khmer-text' : '',
              ]">
              {{ t("from") }}
            </label>
            <div
              class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md">
              {{ !fb.email ? t("anonymous") : fb.email }}
            </div>
          </div>

          <!-- Remark -->
          <div>
            <label
              :class="[
                'block text-xs uppercase tracking-wide font-medium text-gray-500 mb-1',
                locale === 'kh' ? 'khmer-text' : '',
              ]">
              {{ t("remark") }}
            </label>
            <textarea
              :value="fb.remark ?? '—'"
              readonly
              rows="3"
              class="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border bg-white border-gray-300 rounded-md resize-none overflow-auto"
              :placeholder="t('remark')" />
          </div>

          <!-- Date -->
          <p class="text-[11px] sm:text-xs text-gray-400 text-right italic">
            {{ fb.created_at }}
          </p>
        </div>
      </article>
    </div>

    <!-- Footer -->
    <div
      class="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <button
        type="button"
        @click="reload"
        class="px-4 py-2.5 rounded-md border border-gray-300 bg-[#235AA6] text-white hover:bg-[#1f4f93] transition text-sm font-medium">
        {{ t("reload") }}
      </button>

      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-items="items.length"
        :page-size="pageSize"
        :show-page-size-selector="false"
        @update:currentPage="currentPage = $event" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineExpose } from "vue";
import api from "@/stores/apis/axios.js";
import { Newspaper } from "lucide-vue-next";
import Pagination from "@/components/features/Pagination.vue";
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

const items = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024
);

// Responsive page size: 4 on mobile, 6 on larger screens
const pageSize = computed(() => {
  return windowWidth.value < 640 ? 4 : 6; // sm breakpoint
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(items.value.length / pageSize.value))
);
const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return items.value.slice(start, start + pageSize.value);
});

/** Load from GET /locations/get_all_feedbacks (LocationCRUD style) */
async function reload() {
  loading.value = true;
  try {
    // Use the endpoint and response shape from Postman
    const res = await api.get("/feedbacks/get_feedbacks");
    // Response: { feedback: { data: [...] } }
    items.value = res?.data?.feedbacks?.data ?? [];
    // Reset to first page on reload
    currentPage.value = 1;
  } catch (e) {
    console.error("Failed to load feedback:", e);
    items.value = [];
  } finally {
    loading.value = false;
  }
}

/** Append newly created item from the submit form without refetch */
function append(newItem) {
  // Normalize fields in case backend returns null email
  items.value.unshift({
    id: newItem?.id,
    email: newItem?.email ?? null,
    remark: newItem?.remark ?? "",
    created_at: newItem?.created_at ?? new Date().toISOString(),
  });
  // Optionally, go to first page to show new feedback
  currentPage.value = 1;
}

onMounted(() => {
  reload();

  // Handle window resize for responsive page size
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };

  window.addEventListener("resize", handleResize);

  // Cleanup listener on unmount
  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });
});
defineExpose({ append, reload });
</script>
