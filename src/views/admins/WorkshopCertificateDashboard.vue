<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Workshop Certificates</h1>
        <p class="text-gray-600">Manage workshops, participants, and generate certificates</p>
      </div>

      <!-- Workshop List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Available Workshops</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="w in workshops" 
            :key="w.id"
            class="p-4 rounded-lg border-2 transition-all cursor-pointer"
            :class="selectedWorkshopId === w.id 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300 bg-white'"
            @click="selectWorkshop(w.id)"
          >
            <h3 class="font-semibold text-gray-900 mb-2">{{ w.title }}</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p>👤 {{ w.trainer }}</p>
              <p>📅 {{ w.date }}</p>
              <p>⏱️ {{ w.duration }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Participants Section -->
      <div v-if="selectedWorkshopId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 class="text-2xl font-semibold text-gray-900">Participants</h2>
          <div class="flex items-center gap-2 text-sm">
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {{ approvedCount }} Approved
            </span>
            <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
              {{ pendingCount }} Pending
            </span>
          </div>
        </div>

        <div v-if="selectedWorkshop" class="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <p class="text-sm text-indigo-900">
            <span class="font-semibold">{{ selectedWorkshop.title }}</span> — {{ selectedWorkshop.trainer }}
          </p>
        </div>

        <!-- Filter -->
        <div class="mb-4 flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">Filter by status:</label>
          <select 
            v-model="statusFilter"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Participants</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
          </select>
        </div>

        <!-- Participants List -->
        <div class="space-y-2">
          <p v-if="filteredParticipants.length === 0" class="text-gray-500 text-center py-8">
            No participants found
          </p>
          <div 
            v-else
            v-for="p in filteredParticipants" 
            :key="p.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-2 h-2 rounded-full"
                :class="p.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'"
              ></div>
              <span class="font-medium text-gray-900">{{ p.name }}</span>
              <span 
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="p.status === 'approved' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'"
              >
                {{ p.status }}
              </span>
            </div>
            <button
              v-if="p.status === 'pending'"
              @click="approveParticipant(p.id)"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              ✓ Approve
            </button>
          </div>
        </div>
      </div>

      <!-- Certificates Section -->
      <div v-if="selectedWorkshopId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Certificates</h2>

        <button
          @click="generateCertificatesForWorkshop"
          :disabled="approvedCount === 0"
          class="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Generate Certificates for Approved Participants
        </button>

        <div class="space-y-2">
          <p v-if="filteredCertificates.length === 0" class="text-gray-500 text-center py-8">
            No certificates generated yet
          </p>
          <div 
            v-else
            v-for="c in filteredCertificates" 
            :key="c.certId"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <p class="font-medium text-gray-900">{{ getParticipantName(c.participantId) }}</p>
              <p class="text-sm text-gray-500">Certificate ID: {{ c.certId }} • Issued: {{ c.date }}</p>
            </div>
            <button
              @click="downloadPDF(c)"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              📥 Download PDF
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!selectedWorkshopId" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="text-6xl mb-4">🎓</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Select a Workshop</h3>
        <p class="text-gray-600">Choose a workshop above to view participants and manage certificates</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import jsPDF from "jspdf";

const workshops = [
  { id: "W001", title: "Flutter Basics Workshop", trainer: "Mr. Sok", date: "2025-12-20", duration: "3h" },
  { id: "W002", title: "Cybersecurity Awareness Training", trainer: "Ms. Lina", date: "2025-12-22", duration: "4h" },
  { id: "W003", title: "AI & ML Bootcamp", trainer: "Dr. Rith", date: "2025-12-25", duration: "6h" }
];

const participants = [
  { id: "P001", name: "Bopha", workshopId: "W001", status: "approved" },
  { id: "P002", name: "Sokha", workshopId: "W001", status: "pending" },
  { id: "P003", name: "Rith", workshopId: "W002", status: "approved" },
  { id: "P004", name: "Chenda", workshopId: "W003", status: "approved" }
];

const workshopCertificates = [
  { certId: "WC001", participantId: "P001", workshopId: "W001", date: "2025-12-20" }
];

// --- STATES ---
const selectedWorkshopId = ref("");
const statusFilter = ref("");
const allWorkshops = ref([...workshops]);
const allParticipants = ref([...participants]);
const allCertificates = ref([...workshopCertificates]);

// --- COMPUTED ---
const selectedWorkshop = computed(() => 
  allWorkshops.value.find(w => w.id === selectedWorkshopId.value)
);

const filteredParticipants = computed(() => {
  let list = allParticipants.value.filter(p => p.workshopId === selectedWorkshopId.value);
  if (statusFilter.value) {
    list = list.filter(p => p.status === statusFilter.value);
  }
  return list;
});

const approvedCount = computed(() => 
  filteredParticipants.value.filter(p => p.status === 'approved').length
);

const pendingCount = computed(() => 
  filteredParticipants.value.filter(p => p.status === 'pending').length
);

const filteredCertificates = computed(() =>
  allCertificates.value.filter(c => {
    const p = allParticipants.value.find(p => p.id === c.participantId);
    return p?.workshopId === selectedWorkshopId.value;
  })
);

// --- FUNCTIONS ---
function selectWorkshop(id) {
  selectedWorkshopId.value = id;
  statusFilter.value = ""; // Reset filter when changing workshop
}

function approveParticipant(participantId) {
  const p = allParticipants.value.find(p => p.id === participantId);
  if (p) p.status = "approved";
}

function generateCertificatesForWorkshop() {
  filteredParticipants.value.forEach(p => {
    if (p.status === "approved" && !allCertificates.value.some(c => c.participantId === p.id)) {
      const certId = `WC${String(allCertificates.value.length + 1).padStart(3, "0")}`;
      allCertificates.value.push({
        certId,
        participantId: p.id,
        workshopId: selectedWorkshopId.value,
        date: new Date().toISOString().split("T")[0]
      });
    }
  });
}

function getParticipantName(participantId) {
  const p = allParticipants.value.find(p => p.id === participantId);
  return p ? p.name : "Unknown";
}

function downloadPDF(cert) {
  const participant = allParticipants.value.find(p => p.id === cert.participantId);
  const workshop = allWorkshops.value.find(w => w.id === cert.workshopId);
  if (!participant || !workshop) return;

  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const centerX = pdf.internal.pageSize.getWidth() / 2;
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Border
  pdf.setDrawColor(200, 169, 79);
  pdf.setLineWidth(5);
  pdf.rect(20, 20, pdf.internal.pageSize.getWidth() - 40, pdf.internal.pageSize.getHeight() - 40);

  // Header
  pdf.setFont("times", "bold");
  pdf.setFontSize(36);
  pdf.setTextColor(196, 155, 42);
  pdf.text("CERTIFICATE OF PARTICIPATION", centerX, 120, { align: "center" });

  // Participant Name
  pdf.setFontSize(32);
  pdf.setFont("times", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text(participant.name, centerX, 180, { align: "center" });

  // Workshop info
  pdf.setFontSize(28);
  pdf.setFont("times", "bold");
  pdf.text(workshop.title, centerX, 230, { align: "center" });

  pdf.setFontSize(18);
  pdf.setFont("times", "normal");
  pdf.text(`Trainer: ${workshop.trainer}`, centerX, 280, { align: "center" });
  pdf.text(`Date: ${workshop.date}`, centerX, 310, { align: "center" });

  // Signatures
  pdf.setFontSize(14);
  pdf.text("_____________________", centerX - 200, pageHeight - 80, { align: "center" });
  pdf.text("Trainer Signature", centerX - 200, pageHeight - 60, { align: "center" });
  pdf.text("_____________________", centerX + 200, pageHeight - 80, { align: "center" });
  pdf.text("Director Signature", centerX + 200, pageHeight - 60, { align: "center" });

  pdf.save(`${participant.name}_workshop_certificate.pdf`);
}
</script>

<style scoped>
.dashboard { max-width: 900px; margin: auto; padding: 20px; font-family: Arial, sans-serif; }
.card { background: #fff; padding: 20px; border-radius: 10px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
button { cursor: pointer; }
</style>