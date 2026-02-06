<!-- /src/components/admins/DepartmentManagement/EditDepartmentModal.vue -->
<template>
  <transition name="fade-up">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-9999 flex items-center justify-center px-3 sm:px-6"
      role="dialog"
      aria-modal="true"
      @click.self="saving ? null : close()">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        @click="saving ? null : close()" />

      <div class="relative w-full flex items-center justify-center p-3 sm:p-6">
        <div
          class="w-full max-w-245 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          @click.stop>
          <!-- Header -->
          <div class="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
            <div
              class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3
                    class="text-base sm:text-lg font-bold text-gray-900 truncate">
                    Edit Department
                  </h3>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#235AA6] ring-1 ring-inset ring-blue-200"
                    :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("edit_department") }}
                  </span>
                </div>

                <p class="mt-1 text-xs sm:text-sm text-gray-500">
                  Update name, description, head assignment, and manage
                  sub-departments.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition disabled:opacity-60"
                :disabled="saving"
                @click="close()"
                aria-label="Close">
                <X class="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="max-h-[75vh] overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            <!-- Form card -->
            <section
              class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <div class="flex items-center gap-2 mb-4">
                <span
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
                  <Info class="h-4 w-4 text-gray-600" />
                </span>
                <h4 class="text-sm font-semibold text-gray-900">
                  Department Details
                </h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <!-- Name -->
                <div class="space-y-1.5">
                  <div class="text-xs font-semibold text-gray-500">Name</div>
                  <input
                    v-model.trim="form.name"
                    class="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50"
                    :class="
                      errors.name
                        ? 'border-red-400 focus:ring-red-500/25 focus:border-red-400'
                        : 'border-gray-200'
                    "
                    placeholder="Department name"
                    :disabled="saving" />
                  <p v-if="errors.name" class="text-xs text-red-600">
                    {{ errors.name }}
                  </p>
                </div>
                <!-- HOD -->
                <div class="space-y-1.5">
                  <BaseSelect
                    v-model="form.hodUserId"
                    :options="filteredHods"
                    label="Head of Department"
                    placeholder="Select head of department"
                    allLabel="Not Assigned"
                    :disabled="saving"
                    :hint="
                      unassignWarning
                        ? 'Clearing HOD won’t unassign (no API for unassign).'
                        : ''
                    " />
                </div>

                <!-- Description -->
                <div class="md:col-span-2 space-y-1.5">
                  <div class="text-xs font-semibold text-gray-500">
                    Description
                  </div>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    class="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50"
                    :disabled="saving"
                    placeholder="Write a short description..." />
                </div>
              </div>
            </section>

            <!-- ✅ Sub-departments card -->
            <section
              class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              <SubDepartmentSection
                :department="props.department"
                :busy="saving" />
            </section>
          </div>

          <!-- Footer -->
          <div
            class="sticky bottom-0 z-20 border-t bg-gray-50/95 backdrop-blur px-5 sm:px-6 py-4">
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                class="inline-flex justify-center rounded-lg border border-red-600 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition disabled:opacity-60"
                @click="close()"
                :disabled="saving">
                Cancel
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#235AA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4c93] active:bg-[#1a407c] transition disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="saving"
                @click="save()">
                <span
                  v-if="saving"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                {{ saving ? "Saving…" : "Save" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";
import { X, Info } from "lucide-vue-next";
import SubDepartmentSection from "./SubDepartmentSection.vue";
import { useI18n } from "vue-i18n";
import BaseSelect from "@/components/features/BaseSelect.vue";

const { t, locale: i18nLocale } = useI18n();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  department: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue", "saved"]);

const saving = ref(false);
const errors = reactive({ name: "" });

const rawHeads = ref([]);
const form = reactive({ id: null, name: "", description: "", hodUserId: "" });
const original = reactive({ name: "", description: "", hodUserId: "" });

function close() {
  emit("update:modelValue", false);
}

function copyIntoForm(d) {
  const safe = d || {};

  // ✅ accept both API + normalized field names
  const name = safe.name ?? safe.department_name ?? "";
  const description = safe.description ?? "";

  const headId =
    safe?.head_of_department?.id != null
      ? Number(safe.head_of_department.id)
      : safe?.department_head_id != null
        ? Number(safe.department_head_id)
        : "";

  form.id = safe?.id ?? null;
  form.name = name;
  form.description = description;
  form.hodUserId = headId;

  original.name = form.name;
  original.description = form.description;
  original.hodUserId = form.hodUserId;
}

async function loadHeads() {
  try {
    const { data } = await api.get("/users/get_all_head");
    rawHeads.value = Array.isArray(data?.users) ? data.users : [];
  } catch (e) {
    showNotification(
      e?.response?.data?.message || e?.message || "Failed to load HOD list",
      "error",
    );
    rawHeads.value = [];
  }
}

const filteredHods = computed(() => {
  const d = props.department;
  const depId = d?.id != null ? String(d.id) : "";
  const currentHeadId =
    d?.head_of_department?.id != null
      ? String(d.head_of_department.id)
      : d?.department_head_id != null
        ? String(d.department_head_id)
        : "";

  const out = [];
  for (const u of rawHeads.value || []) {
    const free = u && u.head_department === null;
    const isCurrentOfThis =
      currentHeadId &&
      String(u?.id) === currentHeadId &&
      u?.head_department &&
      String(u.head_department.id) === depId;

    if (free || isCurrentOfThis) {
      out.push({
        value: Number(u.id),
        label: isCurrentOfThis
          ? `${u.name || "Current Head"} (current)`
          : u.name || `User ${u.id}`,
      });
    }
  }

  const seen = new Set();
  const uniq = out.filter((o) =>
    seen.has(o.value) ? false : (seen.add(o.value), true),
  );
  uniq.sort((a, b) => {
    const ac = a.label.endsWith("(current)");
    const bc = b.label.endsWith("(current)");
    if (ac && !bc) return -1;
    if (!ac && bc) return 1;
    return a.label.localeCompare(b.label);
  });
  return uniq;
});

const changedCore = computed(
  () =>
    (form.name || "") !== (original.name || "") ||
    (form.description || "") !== (original.description || ""),
);
const changedHod = computed(
  () => String(form.hodUserId || "") !== String(original.hodUserId || ""),
);
const unassignWarning = computed(
  () => changedHod.value && !form.hodUserId && !!original.hodUserId,
);

function buildEmitPayload(updatedFromApi, selectedHodId) {
  const d = updatedFromApi || props.department || {};
  const opt = filteredHods.value.find(
    (h) => String(h.value) === String(selectedHodId),
  );
  const fallbackLabel =
    opt?.label || (selectedHodId ? `User ${selectedHodId}` : "Not Assigned");

  const headObj = d.head_of_department
    ? d.head_of_department
    : selectedHodId
      ? { id: Number(selectedHodId), name: fallbackLabel }
      : { name: "Not Assigned" };

  return {
    id: d.id ?? form.id,
    name: form.name,
    description: form.description || "",
    department_head_id:
      d.department_head_id ?? (selectedHodId ? Number(selectedHodId) : null),
    head_of_department: headObj,
  };
}

async function save() {
  if (!form.id) return;

  errors.name = form.name ? "" : "Name is required";
  if (errors.name) return;

  if (!changedCore.value && !changedHod.value) {
    showNotification("No changes to save.", "info");
    emit("saved", buildEmitPayload(null, form.hodUserId));
    close();
    return;
  }

  saving.value = true;
  const warnings = [];

  try {
    if (changedCore.value) {
      try {
        await api.put(`/managements/update_department/${form.id}`, {
          department_name: form.name,
          description: form.description || "",
        });
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Update failed";
        const fieldErr =
          e?.response?.data?.errors?.department_name?.[0] ||
          (msg && /name/i.test(msg) ? msg : "");
        if (fieldErr) errors.name = fieldErr;
        showNotification(fieldErr || msg, "error");
        saving.value = false;
        return;
      }
    }

    if (changedHod.value && form.hodUserId) {
      try {
        await api.post(`/managements/assign_head/${form.id}`, {
          user_id: Number(form.hodUserId),
        });
      } catch (e) {
        warnings.push(
          e?.response?.data?.message || e?.message || "Failed to assign head",
        );
      }
    }

    let refreshed = null;
    try {
      const { data } = await api.get(
        `/managements/get_department_detail/${form.id}`,
      );
      refreshed = data?.department
        ? {
            id: data.department.id ?? form.id,
            name: data.department.department_name ?? form.name,
            description: data.department.description ?? form.description,
            department_head_id: data.department.department_head_id ?? null,
            head_of_department: data.department.head_of_department ?? null,
          }
        : null;
    } catch {}

    emit("saved", buildEmitPayload(refreshed, form.hodUserId));

    if (warnings.length) {
      showNotification(
        `Saved with warnings: ${warnings.join(" | ")}`,
        "warning",
      );
    } else {
      showNotification("Department updated successfully.", "success");
    }

    close();
  } catch (e) {
    showNotification(
      `Save failed: ${e?.response?.data?.message || e?.message || "Unknown error"}`,
      "error",
    );
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      copyIntoForm(props.department);
      await loadHeads();
      errors.name = "";
    }
  },
);
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
