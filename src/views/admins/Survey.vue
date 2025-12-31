<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { ArrowLeft } from 'lucide-vue-next';
import Header from '@/components/features/Header.vue';

const route = useRoute();
const router = useRouter();
const currentLang = computed(() => route.params.lang || 'en');

const navItems = [
  { path: 'survey-dashboard', label: 'Dashboard', name: 'SurveyDashboard' },
  { path: 'survey-creator', label: 'Creator', name: 'SurveyCreator' },
  { path: 'survey-reports', label: 'Reports', name: 'SurveyReports' },
  { path: 'survey-form', label: 'Form', name: 'SurveyForm' },
  { path: 'survey-table', label: 'Results', name: 'SurveyTableResult' },
];

const isActive = (routeName) => {
  return route.name === routeName;
};

const goBack = () => {
  router.push(`/${currentLang.value}/admin/overview`);
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <Header/>
    <!-- Header with Back Button -->
    <div class="bg-[#235AA6] text-white px-4 py-3 flex items-center gap-4">
      <button
        @click="goBack"
        class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
        <span class="text-sm font-medium">Back to Admin</span>
      </button>
      <h1 class="text-xl font-bold">Survey Management</h1>
    </div>

    <!-- Navigation Tabs -->
    <nav class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex gap-2 overflow-x-auto">
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="`/${currentLang}/admin/survey/${item.path}`"
          class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
          :class="isActive(item.name) 
            ? 'bg-[#235AA6] text-white' 
            : 'text-gray-700 hover:bg-gray-100'"
        >
          {{ item.label }}
        </router-link>
      </div>
    </nav>

    <!-- Child Route Content -->
    <div class="flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>
