<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-9999 flex items-center justify-center px-3 sm:px-6"
        @keydown.esc.stop.prevent="onClose"
        tabindex="-1">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          @click="onClose" />

        <!-- Dialog -->
        <div
          class="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          role="dialog"
          aria-modal="true"
          @click.stop>
          <!-- Loading overlay -->
          <div
            v-if="saving"
            class="absolute inset-0 z-20 grid place-items-center bg-white/70 backdrop-blur-sm">
            <div
              class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow known">
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#235AA6]" />
              <span class="text-sm font-semibold text-gray-700">Saving…</span>
            </div>
          </div>

          <!-- Header (sticky) -->
          <div class="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
            <div class="flex items-start justify-between gap-4 px-6 py-4">
              <div class="min-w-0">
                <h3 class="text-lg sm:text-xl font-bold text-gray-900">
                  {{ modeTitle }}
                </h3>

                <p class="mt-1 text-sm text-gray-500">
                  {{ modeSubtitle }}
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition"
                @click="onClose"
                aria-label="Close">
                ✕
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Department (read-only) -->
              <div class="md:col-span-2">
                <div class="text-xs font-medium text-gray-500">Department</div>
                <div
                  class="mt-1 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-gray-800 truncate">
                      {{ departmentLabel }}
                    </div>
                    <div class="text-xs text-gray-500 truncate">
                      Linked parent department
                    </div>
                  </div>

                  <span
                    class="shrink-0 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                    #{{ department?.id ?? "—" }}
                  </span>
                </div>
              </div>

              <!-- Name -->
              <div class="md:col-span-2">
                <label class="text-xs font-medium text-gray-600">
                  Name <span v-if="isEditing" class="text-red-500">*</span>
                </label>

                <template v-if="isEditing">
                  <input
                    ref="nameEl"
                    v-model.trim="form.name"
                    type="text"
                    :disabled="saving"
                    :class="[
                      'mt-1 h-11 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition',
                      'focus:ring-2 focus:ring-[#235AA6]/30 focus:border-[#235AA6]',
                      errors.name
                        ? 'border-red-400 ring-1 ring-red-100'
                        : 'border-gray-200',
                      saving && 'opacity-60 cursor-not-allowed',
                    ]"
                    placeholder="e.g., Web Development" />

                  <p
                    class="mt-1 text-xs h-4"
                    :class="errors.name ? 'text-red-600' : 'opacity-0'">
                    {{ errors.name || "placeholder" }}
                  </p>
                </template>

                <template v-else>
                  <div
                    class="mt-1 rounded-xl border border-gray-200 bg-white px-4 py-3">
                    <div class="text-sm font-semibold text-gray-900">
                      {{ form.name || "—" }}
                    </div>
                    <div class="text-xs text-gray-500">Sub-department name</div>
                  </div>
                </template>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="text-xs font-medium text-gray-600">
                  Description
                </label>

                <template v-if="isEditing">
                  <textarea
                    v-model.trim="form.description"
                    rows="4"
                    :disabled="saving"
                    class="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#235AA6] focus:ring-2 focus:ring-[#235AA6]/30 disabled:opacity-60"
                    placeholder="Short description (optional)" />
                  <p class="mt-2 text-xs text-gray-500">
                    Keep it short—this helps users understand the scope.
                  </p>
                </template>

                <template v-else>
                  <div
                    class="mt-1 min-h-24 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800">
                    {{ form.description || "—" }}
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Footer (sticky) -->
          <div class="sticky bottom-0 border-t bg-gray-50">
            <div
              class="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <!-- View mode -->
              <button
                v-if="!isEditing"
                type="button"
                class="h-11 w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
                @click="onClose">
                Close
              </button>

              <!-- Edit/Create mode -->
              <template v-else>
                <button
                  type="button"
                  class="h-11 w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition disabled:opacity-60"
                  :disabled="saving"
                  @click="onClose">
                  Cancel
                </button>

                <button
                  type="button"
                  class="h-11 w-full sm:w-auto rounded-xl bg-[#235AA6] px-5 text-sm font-semibold text-white hover:bg-[#1f4c93] active:scale-[0.99] transition disabled:opacity-60"
                  :disabled="saving || !canSubmit"
                  @click="onSave">
                  {{ saving ? "Saving…" : submitLabel }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue";
import api from "@/stores/apis/axios";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: "create" }, // 'create' | 'view' | 'edit'
  department: { type: Object, default: null },
  subDepartment: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const saving = ref(false);
const nameEl = ref(null);

const errors = reactive({ name: "" });
const form = reactive({ id: null, name: "", description: "" });

const isEditing = computed(
  () => props.mode === "create" || props.mode === "edit"
);

const submitLabel = computed(() =>
  props.mode === "create" ? "Create" : "Save changes"
);

const modeTitle = computed(() =>
  props.mode === "create"
    ? "CREAER SUB-DEPARTMENT"
    : props.mode === "edit"
    ? "EDIT SUB-DEPARTMENT"
    : "SUB-DEPARTMENT DETAIL"
);

const modeSubtitle = computed(() =>
  props.mode === "create"
    ? "Add a new sub-department under this department."
    : props.mode === "edit"
    ? "Update the sub-department information."
    : "Review the sub-department information."
);

const departmentId = computed(() => props.department?.id ?? null);

const departmentLabel = computed(() => {
  const name =
    props.department?.name || props.department?.department_name || "—";
  return `${name}`;
});

const canSubmit = computed(() => {
  if (!isEditing.value) return false;
  return !!form.name?.trim() && !!departmentId.value && !saving.value;
});

function resetErrors() {
  errors.name = "";
}

function hydrate() {
  resetErrors();
  const d = props.subDepartment || {};
  form.id = d.id ?? null;
  form.name = d.name ?? "";
  form.description = d.description ?? "";
}

function onClose() {
  emit("update:modelValue", false);
}

async function onSave() {
  resetErrors();

  if (!form.name?.trim()) {
    errors.name = "Name is required";
    await nextTick();
    nameEl.value?.focus?.();
    return;
  }

  if (!departmentId.value) {
    alert("Missing department_id");
    return;
  }

  saving.value = true;
  try {
    if (props.mode === "create") {
      const { data } = await api.post("/managements/create_sub_department", {
        name: form.name.trim(),
        department_id: departmentId.value,
        description: form.description?.trim() || "",
      });

      const created = (data?.sub_department || data?.data || data) ?? null;

      emit("saved", {
        __op: "create",
        id: created?.id ?? null,
        name: created?.name ?? form.name,
        description: created?.description ?? form.description ?? "",
        active: true,
      });
    } else {
      await api.put(`/managements/update_sub_department/${form.id}`, {
        name: form.name.trim(),
        department_id: departmentId.value,
        description: form.description?.trim() || "",
      });

      emit("saved", {
        __op: "update",
        id: form.id,
        name: form.name,
        description: form.description ?? "",
        active: true,
      });
    }

    onClose();
  } catch (e) {
    alert(e?.response?.data?.message || e?.message || "Operation failed");
  } finally {
    saving.value = false;
  }
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
    hydrate();
    if (isEditing.value) {
      await nextTick();
      nameEl.value?.focus?.();
    }
  }
);

watch(
  () => props.subDepartment?.id,
  () => {
    if (props.modelValue) hydrate();
  }
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
