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
        url: `/${currentLang}/student/overview`,
        icon: Gauge,
        isActive: currentPath.includes("/student/overview"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("academic_information"),
        url: `/${currentLang}/student/academic-info`,
        icon: Book,
        isActive: currentPath.includes("/student/academic-info"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("student_leave_requests"),
        url: `/${currentLang}/student/leave-request`,
        icon: Clock,
        isActive: currentPath.includes("/student/leave-request"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("profile_account"),
        url: `/${currentLang}/student/student-profile`,
        icon: User,
        isActive: currentPath.includes("/student/student-profile"),
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
          {{ t("student_portal") }}
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
