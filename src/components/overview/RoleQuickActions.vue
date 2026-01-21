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
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  Users,
  UserPlus,
  UserCog,
  BookOpen,
  Building2,
  ClipboardList,
  Upload,
  UsersRound,
  MapPin,
  CalendarDays,
  Clock,
  MessageSquareText,
  ListChecks,
  Settings,
  Plus,
  ClipboardCheck,
  BarChart3,
  PiggyBank,
  BadgeCheck,
  User,
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
        title: "Students Management",
        desc: "Manage student accounts",
        icon: Users,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/students`,
      },
      {
        title: "Promote Student",
        desc: "Promote student level",
        icon: UserPlus,
        bg: "bg-indigo-50 hover:bg-indigo-100",
        iconBg: "bg-indigo-500",
        to: `${base.value}/promote-student`,
      },
      {
        title: "Teachers Management",
        desc: "Manage teachers",
        icon: UserCog,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/teachers`,
      },
      {
        title: "Head-of-Department Management",
        desc: "Manage HOD users",
        icon: UsersRound,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/hod`,
      },
      {
        title: "Programs Management",
        desc: "Manage programs",
        icon: BookOpen,
        bg: "bg-cyan-50 hover:bg-cyan-100",
        iconBg: "bg-cyan-500",
        to: `${base.value}/programs`,
      },
      {
        title: "Departments Management",
        desc: "Manage departments",
        icon: Building2,
        bg: "bg-amber-50 hover:bg-amber-100",
        iconBg: "bg-amber-500",
        to: `${base.value}/departments`,
      },
      {
        title: "Subjects Management",
        desc: "Manage subjects",
        icon: ClipboardList,
        bg: "bg-lime-50 hover:bg-lime-100",
        iconBg: "bg-lime-500",
        to: `${base.value}/subjects`,
      },
      {
        title: "Import Score",
        desc: "Upload scores",
        icon: Upload,
        bg: "bg-teal-50 hover:bg-teal-100",
        iconBg: "bg-teal-500",
        to: `${base.value}/import-score`,
      },
      {
        title: "Groups Management",
        desc: "Manage groups",
        icon: UsersRound,
        bg: "bg-sky-50 hover:bg-sky-100",
        iconBg: "bg-sky-500",
        to: `${base.value}/groups`,
      },
      {
        title: "Location Management",
        desc: "Manage locations",
        icon: MapPin,
        bg: "bg-rose-50 hover:bg-rose-100",
        iconBg: "bg-rose-500",
        to: `${base.value}/locations`,
      },
      {
        title: "Timetable Management",
        desc: "Manage timetables",
        icon: CalendarDays,
        bg: "bg-fuchsia-50 hover:bg-fuchsia-100",
        iconBg: "bg-fuchsia-500",
        to: `${base.value}/timetable`,
      },
      {
        title: "Leave Request Management",
        desc: "Review leave requests",
        icon: Clock,
        bg: "bg-red-50 hover:bg-red-100",
        iconBg: "bg-red-500",
        to: `${base.value}/leave-requests`,
      },
      {
        title: "Feedback",
        desc: "View feedback",
        icon: MessageSquareText,
        bg: "bg-orange-50 hover:bg-orange-100",
        iconBg: "bg-orange-500",
        to: `${base.value}/feedback`,
      },
      {
        title: "Survey",
        desc: "Manage surveys",
        icon: ListChecks,
        bg: "bg-yellow-50 hover:bg-yellow-100",
        iconBg: "bg-yellow-500",
        to: `${base.value}/survey`,
      },
      {
        title: "Setting",
        desc: "System settings",
        icon: Settings,
        bg: "bg-gray-50 hover:bg-gray-100",
        iconBg: "bg-gray-700",
        to: `${base.value}/settings`,
      },
    ];
  }

  // ✅ TEACHER
  if (r.includes("teacher")) {
    return [
      {
        title: "Create Assignment",
        desc: "Add new assignment for students",
        icon: Plus,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/teacher/assignments/create`,
      },
      {
        title: "Grade Assignments",
        desc: "Review and grade student work",
        icon: ClipboardCheck,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/teacher/assignments/grade`,
      },
      {
        title: "View Students",
        desc: "Manage student information",
        icon: Users,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/teacher/students`,
      },
    ];
  }

  // ✅ HEAD OF DEPARTMENT
  if (r.includes("head")) {
    return [
      {
        title: "Manage Teachers",
        desc: "Assign and oversee department faculty",
        icon: Users,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/hod/teachers`,
      },
      {
        title: "Course Approval",
        desc: "Review and approve course proposals",
        icon: ClipboardList,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/hod/course-approval`,
      },
      {
        title: "Department Reports",
        desc: "View performance and analytics",
        icon: BarChart3,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/hod/reports`,
      },
      {
        title: "Schedule Classes",
        desc: "Manage department timetables",
        icon: CalendarDays,
        bg: "bg-indigo-50 hover:bg-indigo-100",
        iconBg: "bg-indigo-500",
        to: `${base.value}/hod/schedule`,
      },
      {
        title: "Budget Requests",
        desc: "Submit and track department budgets",
        icon: PiggyBank,
        bg: "bg-yellow-50 hover:bg-yellow-100",
        iconBg: "bg-yellow-500",
        to: `${base.value}/hod/budget`,
      },
      {
        title: "Approve Requests",
        desc: "Review pending department requests",
        icon: BadgeCheck,
        bg: "bg-red-50 hover:bg-red-100",
        iconBg: "bg-red-500",
        to: `${base.value}/hod/requests`,
      },
    ];
  }

  // ✅ STUDENT
  if (r.includes("student")) {
    return [
      {
        title: "Academic Information",
        desc: "View your courses and results",
        icon: BookOpen,
        bg: "bg-blue-50 hover:bg-blue-100",
        iconBg: "bg-blue-500",
        to: `${base.value}/student/academic-information`,
      },
      {
        title: "Leave Request",
        desc: "Submit and track leave requests",
        icon: CalendarDays,
        bg: "bg-green-50 hover:bg-green-100",
        iconBg: "bg-green-500",
        to: `${base.value}/student/leave-request`,
      },
      {
        title: "Profile & Account",
        desc: "Update your profile settings",
        icon: User,
        bg: "bg-purple-50 hover:bg-purple-100",
        iconBg: "bg-purple-500",
        to: `${base.value}/student/profile`,
      },
    ];
  }

  return [];
});

function goTo(to) {
  router.push(to);
}
</script>
