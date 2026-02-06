<template>
  <div
    class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
    <!-- Header -->
    <div
      class="flex items-start justify-between gap-4 px-6 py-5 border-b bg-gradient-to-r from-gray-50 to-white">
      <div>
        <h2
          :class="[
            'text-lg sm:text-xl font-semibold text-gray-900',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t(titleKey) }}
        </h2>

        <p
          :class="[
            'mt-1 text-sm text-gray-500',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ subtitle }}
        </p>
      </div>

      <!-- Role badge -->
      <div class="shrink-0">
        <span
          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1"
          :class="roleBadgeClass">
          <component :is="roleIcon" class="h-4 w-4" />
          <span :class="locale === 'kh' ? 'khmer-text' : ''">{{
            roleLabel
          }}</span>
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoField
          :label="t('role')"
          :value="roleLabel"
          :icon="roleIcon"
          :value-class="roleTextClass" />

        <InfoField
          :label="t('email')"
          :value="emailLabel"
          :icon="Mail"
          :copyable="emailLabel !== '—'"
          @copy="copyToClipboard(emailLabel)" />

        <InfoField
          v-if="showDepartment"
          :label="t('department')"
          :value="departmentLabel"
          :icon="Building2" />
      </div>

      <div
        class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 text-xs">
        <!-- Status -->
        <div
          class="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 ring-1 ring-green-200">
          <span class="h-2 w-2 rounded-full bg-green-500"></span>

          <span
            class="font-medium text-green-700"
            :class="locale === 'kh' ? 'khmer-text' : ''">
            {{ t("active", "Active") }}
          </span>
        </div>

        <!-- Optional Meta (keep for future use) -->

        <!-- <div class="flex items-center gap-1 text-gray-400">
          <span>ID:</span>
          <span class="font-medium text-gray-600">{{ userIdLabel }}</span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import InfoField from "@/components/features/InfoField.vue";
import {
  Mail,
  Building2,
  User,
  Shield,
  GraduationCap,
  Users,
} from "lucide-vue-next";

const props = defineProps({
  role: { type: String, required: true },
  user: { type: Object, default: null },
  locale: { type: String, default: "en" },
});

const { t } = useI18n();

const normalizedRole = computed(() => {
  const raw = props.role ?? "";
  const r = String(raw).trim().toLowerCase().replace(/\s+/g, "_");

  if (
    [
      "department_head",
      "head_department",
      "head_of_department",
      "hod",
    ].includes(r)
  )
    return "head_of_department";
  if (r === "teacher") return "teacher";
  if (r === "student") return "student";
  if (r === "admin") return "admin";
  return r;
});

const titleKey = computed(() => {
  switch (normalizedRole.value) {
    case "admin":
      return "admin_information";
    case "teacher":
      return "teacher_information";
    case "head_of_department":
      return "department_head_information";
    case "student":
      return "student_information";
    default:
      return "user_information";
  }
});

const subtitle = computed(() => {
  // ✅ use fallback so i18n won't warn
  switch (normalizedRole.value) {
    case "admin":
      return t("manage_system_access", "System access and account details");
    case "teacher":
      return t("teacher_profile_details", "Profile and teaching info");
    case "head_of_department":
      return t("department_overview_details", "Department and leadership info");
    case "student":
      return t("student_profile_details", "Profile and enrollment info");
    default:
      return t("account_details", "Account details");
  }
});

const roleTextClass = computed(() => "text-[#235AA6]");

const roleIcon = computed(() => {
  switch (normalizedRole.value) {
    case "admin":
      return Shield;
    case "teacher":
      return Users;
    case "head_of_department":
      return User;
    case "student":
      return GraduationCap;
    default:
      return User;
  }
});

const roleBadgeClass = computed(() => {
  switch (normalizedRole.value) {
    case "admin":
      return "bg-red-50 text-red-700 ring-red-200";
    case "teacher":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "head_of_department":
      return "bg-purple-50 text-purple-700 ring-purple-200";
    case "student":
      return "bg-green-50 text-green-700 ring-green-200";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-200";
  }
});

const roleLabel = computed(() => {
  const txt = normalizedRole.value.replace(/_/g, " ");
  return txt.replace(/\b\w/g, (c) => c.toUpperCase());
});

const emailLabel = computed(() => {
  const u = props.user?.user ?? props.user ?? {};
  return u.email || "—";
});

const userIdLabel = computed(() => {
  const u = props.user?.user ?? props.user ?? {};
  return u.id ?? u.user_id ?? "—";
});

const departmentLabel = computed(() => {
  const raw = props.user ?? {};
  const u = raw.user ?? raw; // supports {user:{...}} or direct

  const profile = u.profile ?? raw.profile ?? {};
  const userDetail = u.user_detail ?? raw.user_detail ?? {};

  const depFromProfile =
    profile.department_name ||
    profile.department?.department_name ||
    profile.department?.name;

  const depFromHead =
    u.head_department?.department_name ||
    u.head_department?.name ||
    u.head_department?.department?.department_name ||
    u.head_department?.department?.name;

  const depFromDepartment =
    u.department_name ||
    u.department?.department_name ||
    u.department?.name ||
    (typeof u.department === "string" ? u.department : null);

  const depFromUserDetail =
    userDetail.department_name ||
    userDetail.department?.department_name ||
    userDetail.department?.name;

  return (
    depFromProfile ||
    depFromHead ||
    depFromDepartment ||
    depFromUserDetail ||
    "—"
  );
});

const showDepartment = computed(() => normalizedRole.value !== "-");

async function copyToClipboard(text) {
  if (!text || text === "—") return;

  try {
    // Best method (works on https/localhost)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      console.log("✅ Copied:", text);
      return;
    }

    // Fallback method (works on http too)
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    console.log("✅ Copied (fallback):", text);
  } catch (e) {
    console.warn("Copy failed:", e);
  }
}

watchEffect(() => {
  const raw = props.user ?? {};
  const u = raw.user ?? raw;
  console.log("USER RAW:", raw);
  console.log("USER U:", u);
  console.log("DEPARTMENT GUESS:", departmentLabel.value);
});
</script>
