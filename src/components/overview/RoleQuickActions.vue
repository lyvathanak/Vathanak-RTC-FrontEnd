<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2
      :class="[
        'text-xl font-semibold mb-4',
        locale === 'kh' ? 'khmer-text' : '',
      ]">
      {{ title }}
    </h2>

    <div :class="gridClass">
      <button
        v-for="action in actions"
        :key="action.title"
        @click="goTo(action.to)"
        :class="['p-4 rounded-lg text-left transition-colors', action.bg]">
        <div class="flex items-center gap-3">
          <div :class="['p-2 text-white rounded-lg', action.iconBg]">
            <component :is="action.icon" class="w-5 h-5" />
          </div>

          <div>
            <h3 class="font-semibold text-gray-900">{{ action.title }}</h3>
            <p class="text-sm text-gray-600">{{ action.desc }}</p>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  LayoutDashboard,
  GraduationCap,
  ArrowUpRight,
  UsersRound,
  BadgeCheck,
  LibraryBig,
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
  Settings,
  FileSpreadsheet,
  CircleUser,
  BookOpenText,
  FileUser,
} from "lucide-vue-next";

const props = defineProps({
  role: { type: String, required: true }, // Admin | Teacher | Student | Head_of_Department...
  lang: { type: String, default: "en" },
  locale: { type: String, default: "en" }, // for khmer-text class
});

const router = useRouter();

const roleKey = computed(() => (props.role || "").toLowerCase().trim());

const title = computed(() => {
  const r = roleKey.value;
  if (r.includes("admin")) return "Admin Actions";
  if (r.includes("teacher")) return "Teacher Actions";
  if (r.includes("head")) return "Department Management";
  if (r.includes("student")) return "Student Actions";
  return "Actions";
});

const gridClass = computed(() => {
  // you can customize per role if needed
  return "grid grid-cols-1 md:grid-cols-3 gap-4";
});

const base = computed(() => `/${props.lang}`);

