<template>
  <div
    class="min-h-screen bg-gray-50 px-3 py-6 sm:px-6 lg:px-6 sm:py-8 space-y-4">
    <PageHeader
      :title="t('setting') || 'Settings'"
      :subtitle="
        t('settings_subtitle') || 'Manage your account and preferences'
      ">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="h-10 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
          :disabled="saving || !hasChanges"
          @click="resetForm">
          <X class="h-4 w-4" />
          {{ t("cancel") || "Cancel" }}
        </button>

        <button
          type="button"
          class="h-10 inline-flex items-center gap-2 rounded-lg bg-[#235AA6] px-4 text-sm font-semibold text-white hover:bg-[#1f4f93] transition disabled:opacity-60"
          :disabled="saving || !hasChanges || !!passwordError"
          @click="save">
          <Save class="h-4 w-4" />
          {{
            saving
              ? t("saving") || "Saving..."
              : t("save_changes") || "Save changes"
          }}
        </button>
      </div>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <!-- Left: Tabs -->
      <SettingsTabs
        v-model:activeTab="activeTab"
        :tabs="tabs"
        :khmerClass="khmerClass"
        :t="t" />

      <!-- Right: Content -->
      <main class="space-y-4">
        <AccountSection
          v-if="activeTab === 'account'"
          v-model="form.account"
          :t="t"
          :khmerClass="khmerClass" />

        <SecuritySection
          v-else-if="activeTab === 'security'"
          v-model="form.security"
          :t="t"
          :khmerClass="khmerClass"
          :passwordError="passwordError" />

        <LanguageSection
          v-else-if="activeTab === 'language'"
          v-model="form.language"
          :t="t"
          :khmerClass="khmerClass" />

        <NotificationsSection
          v-else-if="activeTab === 'notifications'"
          v-model="form.notifications"
          :t="t"
          :khmerClass="khmerClass" />

        <SystemSection
          v-else
          v-model="form.system"
          :t="t"
          :khmerClass="khmerClass" />

        <SettingsStickyBar
          :show="hasChanges"
          :saving="saving"
          :passwordError="passwordError"
          @reset="resetForm"
          @save="save" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, toRaw, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/stores/apis/axios";
import { getAdminProfile } from "@/stores/Admin/AdminProfile";

import PageHeader from "@/components/features/PageHeader.vue";
import SettingsTabs from "@/components/admins/settings/SettingsTabs.vue";
import SettingsStickyBar from "@/components/admins/settings/SettingsStickyBar.vue";
import AccountSection from "@/components/admins/settings/AccountSection.vue";
import SecuritySection from "@/components/admins/settings/SecuritySection.vue";
import LanguageSection from "@/components/admins/settings/LanguageSection.vue";
import NotificationsSection from "@/components/admins/settings/NotificationsSection.vue";
import SystemSection from "@/components/admins/settings/SystemSection.vue";

import {
  User,
  Shield,
  Languages,
  Bell,
  Settings as SettingsIcon,
  Save,
  X,
} from "lucide-vue-next";

const { t, locale } = useI18n();

const tabs = computed(() => [
  {
    key: "account",
    label: t("account") || "Account",
    desc: t("account_desc") || "Profile and account details",
    icon: User,
  },
  {
    key: "security",
    label: t("security") || "Security",
    desc: t("security_desc") || "Password and sign-in options",
    icon: Shield,
  },
  {
    key: "language",
    label: t("language") || "Language",
    desc: t("language_desc") || "Language and formats",
    icon: Languages,
  },
  {
    key: "notifications",
    label: t("notifications") || "Notifications",
    desc: t("notifications_desc") || "Email and in-app alerts",
    icon: Bell,
  },
  {
    key: "system",
    label: t("system") || "System",
    desc: t("system_desc") || "Admin preferences and defaults",
    icon: SettingsIcon,
  },
]);

const activeTab = ref("account");
const khmerClass = computed(() => (locale.value === "kh" ? "khmer-text" : ""));
const saving = ref(false);

/** ✅ restore this function */
const initialData = () => ({
  account: {
    fullName: "",
    email: "",
    role: "",
    department: "",
    avatarUrl: "",
  },
  security: { currentPassword: "", newPassword: "", confirmPassword: "" },
  language: {
    appLanguage: locale.value === "kh" ? "kh" : "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  },
  notifications: {
    inApp: true,
    email: true,
    leaveRequests: true,
    externalExam: true,
    feedback: true,
  },
  system: {
    defaultAcademicYear: "2025-2026",
    compactTables: false,
    sidebarDefault: "icon",
  },
});

/** ✅ create these BEFORE using them */
const initial = ref(initialData());
const form = reactive(initialData());

function mapAdminToForm(user, extra = {}) {
  const roles = extra.roles || [];
  const ud = user?.user_detail; // ✅ correct place

  return {
    account: {
      fullName: user?.name ?? ud?.latin_name ?? "",
      email: user?.email ?? "",

      role: roles?.[0] ?? "",

      // ✅ department name from user_detail OR head_department
      department:
        ud?.department?.name ??
        ud?.department?.department_name ??
        ud?.department_name ??
        user?.head_department?.name ??
        user?.head_department?.department_name ??
        "",

      avatarUrl: ud?.avatar ?? user?.avatar ?? "",
    },

    security: { currentPassword: "", newPassword: "", confirmPassword: "" },

    language: {
      appLanguage: ud?.language ?? locale.value,
      dateFormat: ud?.date_format ?? "DD/MM/YYYY",
      timeFormat: ud?.time_format ?? "24h",
    },

    notifications: {
      inApp: true,
      email: true,
      leaveRequests: true,
      externalExam: true,
      feedback: true,
    },

    system: {
      defaultAcademicYear: "2025-2026",
      compactTables: false,
      sidebarDefault: "icon",
    },
  };
}

async function loadAdminProfile() {
  try {
    const res = await getAdminProfile();

    const user = res?.user ?? res?.data?.user ?? res;
    const roles = res?.roles ?? res?.data?.roles ?? [];

    const mapped = mapAdminToForm(user, { roles });

    initial.value = JSON.parse(JSON.stringify(mapped));
    Object.assign(form, mapped);

    console.log("Loaded account:", form.account); // ✅ debug here
  } catch (e) {
    console.error("Failed to load admin profile", e);
  }
}

/** ✅ now safe to mount */
onMounted(loadAdminProfile);

const hasChanges = computed(() => {
  return JSON.stringify(form) !== JSON.stringify(initial.value);
});

const passwordError = computed(() => {
  if (activeTab.value !== "security") return "";
  if (!form.security.newPassword && !form.security.confirmPassword) return "";
  if (
    form.security.newPassword.length > 0 &&
    form.security.newPassword.length < 8
  ) {
    return "Password must be at least 8 characters.";
  }
  if (form.security.newPassword !== form.security.confirmPassword) {
    return "New password and confirm password do not match.";
  }
  return "";
});

function resetForm() {
  Object.assign(form, JSON.parse(JSON.stringify(initial.value)));
}

async function save() {
  if (passwordError.value) return;
  saving.value = true;

  try {
    await api.put("/auth/update_profile", {
      ...form.account,
      language: form.language,
      notifications: form.notifications,
      system: form.system,
      password: form.security.newPassword || undefined,
    });

    initial.value = JSON.parse(JSON.stringify(toRaw(form)));
  } finally {
    saving.value = false;
  }
}

watch(
  () => form.language.appLanguage,
  (val) => {
    console.log("ACCOUNT AFTER LOAD:", form.account);
  },
);
</script>
