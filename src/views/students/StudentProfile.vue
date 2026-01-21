<template>
  <div class="w-full min-h-[calc(100vh-64px)] bg-slate-50">
    <div
      class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
      <!-- Page Header -->
      <PageHeader
        :title="t('profile_account')"
        subtitle="View your personal and academic information.">
        <button
          type="button"
          @click="fetchProfile"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          <RefreshCcw class="w-4 h-4" />
          Refresh
        </button>
      </PageHeader>

      <!-- Main Card -->
      <div
        class="bg-white rounded-xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] overflow-hidden">
        <!-- Banner -->
        <div class="relative h-20 sm:h-12">
          <div
            class="absolute inset-0 bg-gradient-to-r from-[#235AA6] via-indigo-600 to-violet-600" />
          <div
            class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_15%_25%,white,transparent_50%),radial-gradient(circle_at_85%_30%,white,transparent_45%)]" />
          <div
            class="absolute inset-x-0 bottom-0 h-12 bg-white/10 backdrop-blur-[2px]" />
        </div>

        <div class="p-6 sm:p-8 lg:p-10">
          <!-- Loading -->
          <div v-if="loading" class="space-y-7">
            <div class="flex flex-col lg:flex-row lg:items-center gap-6">
              <div class="h-28 w-28 rounded-full bg-slate-200 animate-pulse" />
              <div class="flex-1 space-y-3">
                <div class="h-8 w-80 bg-slate-200 rounded animate-pulse" />
                <div class="h-4 w-72 bg-slate-200 rounded animate-pulse" />
                <div class="h-10 w-96 bg-slate-200 rounded-2xl animate-pulse" />
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-72">
                <div class="h-20 bg-slate-200 rounded-2xl animate-pulse" />
                <div class="h-20 bg-slate-200 rounded-2xl animate-pulse" />
              </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div class="h-96 bg-slate-200 rounded-2xl animate-pulse" />
              <div class="h-96 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
          </div>

          <!-- Error -->
          <div
            v-else-if="error"
            class="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-700">
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-6 h-6 mt-0.5" />
              <div>
                <p class="font-semibold">Failed to load profile</p>
                <p class="text-sm opacity-90">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div v-else class="space-y-8">
            <!-- Header row -->
            <div
              class="flex flex-col lg:flex-row lg:items-center sm:items-center gap-6">
              <!-- Avatar -->
              <div class="relative shrink-0">
                <div
                  class="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-slate-100">
                  <img
                    :src="profileImage"
                    alt="Profile picture"
                    class="w-full h-full object-cover"
                    @error="onImgError" />
                </div>

                <span
                  class="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-lg bg-white shadow border border-slate-100 text-[#235AA6]">
                  {{ profile.roles || "-" }}
                </span>
              </div>

              <!-- Name + tags -->
              <div class="flex-1 text-center lg:text-left">
                <h2
                  class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  {{ profile.name || "-" }}
                </h2>

                <div
                  class="mt-3 flex flex-wrap justify-center lg:justify-start gap-2">
                  <span
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E0F2FF] text-[#235AA6] text-sm font-bold">
                    <School class="w-4 h-4" />
                    {{ profile.department || "-" }}
                  </span>

                  <span
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold">
                    <GraduationCap class="w-4 h-4" />
                    {{ profile.subDepartment || "-" }}
                  </span>

                  <span
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-sm font-bold">
                    <IdCard class="w-4 h-4" />
                    {{ profile.id || "-" }}
                  </span>
                </div>

                <p class="mt-3 text-sm text-slate-500">
                  Keep your profile information up to date for accurate records.
                </p>
              </div>

              <!-- Quick stats -->
              <div class="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-72">
                <MiniStat
                  :icon="BookOpen"
                  label="Program"
                  :value="profile.program" />
                <MiniStat
                  :icon="BadgeCheck"
                  label="Promotion"
                  :value="profile.promotion" />
              </div>
            </div>

            <!-- Sections -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <InfoCard
                title="Personal Information"
                subtitle="Basic personal details"
                :icon="UserRound">
                <InfoRow label="FULL NAME" :value="profile.name" />
                <InfoRow label="DATE OF BIRTH" :value="profile.dob" />
                <InfoRow label="GENDER" :value="profile.gender" />
                <InfoRow label="ADDRESS" :value="profile.address" />
                <InfoRow label="EMAIL ADDRESS" :value="profile.email" />
                <InfoRow label="PHONE NUMBER" :value="profile.phone" />
              </InfoCard>

              <InfoCard
                title="Academic Information"
                subtitle="Student academic records"
                :icon="GraduationCap">
                <InfoRow label="ID" :value="profile.id" />
                <InfoRow label="GRADE" :value="profile.grade" />
                <InfoRow label="PROGRAM" :value="profile.program" />
                <InfoRow label="DEPARTMENT" :value="profile.department" />
                <InfoRow label="SECTION" :value="profile.subDepartment" />
                <InfoRow label="YEAR" :value="profile.year" />
              </InfoCard>
            </div>
          </div>
        </div>
      </div>

      <div class="h-6"></div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { getStudentProfile } from "@/stores/Student/StudentProfile";
import { useI18n } from "vue-i18n";
import InfoCard from "@/components/profile/InfoCard.vue";
import InfoRow from "@/components/profile/InfoRow.vue";
import MiniStat from "@/components/profile/MiniStat.vue";
import PageHeader from "@/components/features/PageHeader.vue";

import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  IdCard,
  RefreshCcw,
  School,
  UserRound,
} from "lucide-vue-next";