const actions = computed(() => {
  const r = roleKey.value;

  // ✅ ADMIN
  if (r.includes("admin")) {
    return [
      {
        title: "Overview",
        desc: "Admin dashboard overview",
        icon: LayoutDashboard,
        bg: "bg-slate-50 hover:bg-slate-100",
        iconBg: "bg-slate-600",
        to: `${base.value}/admin/dashboard`,
      },
      {
        title: "Students Management",
        desc: "Manage student accounts",
        icon: GraduationCap,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/admin/overview`,
      },
      {
        title: "Promote Student",
        desc: "Promote student level",
        icon: ArrowUpRight,
        bg: "bg-indigo-50 hover:bg-indigo-100",
        iconBg: "bg-indigo-500",
        to: `${base.value}/admin/promote_student`,
      },
      {
        title: "Teachers Management",
        desc: "Manage teachers",
        icon: UsersRound,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/admin/teachers`,
      },
      {
        title: "Head-of-Department Management",
        desc: "Manage HOD users",
        icon: BadgeCheck,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/admin/hod`,
      },
      {
        title: "Programs Management",
        desc: "Manage programs",
        icon: LibraryBig,
        bg: "bg-cyan-50 hover:bg-cyan-100",
        iconBg: "bg-cyan-500",
        to: `${base.value}/admin/programs`,
      },
      {
        title: "Departments Management",
        desc: "Manage departments",
        icon: Building2,
        bg: "bg-amber-50 hover:bg-amber-100",
        iconBg: "bg-amber-500",
        to: `${base.value}/admin/departments`,
      },
      {
        title: "Subjects Management",
        desc: "Manage subjects",
        icon: NotebookText,
        bg: "bg-lime-50 hover:bg-lime-100",
        iconBg: "bg-lime-500",
        to: `${base.value}/admin/subjects`,
      },
      {
        title: "Import Score",
        desc: "Upload scores",
        icon: FileUp,
        bg: "bg-teal-50 hover:bg-teal-100",
        iconBg: "bg-teal-500",
        to: `${base.value}/admin/ImportScore`,
      },
      {
        title: "Groups Management",
        desc: "Manage groups",
        icon: Users2,
        bg: "bg-sky-50 hover:bg-sky-100",
        iconBg: "bg-sky-500",
        to: `${base.value}/admin/groups`,
      },
      {
        title: "Location Management",
        desc: "Manage locations",
        icon: Map,
        bg: "bg-rose-50 hover:bg-rose-100",
        iconBg: "bg-rose-500",
        to: `${base.value}/admin/location`,
      },
      {
        title: "Timetable Management",
        desc: "Manage timetables",
        icon: CalendarClock,
        bg: "bg-fuchsia-50 hover:bg-fuchsia-100",
        iconBg: "bg-fuchsia-500",
        to: `${base.value}/admin/timetable`,
      },
      {
        title: "Leave Request Management",
        desc: "Review leave requests",
        icon: CalendarX2,
        bg: "bg-red-50 hover:bg-red-100",
        iconBg: "bg-red-500",
        to: `${base.value}/admin/leave-requests`,
      },
      {
        title: "External Exam Enrollment",
        desc: "Manage external exam enrollments",
        icon: ClipboardCheck,
        bg: "bg-emerald-50 hover:bg-emerald-100",
        iconBg: "bg-emerald-600",
        to: `${base.value}/admin/external-exam-enrollment`,
      },
      {
        title: "Mission Record Management",
        desc: "Manage mission assignments and records",
        icon: ClipboardList, // ✅ Mission
        bg: "bg-violet-50 hover:bg-violet-100",
        iconBg: "bg-violet-600",
        to: `${base.value}/admin/mission-records`,
      },
      {
        title: "CV Management",
        desc: "Manage CV submissions and templates",
        icon: FileUser, // ✅ CV
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-600",
        to: `${base.value}/admin/cv-management`,
      },

      {
        title: "Survey",
        desc: "Manage surveys",
        icon: ClipboardList,
        bg: "bg-yellow-50 hover:bg-yellow-100",
        iconBg: "bg-yellow-500",
        to: `${base.value}/admin/survey`,
      },
      {
        title: "Setting",
        desc: "System settings",
        icon: Settings,
        bg: "bg-gray-50 hover:bg-gray-100",
        iconBg: "bg-gray-700",
        to: `${base.value}/admin/settings`,
      },
      {
        title: "Feedback",
        desc: "View feedback",
        icon: MessageSquareText,
        bg: "bg-orange-50 hover:bg-orange-100",
        iconBg: "bg-orange-500",
        to: `${base.value}/admin/feedback`,
      },
    ];
  }

  // ✅ TEACHER
  if (r.includes("teacher")) {
    return [
      {
        title: "Overview",
        desc: "Teacher dashboard overview",
        icon: LayoutDashboard,
        bg: "bg-slate-50 hover:bg-slate-100",
        iconBg: "bg-slate-600",
        to: `${base.value}/teacher/overview`,
      },
      {
        title: "Students Management",
        desc: "View and manage students",
        icon: GraduationCap,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/teacher/student-info`,
      },
      {
        title: "Timetable Management",
        desc: "View teaching schedule",
        icon: CalendarClock,
        bg: "bg-indigo-50 hover:bg-indigo-100",
        iconBg: "bg-indigo-500",
        to: `${base.value}/teacher/timetable`,
      },
      // {
      //   title: "Create Assignment",
      //   desc: "Add new assignment for students",
      //   icon: Plus,
      //   bg: "bg-blue-50 hover:bg-blue-100",
      //   iconBg: "bg-blue-500",
      //   to: `${base.value}/teacher/assignments/create`,
      // },
      // {
      //   title: "Grade Assignments",
      //   desc: "Review and grade student work",
      //   icon: ClipboardCheck,
      //   bg: "bg-green-50 hover:bg-green-100",
      //   iconBg: "bg-green-500",
      //   to: `${base.value}/teacher/assignments/grade`,
      // },
      {
        title: "Exam Scoring",
        desc: "Score exams and tests",
        icon: FileSpreadsheet,
        bg: "bg-cyan-50 hover:bg-cyan-100",
        iconBg: "bg-cyan-500",
        to: `${base.value}/teacher/exam-scoring`,
      },
      // {
      //   title: "Attendance",
      //   desc: "Track student attendance",
      //   icon: UserCheck,
      //   bg: "bg-amber-50 hover:bg-amber-100",
      //   iconBg: "bg-amber-500",
      //   to: `${base.value}/teacher/attendance`,
      // },
      {
        title: "Leave Request",
        desc: "Request and track leave",
        icon: CalendarX2,
        bg: "bg-red-50 hover:bg-red-100",
        iconBg: "bg-red-500",
        to: `${base.value}/teacher/leave-request`,
      },
      {
        title: "Profile Account",
        desc: "Manage your profile",
        icon: CircleUser,
        bg: "bg-gray-50 hover:bg-gray-100",
        iconBg: "bg-gray-700",
        to: `${base.value}/teacher/teacher-profile`,
      },
    ];
  }

  // ✅ HEAD OF DEPARTMENT (HOD)
  if (r.includes("head")) {
    return [
      {
        title: "Overview",
        desc: "Department dashboard overview",
        icon: LayoutDashboard,
        bg: "bg-slate-50 hover:bg-slate-100",
        iconBg: "bg-slate-600",
        to: `${base.value}/hod/overview`,
      },
      {
        title: "Students Management",
        desc: "Manage students in department",
        icon: GraduationCap,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/hod/student-management`,
      },
      {
        title: "Teachers Management",
        desc: "Manage teachers in department",
        icon: UsersRound,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/hod/teacher-management`,
      },
      {
        title: "Timetable Management",
        desc: "Manage department timetables",
        icon: CalendarClock,
        bg: "bg-indigo-50 hover:bg-indigo-100",
        iconBg: "bg-indigo-500",
        to: `${base.value}/hod/timetable`,
      },
      {
        title: "Leave Request",
        desc: "Review teacher leave requests",
        icon: CalendarX2,
        bg: "bg-red-50 hover:bg-red-100",
        iconBg: "bg-red-500",
        to: `${base.value}/hod/leave-requests`,
      },
      {
        title: "Profile Account",
        desc: "Manage your account",
        icon: CircleUser,
        bg: "bg-gray-50 hover:bg-gray-100",
        iconBg: "bg-gray-700",
        to: `${base.value}/hod/hod-profile`,
      },
    ];
  }

  // ✅ STUDENT
  if (r.includes("student")) {
    return [
      {
        title: "Overview",
        desc: "Department dashboard overview",
        icon: LayoutDashboard,
        bg: "bg-slate-50 hover:bg-slate-100",
        iconBg: "bg-slate-600",
        to: `${base.value}/student/overview`,
      },
      {
        title: "Academic Information",
        desc: "View your courses and results",
        icon: BookOpenText,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/student/academic-info`,
      },
      {
        title: "Leave Request",
        desc: "Submit and track leave requests",
        icon: CalendarX2,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/student/leave-request`,
      },
      {
        title: "Profile & Account",
        desc: "Update your profile settings",
        icon: CircleUser,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/student/student-profile`,
      },
    ];
  }

  return [];
});

function getScrollContainer() {
  return [...document.querySelectorAll("*")].find(
    (el) => el.scrollTop > 0 && el.scrollHeight > el.clientHeight,
  );
}

async function goTo(to) {
  const scroller = getScrollContainer();

  await router.push(to);
  await nextTick();

  requestAnimationFrame(() => {
    scroller?.scrollTo({ top: 0, behavior: "smooth" });
  });
}
</script>
