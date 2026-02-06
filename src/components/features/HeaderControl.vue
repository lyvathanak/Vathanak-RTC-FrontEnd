<template>
  <header
    class="w-full flex items-center justify-between bg-[#235AA6] px-3 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-3">
    <!-- Left -->
    <div class="flex items-center gap-2 min-w-0">
      <button
        @click="toggleSidebar"
        class="md:hidden inline-flex items-center justify-center p-2 text-white hover:bg-white/10 rounded-lg transition"
        aria-label="Toggle sidebar">
        <Menu class="w-5 h-5" aria-hidden="true" />
      </button>

      <h1
        :class="[
          'text-sm sm:text-lg md:text-xl text-white font-bold truncate',
          khmerTextClass,
        ]">
        <!-- {{ roleDisplay }} {{ t("dashboard") }} -->
      </h1>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
      <NotificationBell />

      <div class="hidden sm:block">
        <ChangeLanguage class="text-white" />
      </div>

      <!-- Profile Dropdown -->
      <div
        ref="dropdownRef"
        class="relative"
        @mouseenter="showDropdown"
        @mouseleave="hideDropdown">
        <button
          @click="toggleDropdown"
          class="flex items-center gap-2 px-1 sm:px-2 py-1 rounded-lg hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="User menu"
          aria-haspopup="menu"
          :aria-expanded="isDropdownOpen">
          <img
            :src="profileImageSrc"
            alt="Profile photo"
            class="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 object-cover rounded-full ring-2 ring-white/20 shrink-0" />

          <span
            class="text-white text-xs sm:text-sm md:text-base truncate max-w-22.5 sm:max-w-35 md:max-w-55">
            {{ profile.name || "—" }}
          </span>
        </button>

        <!-- Dropdown -->
        <transition name="fade">
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 top-full mt-2 w-65 sm:w-56 md:w-60 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            role="menu"
            @mouseenter="showDropdown"
            @mouseleave="hideDropdown">
            <!-- Mobile language -->
            <div class="block sm:hidden border-b border-gray-200 p-3">
              <div
                class="flex items-center justify-between gap-2 text-gray-700">
                <span class="text-sm font-medium">Language</span>
                <ChangeLanguage class="text-gray-700" />
              </div>
            </div>

            <!-- Profile item -->
            <button
              @click="viewProfile"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
              role="menuitem">
              <img
                :src="profileImageSrc"
                alt="Profile Photo"
                class="w-10 h-10 object-cover rounded-full shrink-0 ring-1 ring-gray-200" />

              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-gray-900 truncate">
                  <template v-if="authStore.userRole === 'student'">
                    Student Profile
                  </template>
                  <template v-else-if="authStore.userRole === 'teacher'">
                    Teacher Profile
                  </template>
                  <template v-else-if="authStore.userRole === 'hod'">
                    Head of Department Profile
                  </template>
                  <template v-else-if="authStore.userRole === 'admin'">
                    Admin Profile
                  </template>
                  <template v-else>Profile</template>
                </div>

                <div class="text-xs text-gray-500 truncate">
                  {{ profile.name }}
                </div>
              </div>
            </button>

            <div class="h-px bg-gray-200" />

            <!-- Library -->
            <button
              @click="goToLibrary"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition"
              role="menuitem">
              <BookOpen
                class="w-4 h-4 text-gray-700 shrink-0"
                aria-hidden="true" />
              <span
                :class="[
                  'text-sm font-medium text-gray-900',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                Library
              </span>
            </button>

            <div class="h-px bg-gray-200" />

            <!-- Moodle -->
            <button
              @click="goToMoodle"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition"
              role="menuitem">
              <GraduationCap
                class="w-4 h-4 text-gray-700 shrink-0"
                aria-hidden="true" />
              <span
                :class="[
                  'text-sm font-medium text-gray-900',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                Moodle
              </span>
            </button>

            <div class="h-px bg-gray-200" />

            <!-- Change Password -->
            <button
              @click="changePassword"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-yellow-50 transition"
              role="menuitem">
              <KeyRound
                class="w-4 h-4 text-gray-700 shrink-0"
                aria-hidden="true" />
              <span
                :class="[
                  'text-sm font-medium text-gray-900',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                Change Password
              </span>
            </button>

            <div class="h-px bg-gray-200" />

            <!-- Logout -->
            <button
              @click="logout"
              class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition"
              role="menuitem">
              <LogOut
                class="w-4 h-4 text-red-600 shrink-0"
                aria-hidden="true" />
              <span
                :class="[
                  'text-sm font-medium text-red-600',
                  locale === 'kh' ? 'khmer-text' : '',
                ]">
                {{ t("logout") }}
              </span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";
