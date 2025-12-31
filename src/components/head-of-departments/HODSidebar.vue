<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import NavMain from "@/components/features/NavMain.vue";
import SidebarTrigger from "../ui/sidebar/SidebarTrigger.vue";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import {
  Book,
  CalendarDays,
  Gauge,
  HomeIcon,
  User,
  FileText,
  GraduationCap,
  CheckCircle,
  DollarSign,
  BarChart3,
  Users,
  UserCheck,
  Clock,
} from "lucide-vue-next";

const { t, locale } = useI18n();
const router = useRouter();

const props = withDefaults(
  defineProps<{
    collapsible?: "offcanvas" | "icon" | "none";
    isOpen?: boolean;
  }>(),
  {
    collapsible: "icon",
    isOpen: false,
  }
);

const handleNavClick = (item: any) => {
  if (item?.url) {
    router.push(item.url).catch((err) => {});
  }
  if (props.collapsible === "offcanvas") {
  }
};
const route = useRoute();

const data = computed(() => {
  const currentLang = route.params.lang || "en";
  const currentPath = route.path;

  const khmerClass = locale.value === "kh" ? "khmer-text" : "";
  return {
    navMain: [
      {
        title: t("overview"),
        url: `/${currentLang}/hod/overview`,
        icon: Gauge,
        isActive: currentPath.includes("/hod/overview"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("students_management"),
        url: `/${currentLang}/hod/student-management`,
        icon: Users,
        isActive: currentPath.includes("/hod/student-management"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("teachers_management"),
        url: `/${currentLang}/hod/teacher-management`,
        icon: UserCheck,
        isActive: currentPath.includes("/hod/teacher-management"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("timetable_management"),
        url: `/${currentLang}/hod/timetable`,
        icon: CalendarDays,
        isActive: currentPath.includes("/hod/timetable"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("hod_leave_requests"),
        url: `/${currentLang}/hod/leave-requests`,
        icon: Clock,
        isActive: currentPath.includes("/hod/leave-requests"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("profile_account"),
        url: `/${currentLang}/hod/hod-profile`,
        icon: User,
        isActive: currentPath.includes("/hod/hod-profile"),
        class: khmerClass,
        action: handleNavClick,
      },
    ],
  };
});
</script>

<template>
  <Sidebar
    :collapsible="props.collapsible"
    :default-open="false"
    variant="sidebar"
    class="min-w-0 shrink-0">
    <SidebarContent class="bg-[#235AA6]">
      <!-- Sidebar Header -->
      <div
        class="flex items-center px-3 py-[19px] border-b border-white/20 gap-2">
        <SidebarTrigger class="text-white hover:bg-white/10" />
        <!-- Show title when sidebar is expanded -->
        <div
          :class="[
            'text-white text-1xl font-semibold',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t("management") }}
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto">
        <NavMain
          :items="data.navMain"
          :item-class="locale === 'kh' ? 'khmer-text' : ''"
          @item-click="(item) => console.log('Clicked:', item.title)" />
      </div>
    </SidebarContent>
  </Sidebar>
</template>
