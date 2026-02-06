<template>
  <transition name="fade-up">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
      @click.self="onClose">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      <!-- Center -->
      <div class="relative inset-0 flex items-center justify-center p-3 sm:p-6">
        <!-- Panel -->
        <div
          class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          @click.stop>
          <!-- Header -->
          <div class="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
            <div
              class="flex items-start justify-between gap-4 px-5 sm:px-6 py-4">
              <div class="min-w-0">
                <div class="flex items-center gap-3 min-w-0 flex-wrap">
                  <h3
                    :id="titleId"
                    :class="[
                      'text-base sm:text-lg font-bold text-gray-900 truncate',
                      locale === 'kh' ? 'khmer-text' : '',
                    ]">
                    {{ t("department") }}
                  </h3>

                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#235AA6] ring-1 ring-inset ring-blue-200"
                    :class="[locale === 'kh' ? 'khmer-text' : '']">
                    {{ t("add_department") }}
                  </span>
                </div>

                <p :id="descId" class="mt-1 text-xs sm:text-sm text-gray-500">
                  Create a department, assign a head, and optionally add
                  sub-departments.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                @click="onClose"
                :disabled="saving"
                aria-label="Close">
                <X class="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="max-h-[75vh] overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
            <!-- Section: Department Information -->
            <section class="space-y-4">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
                  <Info class="h-4 w-4 text-gray-600" />
                </span>
                <h4 class="text-sm font-semibold text-gray-900">
                  Department Information
                </h4>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Department Name -->
                <div class="space-y-1.5">
                  <label class="block text-sm font-medium text-gray-700">
                    Department Name <span class="text-red-500">*</span>
                  </label>

                  <div class="relative">
                    <input
                      v-model.trim="form.department_name"
                      type="text"
                      placeholder="Enter Department Name"
                      class="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50"
                      :class="
                        errors.department_name
                          ? 'border-red-400 focus:ring-red-500/25 focus:border-red-400'
                          : 'border-gray-200'
                      "
                      :disabled="saving" />

                    <span
                      v-if="errors.department_name"
                      class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-red-500 text-xs font-semibold">
                      !
                    </span>
                  </div>

                  <p v-if="errors.department_name" class="text-xs text-red-600">
                    {{ errors.department_name }}
                  </p>
                </div>

                <!-- Head of Department -->
                <div class="space-y-1.5">
                  <BaseSelect
                    v-model="hodUserId"
                    :options="hodOptions"
                    label="Head of Department"
                    placeholder="Select head of department"
                    allLabel="Not Assigned"
                    :disabled="saving"
                    hint="Only available heads not assigned to another department." />
                </div>

                <!-- Description -->
                <div class="md:col-span-2 space-y-1.5">
                  <label class="block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    v-model="form.description"
                    rows="3"
                    placeholder="Short description"
                    class="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50"
                    :disabled="saving" />
                </div>
              </div>
            </section>

            <!-- Section: Sub-departments -->
            <section class="rounded-2xl border border-gray-200 overflow-hidden">
              <div
                class="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-b">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
                    <Info class="h-4 w-4 text-gray-600" />
                  </span>
                  <h4 class="text-sm font-semibold text-gray-900">
                    Sub-departments
                  </h4>
                </div>

                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  @click="addSubDep"
                  :disabled="saving">
                  <span class="text-base leading-none">+</span>
                  Add sub-department
                </button>
              </div>

              <div class="p-4 space-y-3">
                <div
                  v-if="!subDeps.length"
                  class="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  No sub-departments yet. Click
                  <span class="font-medium">Add sub-department</span> to create
                  one.
                </div>

                <div
                  v-for="(sd, i) in subDeps"
                  :key="sd.__key"
                  class="rounded-2xl border border-gray-200 bg-white p-4">
                  <div class="flex items-start gap-3">
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <!-- Name -->
                      <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700">
                          Name
                          <span class="text-red-500" v-if="sd._errName">*</span>
                        </label>

                        <input
                          v-model.trim="sd.name"
                          type="text"
                          placeholder="e.g., Web Development"
                          class="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50"
                          :class="
                            sd._errName
                              ? 'border-red-400 focus:ring-red-500/25 focus:border-red-400'
                              : 'border-gray-200'
                          "
                          :disabled="saving" />

                        <p v-if="sd._errName" class="text-xs text-red-600">
                          Name is required.
                        </p>
                      </div>

                      <!-- Description -->
                      <div class="space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700">
                          Description
                        </label>

                        <input
                          v-model="sd.description"
                          type="text"
                          placeholder="Short description"
                          class="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6] disabled:bg-gray-50"
                          :disabled="saving" />
                      </div>
                    </div>

                    <button
                      type="button"
                      class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      @click="removeSubDep(i)"
                      aria-label="Remove"
                      :disabled="saving">
                      <X class="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <div
            class="sticky bottom-0 border-t bg-gray-50/95 backdrop-blur px-5 sm:px-6 py-4">
            <div
              class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                type="button"
                class="inline-flex justify-center rounded-lg border border-red-600 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition disabled:opacity-60"
                @click="onClose"
                :disabled="saving">
                Cancel
              </button>

              <button
                type="button"
                class="inline-flex justify-center items-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4c93] active:bg-[#1a407c] transition disabled:opacity-60 disabled:cursor-not-allowed"
                @click="save"
                :disabled="saving">
                <span
                  v-if="saving"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                {{ saving ? "Saving…" : "Save" }}
              </button>
            </div>

            <p class="mt-3 text-xs text-gray-500">
              Tip: Press <span class="font-medium">Esc</span> to close the
              modal.
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount } from "vue";
import api from "@/stores/apis/axios";
import BaseSelect from "@/components/features/BaseSelect.vue";
import { X, Info } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const titleId = "add-department-title";
const descId = "add-department-desc";

