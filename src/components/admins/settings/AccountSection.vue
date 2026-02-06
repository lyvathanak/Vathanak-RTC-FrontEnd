<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b bg-white">
      <div class="flex items-start gap-3">
        <div
          class="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <User class="h-5 w-5 text-[#235AA6]" />
        </div>

        <div class="min-w-0">
          <h3
            :class="[
              'text-sm sm:text-base font-bold text-gray-900',
              khmerClass,
            ]">
            {{ safeT("account", "Account") }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
            {{
              safeT(
                "account_desc",
                "Update your profile and account information",
              )
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="p-4 sm:p-6 space-y-5">
      <!-- Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Full name -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ safeT("full_name", "Full name") }}
          </label>
          <div class="relative">
            <input
              v-model="account.fullName"
              type="text"
              class="w-full h-11 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]" />
            <User
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ safeT("email", "Email") }}
          </label>
          <div class="relative">
            <input
              :value="account.email"
              type="email"
              readonly
              class="w-full h-11 rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-semibold text-gray-600 cursor-not-allowed" />
            <Mail
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Role -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ safeT("role", "Role") }}
          </label>
          <div class="relative">
            <input
              :value="account.role"
              type="text"
              readonly
              class="w-full h-11 rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-semibold text-gray-600 cursor-not-allowed" />
            <Shield
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Department -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ safeT("department", "Department") }}
          </label>
          <div class="relative">
            <input
              :value="departmentName"
              readonly
              class="w-full h-11 rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-semibold text-gray-600 cursor-not-allowed" />
            <Building2
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <!-- Avatar -->
      <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <!-- Preview -->
          <div class="flex items-center gap-3">
            <div
              class="h-14 w-14 rounded-2xl overflow-hidden bg-white border border-gray-200 shrink-0">
              <img
                v-if="account.avatarUrl"
                :src="account.avatarUrl"
                alt="avatar"
                class="h-full w-full object-cover" />
              <div
                v-else
                class="h-full w-full flex items-center justify-center bg-blue-50 text-[#235AA6] font-extrabold">
                {{ initials }}
              </div>
            </div>

            <div class="min-w-0">
              <p class="text-sm font-extrabold text-gray-900">
                {{ safeT("avatar", "Avatar") }}
              </p>
              <p class="text-xs text-gray-600 mt-0.5">
                {{
                  safeT(
                    "avatar_hint",
                    "PNG/JPG up to 2MB. Square image looks best.",
                  )
                }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="sm:ml-auto flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4c93] active:bg-[#1a407c] transition focus:outline-none focus:ring-2 focus:ring-[#235AA6]/30">
              <Upload class="h-4 w-4" />
              {{ safeT("upload", "Upload") }}
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-200"
              :disabled="!account.avatarUrl">
              <Trash2 class="h-4 w-4" />
              {{ safeT("remove", "Remove") }}
            </button>
          </div>
        </div>

        <!-- Drop zone (optional text only) -->
        <div
          class="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white p-4">
          <p class="text-sm font-semibold text-gray-800">
            {{ safeT("avatar_drop", "Drag & drop your photo here") }}
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ safeT("avatar_drop_desc", "Or click Upload to choose a file.") }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { User, Mail, Shield, Building2, Upload, Trash2 } from "lucide-vue-next";

const { t, te } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      fullName: "",
      email: "",
      role: "",
      department: "",
      avatarUrl: "",
    }),
  },
  khmerClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const account = computed({
  get: () => props.modelValue || {},
  set: (val) => emit("update:modelValue", val),
});

/** ✅ Stop missing-key warnings */
function safeT(key, fallback) {
  return te(key) ? t(key) : fallback;
}

const departmentName = computed(() => {
  const d = account.value?.department;
  return typeof d === "string" ? d : d?.name || "";
});

const initials = computed(() => {
  const name = (account.value?.fullName || "").trim();
  if (!name) return "A";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
});
</script>