import {
  LogOut,
  BookOpen,
  KeyRound,
  Menu,
  GraduationCap,
} from "lucide-vue-next";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { useSidebar } from "@/components/ui/sidebar";
import { showNotification } from "@/lib/notifications";
import image from "@/assets/default-avatar.png";
import ChangeLanguage from "@/components/language/ChangLanguage.vue";
import NotificationBell from "@/components/features/NotificationBell.vue";

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const FILE_ORIGIN = import.meta.env.VITE_FILE_ORIGIN || "http://localhost:8000";

const dropdownRef = ref(null);
const isDropdownOpen = ref(false);
const hoverTimeout = ref(null);

const error = ref(null);
const loading = ref(false);

// Sidebar context (optional)
const sidebar = useSidebar();
const emit = defineEmits(["toggleSidebar"]);

const toggleSidebar = () => {
  if (sidebar && sidebar.toggleSidebar) sidebar.toggleSidebar();
  else emit("toggleSidebar");
};

const profile = reactive({ name: "", photo: "" });

const khmerTextClass = computed(() =>
  locale.value === "kh" ? "khmer-text" : "",
);
const roleDisplay = computed(() => t(authStore.userRole) || authStore.userRole);

const profileImageSrc = computed(() => {
  if (profile.photo) {
    return `${FILE_ORIGIN}/storage/${profile.photo}`;
  }
  return image;
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const showDropdown = () => {
  if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
  isDropdownOpen.value = true;
};

const hideDropdown = () => {
  hoverTimeout.value = setTimeout(() => {
    isDropdownOpen.value = false;
  }, 150);
};

const viewProfile = () => {
  let profileRoute;

  if (authStore.userRole.toLowerCase() === "student") {
    profileRoute = `/${locale.value}/student/student-profile`;
  } else if (authStore.userRole.toLowerCase() === "teacher") {
    profileRoute = `/${locale.value}/teacher/teacher-profile`;
  } else if (
    authStore.userRole.toLowerCase() === "head_department" ||
    authStore.userRole.toLowerCase() === "hod"
  ) {
    profileRoute = `/${locale.value}/hod/hod-profile`;
  } else if (authStore.userRole.toLowerCase() === "admin") {
    profileRoute = `/${locale.value}/admin/admin-profile`;
  }

  if (profileRoute) router.push(profileRoute);
  isDropdownOpen.value = false;
};

const goToLibrary = () => {
  try {
    authStore.redirectToLibrary();
    isDropdownOpen.value = false;
  } catch (err) {
    console.error("❌ Error redirecting to library:", err);
    alert("Please login first to access the library");
  }
};

const goToMoodle = () => {
  try {
    authStore.redirectToMoodle();
    isDropdownOpen.value = false;
  } catch (err) {
    console.error("❌ Error redirecting to Moodle:", err);
    alert("Please login first to access Moodle");
  }
};

const changePassword = () => {
  const currentLang = route.params.lang || "en";
  let changePasswordRoute;

  if (authStore.userRole.toLowerCase() === "student") {
    changePasswordRoute = `/${currentLang}/student/change-password`;
  } else if (authStore.userRole.toLowerCase() === "teacher") {
    changePasswordRoute = `/${currentLang}/teacher/change-password`;
  } else if (
    authStore.userRole.toLowerCase() === "head_department" ||
    authStore.userRole.toLowerCase() === "hod"
  ) {
    changePasswordRoute = `/${currentLang}/hod/change-password`;
  } else if (authStore.userRole.toLowerCase() === "admin") {
    changePasswordRoute = `/${currentLang}/admin/change-password`;
  }

  if (changePasswordRoute) router.push(changePasswordRoute);
  isDropdownOpen.value = false;
};

const logout = () => {
  authStore.logout();
  showNotification("Logout successful", "success", 3000);
  const currentLang = route.params.lang || "en";
  router.push(`/${currentLang}/login`);
  isDropdownOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);

  try {
    loading.value = true;
    const data = await getStudentProfile();
    profile.name = data?.user?.name || "";
    profile.photo = data?.user?.user_detail?.profile_picture || "";
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err);
    error.value = err?.message || "Unknown error";
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
