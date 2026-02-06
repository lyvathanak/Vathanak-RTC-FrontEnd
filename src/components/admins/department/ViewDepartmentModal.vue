<!-- /src/components/admins/DepartmentManagement/ViewDepartmentModal.vue -->
<template>
  <transition name="fade-up">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-9999 flex items-center justify-center px-3 sm:px-6"
      role="dialog"
      aria-modal="true"
      @click.self="openEdit ? null : onClose()">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        @click="openEdit ? null : onClose()" />

      <!-- Center -->
      <div class="relative w-full flex items-center justify-center p-3 sm:p-6">
        <!-- Panel -->
        <div
          class="relative w-full max-w-245 lg:max-w-275 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          @click.stop>
          <!-- Header -->
          <div class="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
            <div
              class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4">
              <div class="min-w-0">
                <div class="flex items-center gap-3 min-w-0 flex-wrap">
                  <h3
                    :class="[
                      'text-base sm:text-lg font-bold text-gray-900 truncate',
                      locale === 'kh' ? 'khmer-text' : '',
                    ]">
                    {{ t("department") }}
                  </h3>

                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#235AA6] ring-1 ring-inset ring-blue-200"
                    :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("view_department") }}
                  </span>
                </div>

                <p class="mt-1 text-xs sm:text-sm text-gray-500">
                  View details and manage sub-departments.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                @click="onClose"
                :disabled="openEdit"
                aria-label="Close">
                <X class="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="max-h-[75vh] overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            <!-- Department Info Card -->
            <section
              class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3 mb-4">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
                    <Info class="h-4 w-4 text-gray-600" />
                  </span>
                  <h4 class="text-sm font-semibold text-gray-900">
                    Department Information
                  </h4>
                </div>

                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Name -->
                <div class="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div class="text-xs font-semibold text-gray-500">Name</div>
                  <div class="mt-1 text-sm font-bold text-gray-900">
                    {{ dept?.name || "—" }}
                  </div>
                </div>

                <!-- HOD -->
                <div class="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div class="text-xs font-semibold text-gray-500">
                    Head of Department
                  </div>
                  <div class="mt-1 text-sm font-bold text-gray-900">
                    {{ hodResolved }}
                  </div>
                </div>

                <!-- Description -->
                <div
                  class="md:col-span-2 rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div class="text-xs font-semibold text-gray-500">
                    Description
                  </div>
                  <div class="mt-1 text-sm text-gray-800 whitespace-pre-line">
                    {{ dept?.description || "—" }}
                  </div>
                </div>
              </div>
            </section>

            <!-- ✅ Sub-departments section (shared component) -->
            <SubDepartmentSection
              :department="dept"
              :busy="openEdit"
              @updated="handleSubListUpdated" />
          </div>

          <!-- Footer -->
          <div
            class="sticky bottom-0 z-20 border-t bg-gray-50/95 backdrop-blur px-5 sm:px-6 py-4">
            <div
              class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <p class="text-xs text-gray-500">
                Tip: Press <span class="font-medium">Esc</span> to close.
              </p>

              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-lg border border-red-600 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition disabled:opacity-60"
                  @click="onClose"
                  :disabled="openEdit">
                  Close
                </button>

                <!-- 
                <button
                  type="button"
                  class="inline-flex justify-center rounded-xl bg-[#235AA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4c93] active:bg-[#1a407c] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  @click="openEdit = true">
                  Edit Department
                </button> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Edit modal -->
        <EditDepartmentModal
          v-model="openEdit"
          :department="dept"
          @saved="handleDeptSaved" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";
import EditDepartmentModal from "./EditDepartmentModal.vue";
import SubDepartmentSection from "./SubDepartmentSection.vue";
import { X, Info } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, locale: i18nLocale } = useI18n();
const locale = computed(() =>
  i18nLocale.value === "km" ? "kh" : i18nLocale.value,
);

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  department: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const route = useRoute();

const openEdit = ref(false);
const detail = ref(null);

const dept = computed(() => detail.value ?? props.department ?? null);

const hodResolved = computed(() => {
  if (!dept.value) return "Not Assigned";
  if (dept.value.head_of_department?.name)
    return dept.value.head_of_department.name;
  if (dept.value.department_head_id)
    return `Head of Department ${dept.value.department_head_id}`;
  return "Not Assigned";
});

function onClose() {
  emit("update:modelValue", false);
}

/* Edit modal saved -> refresh view */
async function handleDeptSaved(updated) {
  if (!updated) return;
  detail.value = updated;
  emit("saved", updated);

  // Optional: refresh from backend to keep view perfect
  if (updated?.id) await fetchDepartmentDetail(updated.id);
}

/* optional: if you want to react when sub list updates */
function handleSubListUpdated(list) {
  // you can update a badge, etc. (not required)
}

function normalizeDetail(apiRow) {
  return {
    id: apiRow?.id ?? null,
    name: apiRow?.department_name ?? "",
    description: apiRow?.description ?? "",
    department_head_id: apiRow?.department_head_id ?? null,
    head_of_department: apiRow?.head_of_department ?? null,
  };
}

async function fetchDepartmentDetail(id) {
  if (!id) {
    detail.value = null;
    return;
  }
  try {
    const { data } = await api.get(`/managements/get_department_detail/${id}`);
    detail.value = normalizeDetail(data?.department);
  } catch (e) {
    showNotification(
      e?.response?.data?.message ||
        e?.message ||
        "Failed to load department details",
      "error",
    );
    detail.value = props.department || null;
  }
}

/* open */
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      await fetchDepartmentDetail(props.department?.id ?? route.params.deptId);
    } else {
      openEdit.value = false;
    }
  },
);

/* ESC */
function onKey(e) {
  if (e.key === "Escape") {
    if (openEdit.value) return; // don’t close view behind edit
    onClose();
  }
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
