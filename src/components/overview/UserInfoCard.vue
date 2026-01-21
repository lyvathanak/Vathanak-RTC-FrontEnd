<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2
      :class="[
        'text-xl font-semibold mb-4',
        locale === 'kh' ? 'khmer-text' : '',
      ]">
      {{ t(titleKey) }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Role -->
      <div>
        <label class="text-sm font-medium text-gray-500"
          >{{ t("role") }}:</label
        >
        <p class="text-lg font-semibold" :class="roleTextClass">
          {{ roleLabel }}
        </p>
      </div>

      <!-- Email -->
      <div>
        <label class="text-sm font-medium text-gray-500"
          >{{ t("email") }}:</label
        >
        <p class="text-lg font-medium">{{ emailLabel }}</p>
      </div>

      <!-- Department -->
      <div v-if="showDepartment">
        <label class="text-sm font-medium text-gray-500"
          >{{ t("department") }}:</label
        >
        <p class="text-lg font-medium">{{ departmentLabel }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { watchEffect } from "vue";

const props = defineProps({
  role: { type: String, required: true },
  user: { type: Object, default: null },
  locale: { type: String, default: "en" },
});

watchEffect(() => {
  const u = props.user?.user ?? props.user;
  console.log("🔎 UserInfoCard user:", u);
  console.log("🔎 UserInfoCard profile:", u?.profile);
});

const { t } = useI18n();

/** Normalize role names from backend/store */
const normalizedRole = computed(() => {
  const raw = props.role ?? "";
  const r = String(raw).trim().toLowerCase().replace(/\s+/g, "_");

  // normalize variants
  if (r === "department_head") return "head_of_department";
  if (r === "head_department") return "head_of_department";
  if (r === "head_of_department") return "head_of_department";
  if (r === "hod") return "head_of_department";

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

const roleTextClass = computed(() => "text-[#235AA6]");

/** Title-case label: head_of_department -> Head Of Department */
const roleLabel = computed(() => {
  const txt = normalizedRole.value.replace(/_/g, " ");
  return txt.replace(/\b\w/g, (c) => c.toUpperCase());
});

const emailLabel = computed(() => {
  const u = props.user?.user ?? props.user ?? {};
  return u.email || "—";
});

/**
 * Department name extraction:
 * supports:
 * - user.profile.department_name
 * - user.profile.department
 * - user.department_name
 * - user.department (string)
 * - user.department.name (object)
 * - user.profile.department.name (object)
 */
const departmentLabel = computed(() => {
  const u = props.user?.user ?? props.user ?? {};

  return (
    // ✅ HOD payload (your case)
    u.head_department?.department_name ||
    // ✅ some APIs might put it here
    u.head_department?.name ||
    // ✅ if backend later returns department object
    u.department?.department_name ||
    u.department?.name ||
    // ✅ if you later map it under user_detail
    u.user_detail?.department?.department_name ||
    u.user_detail?.department_name ||
    // ✅ generic string
    (typeof u.department === "string" ? u.department : null) ||
    "—"
  );
});

/** Optional: hide department for Admin */
const showDepartment = computed(() => true);
</script>
