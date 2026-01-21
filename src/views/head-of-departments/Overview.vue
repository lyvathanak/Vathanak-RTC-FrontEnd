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
            {{ t("hod_dashboard") }}
          </h1>
          <p
            :class="[
              'text-gray-600 mt-2',
              locale === 'kh' ? 'khmer-text' : '',
            ]">
            <!-- {{ t('welcome') }}, {{ authStore.user?.name }}! -->
            {{ t("welcome") }},{{ authStore.userRole.replace(/_/g, " ") }}!
          </p>
        </div>
      </div>

      <!-- Department Head Info Card -->
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
          {{ t("department_head_information") }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500"
              >{{ t("role") }}:</label
            >
            <p class="text-lg font-semibold text-purple-600 capitalize">
              {{ authStore.userRole.replace(/_/g, " ") }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500"
              >{{ t("email") }}:</label
            >
            <p class="text-lg">{{ authStore.user?.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500"
              >{{ t("department") }}:</label
            >
            <p class="text-lg">{{ authStore.user?.profile?.department }}</p>
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

      <!-- Permissions Head of Department -->
      <div class="mt-6">
        <RolePermissions
          :role="authStore.userRole"
          :permissions="authStore.userPermissions"
          :locale="locale" />
      </div>

      <!-- Department Management Actions  -->
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
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
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
  const data = await getHODProfile();
  detailUser.value = data?.user ?? data;
});

const stats = computed(() => ({
  department_teachers: 12,
  department_courses: 18,
  department_students: 285,
  pending_requests: 7,

  // charts
  line_series: [70, 72, 71, 74, 73, 75, 76],
  bar_labels: ["Leave", "Attendance", "Other"],
  bar_values: [4, 9, 2],
  donut_labels: ["Light", "Medium", "Heavy"],
  donut_values: [30, 50, 20],
}));

function onChatSend(payload) {
  console.log("HOD send:", payload);
}
</script>