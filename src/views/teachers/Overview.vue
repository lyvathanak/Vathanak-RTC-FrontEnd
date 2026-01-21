<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1
            :class="[
              'text-3xl font-bold text-gray-900',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            {{ t("teacher_dashboard") }}
          </h1>
          <p
            :class="[
              'text-gray-600 mt-2',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            <!-- {{ t('welcome') }}, {{ authStore.user?.name }}! -->
            {{ t("welcome") }}, {{ authStore.userRole }}!
          </p>
        </div>
      </div>

      <!-- Teacher Info Card -->
      <div>
        <UserInfoCard
          :role="authStore.userRole"
          :user="detailUser"
          :locale="locale" />
      </div>

      <!-- <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2
          :class="[
            'text-xl font-semibold mb-4',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t("teacher_information") }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500"
              >{{ t("role") }}:</label
            >
            <p class="text-lg font-semibold text-green-600 capitalize">
              {{ authStore.userRole }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">{{
              t("email")
            }}</label>
            <p class="text-lg">{{ authStore.user?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500"
              >{{ t("department") }}:</label
            >
            <p class="text-lg">
              {{ authStore.user?.profile?.department_name || "—" }}
            </p>
          </div>
        </div>
      </div> -->

      <!-- Widgets -->
      <div>
        <OverviewWidgets
          :role="authStore.userRole"
          :stats="stats"
          @send="onChatSend" />
      </div>

      <!-- Permissions Teacher -->
      <div class="mt-6">
        <RolePermissions
          :role="authStore.userRole"
          :permissions="authStore.userPermissions"
          :locale="locale" />
      </div>

      <!-- Quick Actions -->
      <div class="mt-6">
        <RoleQuickActions
          :role="authStore.userRole"
          :lang="route.params.lang || 'en'"
          :locale="locale" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import { getTeacherProfile } from "@/stores/Teacher/TeacherProfile";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import OverviewWidgets from "@/components/overview/OverviewWidgets.vue";
import RolePermissions from "@/components/overview/RolePermissions.vue";
import RoleQuickActions from "@/components/overview/RoleQuickActions.vue";
import UserInfoCard from "@/components/overview/UserInfoCard.vue";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
};

const detailUser = ref(null);

onMounted(async () => {
  const data = await getTeacherProfile();
  detailUser.value = data?.user ?? data;
});

const stats = computed(() => ({
  // KPI
  courses: 8,
  students: 124,
  assignments: 15,
  // Line chart (7 days)
  line_series: [55, 60, 58, 62, 65, 63, 67],
  // Bar chart
  bar_labels: ["Graded", "Pending", "Late"],
  bar_values: [10, 4, 1],
  // Donut chart
  donut_labels: ["Active", "Neutral", "Inactive"],
  donut_values: [60, 25, 15],
}));

function onChatSend(payload) {
  console.log("Teacher send:", payload);
}
</script>
