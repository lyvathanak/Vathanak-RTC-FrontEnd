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
      <div
        v-for="permission in normalizedPermissions"
        :key="permission"
        :class="badgeClass">
        {{ formatPermission(permission) }}
      </div>

      <div
        v-if="!normalizedPermissions.length"
        class="text-sm text-gray-500 col-span-full">
        —
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  role: { type: String, required: true }, // "Admin" | "Teacher" | "Student" | "Head of Department" ...
  permissions: { type: Array, default: () => [] }, // authStore.userPermissions
  locale: { type: String, default: "en" }, // pass from i18n if you want Khmer font switch
});

const roleKey = computed(() => (props.role || "").toLowerCase().trim());

const title = computed(() => {
  const r = roleKey.value;
  if (r.includes("admin")) return "Admin Permissions";
  if (r.includes("teacher")) return "Teacher Permissions";
  if (r.includes("head")) return "Head of Department Permissions";
  if (r.includes("student")) return "Student Permissions";
  return "Permissions";
});

const gridClass = computed(() => {
  const r = roleKey.value;

  // match your layouts
  if (r.includes("teacher")) return "grid grid-cols-2 md:grid-cols-3 gap-2";
  if (r.includes("student")) return "grid grid-cols-2 md:grid-cols-3 gap-2";
  return "grid grid-cols-2 md:grid-cols-4 gap-2"; // admin + head department default
});

const badgeClass = computed(() => {
  const r = roleKey.value;

  if (r.includes("head"))
    return "bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium";
  if (r.includes("admin"))
    return "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium";
  if (r.includes("teacher"))
    return "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium";
  if (r.includes("student"))
    return "bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium";

  return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium";
});

const normalizedPermissions = computed(() => {
  // ensure unique + safe strings
  const arr = Array.isArray(props.permissions) ? props.permissions : [];
  return [...new Set(arr.map(String))];
});

function formatPermission(p) {
  // replace ALL underscores, not only first
  return String(p).replace(/_/g, " ").toUpperCase();
}
</script>