/* Props / Emits */
const props = defineProps({ modelValue: { type: Boolean, default: false } });
const emit = defineEmits(["update:modelValue", "saved", "error"]);

/* ---------------- State ---------------- */
const saving = ref(false);
const errors = reactive({ department_name: "" });

/* -------- HOD options (only available) -------- */
const hodOptions = ref([]);
const hodUserId = ref("");

async function fetchHods() {
  try {
    const { data } = await api.get("/users/get_all_head");
    const list = Array.isArray(data?.users) ? data.users : [];
    const free = list.filter((u) => u?.head_department == null);
    hodOptions.value = free.map((u) => ({
      value: String(u.id),
      label: u.name || `User ${u.id}`,
    }));
  } catch (e) {
    console.error("[AddDepartmentModal] fetchHods error:", e);
    hodOptions.value = [];
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) fetchHods();
  },
);

/* -------- Form -------- */
const form = reactive({
  code: "",
  department_name: "",
  description: "",
});

/* -------- Sub-departments -------- */
const subDeps = ref([]);
function addSubDep() {
  subDeps.value.push({
    name: "",
    description: "",
    _errName: false,
    __key: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
  });
}
function removeSubDep(i) {
  subDeps.value.splice(i, 1);
}

/* -------- Utilities -------- */
function resetForm() {
  form.code = "";
  form.department_name = "";
  form.description = "";
  errors.department_name = "";
  hodUserId.value = "";
  subDeps.value = [];
}
function onClose() {
  if (saving.value) return;
  emit("update:modelValue", false);
}

/* Esc to close */
function onKey(e) {
  if (e.key === "Escape") onClose();
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

/* ---- Save pipeline ---- */
async function save() {
  errors.department_name = form.department_name
    ? ""
    : "Department name is required";
  let subErr = false;
  subDeps.value.forEach((sd) => {
    sd._errName = !sd.name?.trim();
    subErr ||= sd._errName;
  });
  if (errors.department_name || subErr) return;

  saving.value = true;
  const warnings = [];

  try {
    const { data: createRes } = await api.post(
      "/managements/add_new_department",
      {
        department_name: form.department_name,
        description: form.description || "",
      },
    );

    const createdDeptId =
      createRes?.Department?.id ?? createRes?.department?.id ?? createRes?.id;

    if (!createdDeptId)
      throw new Error("Create department: missing ID in response");

    if (hodUserId.value) {
      try {
        await api.post(`/managements/assign_head/${createdDeptId}`, {
          user_id: Number(hodUserId.value),
        });
      } catch (e) {
        warnings.push(
          `Assign head: ${e?.response?.data?.message || e?.message || "failed"}`,
        );
      }
    }

    const validSubs = subDeps.value.filter((sd) => sd.name && sd.name.trim());
    if (validSubs.length) {
      const reqs = validSubs.map((sd) =>
        api
          .post("/managements/create_sub_department", {
            name: sd.name.trim(),
            department_id: createdDeptId,
            description: sd.description || "",
          })
          .catch((e) => ({ _err: e })),
      );
      const results = await Promise.all(reqs);
      results.forEach((r, idx) => {
        if (r && r._err) {
          const sd = validSubs[idx];
          warnings.push(
            `Sub "${sd.name}": ${
              r._err?.response?.data?.message || r._err?.message || "failed"
            }`,
          );
        }
      });
    }

    const payload = {
      id: createdDeptId,
      name: form.department_name,
      description: form.description || "",
      head_of_department: hodUserId.value
        ? {
            id: Number(hodUserId.value),
            name:
              hodOptions.value.find((o) => o.value === String(hodUserId.value))
                ?.label || `User ${hodUserId.value}`,
          }
        : null,
    };

    emit("saved", payload);
    emit("update:modelValue", false);
    resetForm();
  } catch (e) {
    const res = e?.response?.data;
    const nameTaken =
      res?.errors?.department_name?.[0] ||
      (typeof res?.message === "string" &&
      /already|taken|exists/i.test(res.message)
        ? res.message
        : null);

    if (nameTaken) {
      errors.department_name = nameTaken;
      emit("error", nameTaken);
    } else {
      const msg = res?.message || e?.message || "Create failed";
      emit("error", msg);
    }
  } finally {
    saving.value = false;
  }
}
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
