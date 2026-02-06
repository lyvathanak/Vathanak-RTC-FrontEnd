<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Table Header -->
    <div class="border-b border-gray-200 p-6">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Assigned Missions</h3>
          <p class="text-gray-600 text-sm mt-1">
            Manage all missions assigned to teachers
          </p>
        </div>
        <div class="text-sm text-gray-500">
          Showing {{ missions.length }} of {{ total }} missions
        </div>
      </div>
    </div>

    <!-- Horizontal scroll wrapper -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mission ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teachers
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mission Title
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned Date
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deadline
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32.5">
              Status
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="mission in missions"
            :key="mission.id"
            class="hover:bg-gray-50">
            <!-- Mission ID -->
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">
                #{{ mission.id }}
              </div>
            </td>

            <!-- Teachers -->
            <td class="px-6 py-4">
              <div v-if="mission.users && mission.users.length > 0">
                <div class="text-sm font-medium text-gray-900">
                  {{ mission.users[0].name }}
                  <span v-if="mission.users.length > 1" class="text-blue-600">
                    +{{ mission.users.length - 1 }} more
                  </span>
                </div>
                <div class="text-xs text-gray-500">
                  ID: {{ mission.users[0].id }}
                  <span v-if="mission.users.length > 1">
                    , +{{ mission.users.length - 1 }} more
                  </span>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400">
                No teacher assigned
              </div>
            </td>

            <!-- Title -->
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">
                {{ mission.mission_title }}
              </div>
              <div class="text-xs text-gray-500 truncate max-w-xs">
                {{ mission.description }}
              </div>
            </td>

            <!-- Type -->
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-3 py-1.5 text-xs rounded-full font-medium whitespace-nowrap inline-block min-w-25 text-center',
                  getTypeClass(mission.mission_type),
                ]">
                {{ mission.mission_type }}
              </span>
            </td>

            <!-- Assigned -->
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                :class="
                  formatDate(mission.assigned_date) === 'N/A'
                    ? 'bg-gray-50 text-gray-400 ring-1 ring-gray-200'
                    : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
                ">
                {{ formatDate(mission.assigned_date) }}
              </span>
            </td>

            <!-- Deadline -->
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
                :class="
                  formatDate(mission.due_date) === 'N/A'
                    ? 'bg-gray-50 text-gray-400 ring-1 ring-gray-200'
                    : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                ">
                {{ formatDate(mission.due_date) }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-3 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap inline-block min-w-25 text-center',
                  getStatusClass(mission),
                ]">
                {{ formatStatus(mission) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <!-- View -->
                <button
                  @click="$emit('view', mission)"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                  title="View Details">
                  <Eye class="size-4" />
                </button>

                <!-- Edit -->
                <button
                  v-if="canEditMission(mission)"
                  @click="$emit('edit', mission)"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  title="Edit Mission">
                  <Pencil class="size-4" />
                </button>

                <!-- Complete -->
                <button
                  v-if="canCompleteMission(mission)"
                  @click="$emit('complete', mission.id)"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition"
                  title="Mark as Complete">
                  <CheckCircle class="size-4" />
                </button>

                <!-- Cancel -->
                <button
                  v-if="canCancelMission(mission)"
                  @click="$emit('cancel', mission.id)"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                  title="Cancel Mission">
                  <X class="size-4" />
                </button>

                <!-- Download -->
                <button
                  v-if="mission.status === 'completed'"
                  @click="$emit('download', mission)"
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
                  title="Download Report">
                  <Download class="size-4" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty -->
          <tr v-if="missions.length === 0">
            <td colspan="8" class="px-6 py-12 text-center">
              <ClipboardCheck class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 class="text-lg font-medium text-gray-900 mb-2">
                No Missions Found
              </h4>
              <p class="text-gray-600">
                {{ emptyText }}
              </p>
            </td>
          </tr>

          <!-- Loading -->
          <!-- <tr v-if="loading">
            <td colspan="8" class="px-6 py-12 text-center">
              <div class="flex justify-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p class="text-gray-600 mt-2">Loading missions...</p>
            </td>
          </tr> -->
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import {
  ClipboardCheck,
  Eye,
  Pencil,
  X,
  CheckCircle,
  Download,
} from "lucide-vue-next";

const props = defineProps({
  missions: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },

  // if you want the table to reuse your logic from parent, pass them in:
  formatDate: { type: Function, required: true },
  formatStatus: { type: Function, required: true },
  getStatusClass: { type: Function, required: true },
  getTypeClass: { type: Function, required: true },

  canEditMission: { type: Function, required: true },
  canCancelMission: { type: Function, required: true },
  canCompleteMission: { type: Function, required: true },

  emptyText: { type: String, default: "No missions available." },
});

defineEmits(["view", "edit", "cancel", "complete", "download"]);
</script>
