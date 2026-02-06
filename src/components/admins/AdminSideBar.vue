<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import NavMain from "@/components/features/NavMain.vue";
import SidebarTrigger from "../ui/sidebar/SidebarTrigger.vue";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  GraduationCap,
  ArrowUpRight,
  Users,
  BadgeCheck,
  BookCopy,
  Building2,
  NotebookText,
  FileUp,
  Users2,
  Map,
  CalendarClock,
  CalendarX2,
  MessageSquareText,
  ClipboardList,
  ClipboardCheck,
  FileUser,
  Settings,
  Building,
  BookOpen,
  MapPin,
  FileText,
  Target, // Alternative
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
  },
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
        icon: LayoutDashboard,
        isActive: currentPath.includes("/admin/overview"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("departments_management"),
        url: `/${currentLang}/admin/departments`,
        icon: Building2,
        isActive: currentPath.includes("/admin/departments"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("programs_management"),
        url: `/${currentLang}/admin/programs`,
        icon: BookCopy,
        isActive: currentPath.includes("/admin/programs"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("subjects_management"),
        url: `/${currentLang}/admin/subjects`,
        icon: NotebookText,
        isActive: currentPath.includes("/admin/subjects"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("groups_management"),
        url: `/${currentLang}/admin/groups`,
        icon: Users2,
        isActive: currentPath.includes("/admin/groups"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("students_management"),
        url: `/${currentLang}/admin/students`,
        icon: GraduationCap,
        isActive: currentPath.includes("/admin/students"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("teachers_management"),
        url: `/${currentLang}/admin/teachers`,
        icon: Users,
        isActive: currentPath.includes("/admin/teachers"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("hod_management"),
        url: `/${currentLang}/admin/hod`,
        icon: BadgeCheck,
        isActive: currentPath.includes("/admin/hod"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("import_score"),
        url: `/${currentLang}/admin/ImportScore`,
        icon: FileUp,
        isActive: currentPath.includes("/admin/ImportScore"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("promote_student"),
        url: `/${currentLang}/admin/promote_student`,
        icon: ArrowUpRight,
        isActive: currentPath.includes("/admin/promote_student"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("location_management"),
        url: `/${currentLang}/admin/location`,
        icon: Map,
        isActive: currentPath.includes("/admin/location"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("timetable_management"),
        url: `/${currentLang}/admin/timetable`,
        icon: CalendarClock,
        isActive: currentPath.includes("/admin/timetable"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("leave_request_management"),
        url: `/${currentLang}/admin/leave-requests`,
        icon: CalendarX2,
        isActive: currentPath.includes("/admin/leave-requests"),
        class: khmerClass,
        action: handleNavClick,
      },
      {
        title: t("external_exam_enrollment"),
        url: `/${currentLang}/admin/external-exam-enrollment`,
        icon: ClipboardCheck,
        isActive: currentPath.includes("/admin/external-exam-enrollment"),
        class: khmerClass,
      },
      {
        title: t("mission_record_management") || "Mission Record",
        url: `/${currentLang}/admin/mission-records`,
        icon: ClipboardCheck,
        isActive: currentPath.includes("/admin/mission-records"),
        class: khmerClass,
      },
      {
        title: t("cv_management"),
        url: `/${currentLang}/admin/cv-management`,
        icon: FileUser,
        isActive: currentPath.includes("/admin/cv-management"),
        class: khmerClass,
      },
      {
        title: t("setting"),
        url: `/${currentLang}/admin/setting`,
        icon: Settings,
        isActive: currentPath.includes("/admin/setting"),
        class: khmerClass,
      },
      {
        title: t("survey"),
        url: `/${currentLang}/admin/survey`,
        icon: ClipboardList,
        isActive: currentPath.includes("/admin/survey"),
        class: khmerClass,
      },
      {
        title: t("feedback"),
        url: `/${currentLang}/admin/feedback`,
        icon: MessageSquareText,
        isActive: currentPath.includes("/admin/feedback"),
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
    class="peer/sidebar min-w-0 shrink-0 transition-[width] duration-300 ease-in-out">
    <SidebarContent class="bg-[#235AA6]">
      <!-- Sidebar Header -->
      <div
        class="flex items-center px-3 py-4.75 border-b border-white/20 gap-2">
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