const loading = ref(true);
const error = ref(null);
// I18n
const { t, locale } = useI18n();

const profile = reactive({
  photo: "",
  name: "",
  dob: "",
  gender: "",
  address: "",
  email: "",
  phone: "",
  id: "",
  program: "",
  grade: "",
  department: "",
  promotion: "",
  year: "",
  subDepartment: "",
  academic_year: "",
  roles: "",
});

const placeholderImg = "https://via.placeholder.com/150";

const profileImage = computed(() => {
  const p = profile.photo;
  if (!p) return placeholderImg;

  // already full url
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  // relative storage path
  return `https://api.rtc-bb.camai.kh/storage/${p}`;
});

function onImgError(e) {
  e.target.src = placeholderImg;
}

async function fetchProfile() {
  try {
    loading.value = true;
    error.value = null;

    const data = await getStudentProfile();

    const user = data?.user;
    const ud = user?.user_detail;

    // Pick "current" program (find one with year value, or use latest)
    const programs = Array.isArray(user?.user_programs)
      ? user.user_programs
      : [];
    const latestProgram = programs.find(p => p.year != null) || 
                         (programs.length ? programs[programs.length - 1] : null);

    profile.photo =
      user?.profile_picture_online ||
      user?.profile_picture ||
      ud?.profile_picture ||
      "";

    profile.name = user?.name || "";
    profile.email = user?.email || "";

    // roles is on root: data.roles (array)
    profile.roles = Array.isArray(data?.roles) ? data.roles.join(", ") : "";

    profile.dob = ud?.date_of_birth || "";
    profile.gender = ud?.gender || "";
    profile.address = ud?.current_address || ud?.address || "";
    profile.phone = ud?.phone_number || "";
    profile.id = ud?.id_card || "";

    // Department / section
    profile.department = ud?.department?.department_name || "";
    profile.subDepartment = ud?.sub_department?.name || "";

    // Program info comes from user_programs (data is directly in the array, not nested)
    profile.program = latestProgram?.program_name || "";
    profile.grade = ud?.degree || ud?.grade || ""; // response has degree = "Bachelor"

    // Use generation number from the program data for promotion
    const gen = latestProgram?.number_generation_program ?? "";
    profile.promotion = gen !== "" ? `Generation ${gen}` : "-";
    
    // Use year from the program data for academic year
    profile.year = latestProgram?.year ? `Year ${latestProgram.year}` : "-";
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err);
    error.value = err?.message || "Unknown error";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchProfile);
</script>
