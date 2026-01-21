<template>
  <div
    class="px-3 sm:px-6 lg:px-6 py-6 sm:py-8 bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5">
    <!-- Header -->
    <PageHeader
      :title="t('input_exam_score')"
      subtitle=" Track and manage your exam score applications">
    </PageHeader>

    <!-- Filters -->
    <div class="">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Subject -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Choose a Subject
          </label>
          <select
            v-model="selectedSubject"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]">
            <option disabled :value="null">Select subject</option>
            <option v-for="subject in subjects" :key="subject" :value="subject">
              {{ subject }}
            </option>
          </select>
        </div>

        <!-- Group -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            v-model="selectedGroup"
            class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#235AA6] focus:border-[#235AA6]"
            @change="loadStudents">
            <option disabled :value="null">Select group</option>
            <option v-for="group in groups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
        </div>
      </div>

      <!-- Hint -->
      <div class="mt-3 text-xs text-gray-500 flex items-center gap-2">
        <Info class="w-4 h-4 text-gray-400" />
        <span>
          Tip: Select a group to load students, then click the edit icon to fill
          score.
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="px-5 pb-5">
      <!-- Empty state (no group) -->
      <div
        v-if="!selectedGroup"
        class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div class="flex items-center justify-center mb-3">
          <Users class="w-9 h-9 text-[#235AA6]" />
        </div>
        <div class="text-gray-700 font-medium">No group selected</div>
        <div class="text-sm text-gray-500 mt-1">
          Please choose a group to view students.
        </div>
      </div>

      <div v-else>
        <!-- Empty state (no students) -->
        <div
          v-if="students.length === 0"
          class="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <div class="flex items-center justify-center mb-3">
            <UserX class="w-9 h-9 text-gray-400" />
          </div>
          <div class="text-gray-700 font-medium">No students found</div>
          <div class="text-sm text-gray-500 mt-1">
            Try selecting another group.
          </div>
        </div>

        <!-- Table -->
        <div v-else class="overflow-hidden rounded-2xl border border-gray-200">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50">
              <tr class="text-center text-xs font-semibold text-gray-600">
                <th class="p-3 border-b">ID</th>
                <th class="p-3 border-b">Latin Fullname</th>
                <th class="p-3 border-b">Gender</th>
                <th class="p-3 border-b">Score</th>
                <th class="p-3 border-b">Action</th>
              </tr>
            </thead>

            <tbody class="bg-white">
              <tr
                v-for="student in students"
                :key="student.id"
                class="text-center text-sm hover:bg-gray-50 transition border-b last:border-b-0">
                <td class="p-3 font-medium text-gray-800">{{ student.id }}</td>
                <td class="p-3 text-gray-700">{{ student.name }}</td>
                <td class="p-3 text-gray-700">{{ student.gender }}</td>
                <td class="p-3">
                  <span
                    class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="
                      student.score
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    ">
                    {{ student.score ?? "—" }}
                  </span>
                </td>

                <td class="p-3">
                  <button
                    @click="showScoreInput(student)"
                    class="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50 active:scale-95 transition"
                    title="Fill Score">
                    <Pencil class="w-4 h-4 text-[#235AA6]" />
                    <span class="ml-2 hidden sm:inline text-sm text-gray-700">
                      Fill
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <FillScore
      v-if="showModal"
      :student="currentStudent"
      :subject="selectedSubject"
      @close="showModal = false"
      @submit="submitScore" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { showNotification } from "@/lib/notifications";
import { useI18n } from "vue-i18n";
import { Pencil, Users, UserX, Info, FileText } from "lucide-vue-next";

import FillScore from "@/components/teachers/FillScore.vue";
import PageHeader from "@/components/features/PageHeader.vue";

// i18n
const { t, locale } = useI18n();

// data
const subjects = ["Calculus II", "History", "Math"];
const groups = ["Group 1", "Group 2", "Group 3"];

const selectedSubject = ref(null);
const selectedGroup = ref(null);
const students = ref([]);

const showModal = ref(false);
const currentStudent = ref(null);

// mock data
const mockData = {
  "Group 1": [
    { id: "#101", name: "John Smith", gender: "M", score: null },
    { id: "#102", name: "Emma Davis", gender: "F", score: null },
    { id: "#103", name: "Michael Brown", gender: "M", score: null },
    { id: "#104", name: "Sophia Wilson", gender: "F", score: null },
    { id: "#105", name: "James Johnson", gender: "M", score: null },
  ],
  "Group 2": [
    { id: "#201", name: "Oliver Taylor", gender: "M", score: null },
    { id: "#202", name: "Ava Martinez", gender: "F", score: null },
    { id: "#203", name: "William Lee", gender: "M", score: null },
    { id: "#204", name: "Isabella Clark", gender: "F", score: null },
    { id: "#205", name: "Lucas Wright", gender: "M", score: null },
  ],
  "Group 3": [
    { id: "#301", name: "Ethan Anderson", gender: "M", score: null },
    { id: "#302", name: "Mia Thompson", gender: "F", score: null },
    { id: "#303", name: "Alexander White", gender: "M", score: null },
    { id: "#304", name: "Charlotte King", gender: "F", score: null },
    { id: "#305", name: "Daniel Harris", gender: "M", score: null },
  ],
};

// methods
function loadStudents() {
  try {
    students.value = mockData[selectedGroup.value] || [];

    if (students.value.length > 0) {
      showNotification(
        `Loaded ${students.value.length} students from ${selectedGroup.value}`,
        "success"
      );
    } else {
      showNotification("Please select a group", "info");
    }
  } catch (error) {
    console.error("Error loading students:", error);
    showNotification("Failed to load students", "error");
    students.value = [];
  }
}

function showScoreInput(student) {
  currentStudent.value = student;
  showModal.value = true;
}

function submitScore(scores) {
  try {
    if (!currentStudent.value) return;

    const attendance = parseInt(scores.attendance);
    const midterm = parseInt(scores.midterm);
    const final = parseInt(scores.final);

    if (isNaN(attendance) || isNaN(midterm) || isNaN(final)) {
      showNotification("Invalid score values", "error");
      return;
    }

    const totalScore = attendance * 0.1 + midterm * 0.4 + final * 0.5;
    currentStudent.value.score = totalScore.toFixed(2);

    showModal.value = false;
    showNotification(
      `Score updated successfully for ${currentStudent.value.name}`,
      "success"
    );

    saveScore({
      studentId: currentStudent.value.id,
      subject: selectedSubject.value,
      group: selectedGroup.value,
      scores: { attendance, midterm, final, total: totalScore },
    });
  } catch (error) {
    console.error("Error submitting score:", error);
    showNotification("Failed to submit score", "error");
  }
}

async function saveScore(scoreData) {
  console.log("Saving score:", scoreData);
  await new Promise((resolve) => setTimeout(resolve, 500));
}

// watchers
watch(selectedGroup, (newGroup) => {
  if (newGroup) loadStudents();
});

watch(selectedSubject, () => {
  students.value = students.value.map((student) => ({
    ...student,
    score: null,
  }));
});

// mounted
onMounted(() => {
  // optional: don't auto-load until group selected
  // loadStudents();
});
</script>
