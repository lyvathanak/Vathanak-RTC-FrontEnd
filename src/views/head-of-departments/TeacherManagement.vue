<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', isKhmer ? 'khmer-text' : '']">
            {{ $t('teachers_management') || 'Teacher Management' }}
          </h1>
          <p class="text-gray-600 mt-2">
             Department: <span class="font-semibold text-blue-600">{{ departmentName }}</span>
          </p>
        </div>
        </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 :class="['text-xl font-semibold text-gray-800', isKhmer ? 'khmer-text' : '']">Faculty List</h2>
         <div class="w-full sm:w-auto relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="isKhmer ? 'ស្វែងរកគ្រូ...' : 'Search Teacher...'"
            class="w-full sm:w-80 border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          </div>
      </div>

      <ListTable
        :data="filteredTeachers"
        :loading="loading"
        :columns="columns"
        :row-key="'id'"
        :show-selection="false"
        :show-actions="true"
        :show-view-action="true"
        :show-edit-action="false"
        :show-delete-action="false"
        @view="handleViewTeacher"
      >
        </ListTable>

      <ViewTeacherModal
        v-if="showViewModal"
        v-model="showViewModal"
        :teacher="selectedTeacher"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getHODProfile } from "@/stores/HeadOfDepartment/HODProfile";
import api from "@/stores/apis/axios";
import ListTable from "@/components/features/ListTable.vue";

// IMPORT HOD SPECIFIC MODAL
import ViewTeacherModal from "@/components/head-of-departments/viewTeacherModal.vue";

const router = useRouter();
const { t, locale } = useI18n();
const isKhmer = computed(() => locale.value === "kh");

const loading = ref(false);
const teachers = ref([]);
const searchQuery = ref("");
const departmentName = ref("");
const departmentId = ref(null);

const showViewModal = ref(false);
const selectedTeacher = ref(null);

const columns = ref([
  { key: 'id_card', label: 'ID', sortable: true },
  { key: 'khmer_name', label: 'Khmer Fullname', sortable: true },
  { key: 'latin_name', label: 'Latin Fullname', sortable: true },
  { key: 'position', label: 'Position', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
]);

const filteredTeachers = computed(() => {
  if (!searchQuery.value) return teachers.value;
  const q = searchQuery.value.toLowerCase();
  return teachers.value.filter(t => 
    (t.latin_name || '').toLowerCase().includes(q) ||
    (t.khmer_name || '').toLowerCase().includes(q)
  );
});

const handleViewTeacher = (teacher) => {
  selectedTeacher.value = teacher;
  showViewModal.value = true;
};

onMounted(async () => {
  try {
    loading.value = true;
    const profileData = await getHODProfile();
    const userDetail = profileData.user?.user_detail || {};
    const headDept = userDetail.head_department || profileData.user?.head_department;
    
    departmentId.value = headDept?.id || userDetail.department_id;
    departmentName.value = headDept?.department_name || "";

    if (departmentId.value) {
      const res = await api.get(`/users_by_hod_department/${departmentId.value}`, { 
        params: { role: 'staff' } 
      });
      const data = res.data.users || res.data.data || [];
      if (Array.isArray(data)) {
        teachers.value = data.map(t => {
          const detail = t.user_detail || {};
          return {
            ...t,
            id_card: t.id_card || detail.id_card,
            khmer_name: t.khmer_name || detail.khmer_name,
            latin_name: t.latin_name || t.name || detail.latin_name,
            position: t.position || detail.position || 'Lecturer',
            profile_picture: t.profile_picture || detail.profile_picture,
            is_active: t.is_active ?? detail.is_active ?? true,
            department_name: detail.department?.department_name || departmentName.value,
            user_detail: detail
          };
        });
      }
    }
  } catch (err) {
    console.error("Error fetching teachers:", err);
  } finally {
    loading.value = false;
  }
});
</script>