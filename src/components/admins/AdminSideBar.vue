<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import NavMain from "@/components/features/NavMain.vue";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import {
  Book,
  CalendarDays,
  Gauge,
  HomeIcon,
  User,
  UserCheck,
  Clock,
  Users,
  Building,
  BookOpen,
  MapPin,
  Settings,
} from "lucide-vue-next";
import SidebarTrigger from "../ui/sidebar/SidebarTrigger.vue";

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
  // try navigate only if url provided
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
        url: `/${currentLang}/admin/overview`,
        icon: Gauge,
        isActive: currentPath.includes("/admin/overview"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("students_management"),
        url: `/${currentLang}/admin/students`,
        icon: User,
        isActive: currentPath.includes("/admin/students"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("teachers_management"),
        url: `/${currentLang}/admin/teachers`,
        icon: User,
        isActive: currentPath.includes("/admin/teachers"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("hod_management"),
        url: `/${currentLang}/admin/hod`,
        icon: User,
        isActive: currentPath.includes("/admin/hod"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("programs_management"),
        url: `/${currentLang}/admin/programs`,
        icon: Book,
        isActive: currentPath.includes("/admin/programs"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("departments_management"),
        url: `/${currentLang}/admin/departments`,
        icon: Building,
        isActive: currentPath.includes("/admin/departments"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("subjects_management"),
        url: `/${currentLang}/admin/subjects`,
        icon: BookOpen,
        isActive: currentPath.includes("/admin/subjects"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("groups_management"),
        url: `/${currentLang}/admin/groups`,
        icon: Users,
        isActive: currentPath.includes("/admin/groups"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("location_management"),
        url: `/${currentLang}/admin/location`,
        icon: MapPin,
        isActive: currentPath.includes("/admin/location"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("timetable_management"),
        url: `/${currentLang}/admin/timetable`,
        icon: CalendarDays,
        isActive: currentPath.includes("/admin/timetable"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("leave_request_management"),
        url: `/${currentLang}/admin/leave-requests`,
        icon: Clock,
        isActive: currentPath.includes("/admin/leave-requests"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("feedback"),
        url: `/${currentLang}/admin/feedback`,
        icon: Clock,
        isActive: currentPath.includes("/admin/feedback"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("survey"),
        url: `/${currentLang}/admin/survey`,
        icon: Settings,
        isActive: currentPath.includes("/admin/survey"),
        class: khmerClass,
      },
      {
        title: t("setting"),
        url: `/${currentLang}/admin/setting`,
        icon: Settings,
        isActive: currentPath.includes("/admin/setting"),
        class: khmerClass,
      },
      
    ],
  };
});
</script>

<template>
  <Sidebar :collapsible="props.collapsible" :default-open="false" variant="sidebar"
    class="peer/sidebar min-w-0 flex-shrink-0 transition-[width] duration-300 ease-in-out">
    <SidebarContent class="bg-[#235AA6]">
      <!-- Sidebar Header -->
      <div class="flex items-center px-3 py-[19px] border-b border-white/20 gap-2">
        <SidebarTrigger class="text-white hover:bg-white/10" />
        <!-- Show title when sidebar is expanded -->
        <div :class="['text-white text-1xl font-semibold', locale === 'kh' ? 'khmer-text' : '']">{{ t('management') }}
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