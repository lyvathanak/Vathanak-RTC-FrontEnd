<template>
  <button
    v-if="enrollmentStatus !== 'enrolled'"
    @click="handleEnroll"
    :disabled="loading || enrollmentStatus === 'enrolled'"
    class="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span v-if="loading">Enrolling...</span>
    <span v-else>Enroll</span>
  </button>
  <span
    v-else
    class="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200"
  >
    ✓ Enrolled
  </span>
</template>

<script setup>
import { ref } from 'vue';
import { useEnrollStudentStore } from '@/stores/Admin/external_exam/enroll_student';

// Props
const props = defineProps({
  student: {
    type: Object,
    required: true
  },
  enrollmentStatus: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['enrolled', 'error']);

// Store
const enrollStudentStore = useEnrollStudentStore();

// Local loading state for this button only
const loading = ref(false);

// Methods
const handleEnroll = async () => {
  console.log('Enroll student:', props.student);
  
  const studentId = props.student.temp_student?.id || props.student.id;
  const studentName = props.student.temp_student?.khmer_name || props.student.temp_student?.latin_name;
  
  if (!studentId) {
    alert('❌ Error: Student ID not found');
    emit('error', 'Student ID not found');
    return;
  }
  
  // Show confirmation
  const confirmed = confirm(
    `Enroll this student?\n\nName: ${studentName}\nScore: ${props.student.score}\nRank: ${props.student.rank}\n\nProceed with enrollment?`
  );
  
  if (confirmed) {
    loading.value = true;
    try {
      await enrollStudentStore.enrollStudentById(studentId);
      
      // Show success message
      alert(`✅ ${enrollStudentStore.successMessage || 'Student enrolled successfully!'}`);
      
      // Emit event to parent with student data for local update
      emit('enrolled', props.student);
    } catch (error) {
      // Show error message
      alert(`❌ ${enrollStudentStore.error || 'Failed to enroll student'}`);
      emit('error', enrollStudentStore.error || 'Failed to enroll student');
    } finally {
      loading.value = false;
    }
  }
};
</script>
