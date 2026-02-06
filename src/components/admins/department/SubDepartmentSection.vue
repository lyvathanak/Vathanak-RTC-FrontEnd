<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200">
          <Info class="h-4 w-4 text-gray-600" />
        </span>
        <h4 class="text-sm font-semibold text-gray-900">Sub-Departments</h4>
        <span
          class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
          {{ subDepts.length }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          @click="silentRefresh"
          :disabled="busy"
          title="Refresh">
          <span class="text-base leading-none">⟳</span>
          Refresh
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-[#235AA6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f4c93] active:bg-[#1a407c] transition disabled:opacity-60 disabled:cursor-not-allowed"
          @click="openCreate"
          :disabled="busy">
          <span class="text-base leading-none">+</span>
          New
        </button>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table class="min-w-180 w-full text-sm">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Name</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left w-40 whitespace-nowrap">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="row in subDepts"
            :key="row.__key"
            class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-gray-700">
              <span class="font-medium">#{{ row.id ?? "—" }}</span>
            </td>

            <td class="px-4 py-3">
              <div class="font-semibold text-gray-900">
                {{ row.name || "—" }}
              </div>
              <div
                v-if="row.description"
                class="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {{ row.description }}
              </div>
            </td>

            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition"
                  title="View"
                  @click="openView(row)">
                  <Eye class="h-4 w-4" />
                </button>

                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100 transition"
                  title="Edit"
                  @click="openEdit(row)">
                  <Pencil class="h-4 w-4" />
                </button>

                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-700 hover:bg-red-50 active:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Delete"
                  @click="askDelete(row)"
                  :disabled="
                    deleting && String(confirmRow?.id) === String(row.id)
                  ">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!subDepts.length">
            <td colspan="4" class="px-4 py-10 text-center">
              <div
                class="mx-auto max-w-sm rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                No sub-departments found.
                <div class="mt-2">
                  Click <span class="font-semibold">New</span> to add your first
                  sub-department.
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sub-Department Modal -->
    <CreateSubDepartmentModal
      v-model="showSubModal"
      :mode="subModalMode"
      :department="department"
      :sub-department="activeSubDept"
      @saved="handleSubDeptSaved" />

    <!-- Delete confirm -->
    <transition name="fade-up">
      <div
        v-if="confirming"
        class="fixed inset-0 z-10000"
        role="dialog"
        aria-modal="true"
        @click.self="deleting ? null : (confirming = false)">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
          @click="deleting ? null : (confirming = false)" />

        <div
          class="relative w-full flex items-center justify-center p-3 sm:p-6">
          <div
            class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div class="border-b px-6 py-4">
              <h4 class="text-base sm:text-lg font-semibold text-gray-900">
                Delete sub-department?
              </h4>
              <p class="mt-1 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>

            <div class="px-6 py-4 text-sm text-gray-700">
              This will permanently delete
              <span class="font-semibold text-gray-900">
                {{ confirmRow?.name || "this item" }}
              </span>
              .
            </div>

            <div
              class="border-t bg-gray-50 px-6 py-4 flex items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-60"
                @click="confirming = false"
                :disabled="deleting">
                Cancel
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                :disabled="deleting"
                @click="doDelete">
                <span
                  v-if="deleting"
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                {{ deleting ? "Deleting…" : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "@/stores/apis/axios";
import { showNotification } from "@/lib/notifications.js";
import CreateSubDepartmentModal from "./CreateSubDepartmentModal.vue";
import { Eye, Pencil, Trash2, Info } from "lucide-vue-next";

const props = defineProps({
  department: { type: Object, default: null }, // must include { id }
  busy: { type: Boolean, default: false }, // disable buttons when parent saving
});

const emit = defineEmits([
  "updated", // emit latest list to parent if needed
]);

const subDepts = ref([]);

function decorateSub(rows) {
  return (rows || []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    active: true,
    __key: `${r.id}-${Math.random().toString(36).slice(2, 7)}`,
  }));
}

async function fetchSubDepts() {
  const id = props.department?.id;
  if (!id) {
    subDepts.value = [];
    return;
  }
  try {
    const { data } = await api.get(`/managements/get_department_detail/${id}`);
    subDepts.value = decorateSub(data?.department?.sub_departments || []);
    emit("updated", subDepts.value);
  } catch (e) {
    showNotification(
      e?.response?.data?.message ||
        e?.message ||
        "Failed to load sub-departments",
      "error",
    );
    subDepts.value = [];
  }
}

async function silentRefresh() {
  await fetchSubDepts();
}

/* Modal state (local) */
const subMode = ref(null); // create | edit | view
const showSubModal = computed({
  get: () => ["create", "edit", "view"].includes(String(subMode.value || "")),
  set: (v) => {
    if (!v) subMode.value = null;
  },
});
const subModalMode = computed(() => {
  const m = String(subMode.value || "");
  return m === "edit" ? "edit" : m === "view" ? "view" : "create";
});
const activeSubDept = ref(null);

function openCreate() {
  activeSubDept.value = null;
  subMode.value = "create";
}
function openEdit(row) {
  activeSubDept.value = row;
  subMode.value = "edit";
}
function openView(row) {
  activeSubDept.value = row;
  subMode.value = "view";
}

/* Delete confirm */
const confirming = ref(false);
const confirmRow = ref(null);
const deleting = ref(false);

function askDelete(row) {
  confirmRow.value = row;
  confirming.value = true;
}

async function doDelete() {
  const row = confirmRow.value;
  if (!row?.id) return;
  deleting.value = true;

  const prev = subDepts.value.slice();
  subDepts.value = subDepts.value.filter(
    (s) => String(s.id) !== String(row.id),
  );

  try {
    await api.delete(`/managements/delete_sub_department/${row.id}`);
    showNotification("Sub-department deleted.", "success");
    confirming.value = false;
    await silentRefresh();
  } catch (e1) {
    // fallback endpoints (your original code pattern)
    try {
      await api.post(`/managements/delete_sub_department`, {
        id: Number(row.id),
      });
      showNotification("Sub-department deleted.", "success");
      confirming.value = false;
      await silentRefresh();
    } catch (e2) {
      try {
        await api.delete(`/managements/remove_sub_department/${row.id}`);
        showNotification("Sub-department deleted.", "success");
        confirming.value = false;
        await silentRefresh();
      } catch (e3) {
        subDepts.value = prev;
        const msg =
          e3?.response?.data?.message ||
          e2?.response?.data?.message ||
          e1?.response?.data?.message ||
          e3?.message ||
          e2?.message ||
          e1?.message ||
          "Failed to delete sub-department";
        showNotification(msg, "error");
      }
    }
  } finally {
    deleting.value = false;
  }
}

/* When child saved (create/update) */
function handleSubDeptSaved(payload) {
  if (!payload) return;
  const op = payload.__op || (payload.id ? "update" : "create");

  if (op === "create") {
    subDepts.value = [
      {
        id: payload.id ?? null,
        name: payload.name,
        description: payload.description ?? "",
        active: true,
        __key: `${payload.id ?? "temp"}-${Math.random().toString(36).slice(2, 7)}`,
      },
      ...subDepts.value,
    ];
    showNotification("Create sub-department successful", "success");
  } else {
    subDepts.value = subDepts.value.map((s) =>
      String(s.id) === String(payload.id)
        ? { ...s, name: payload.name, description: payload.description ?? "" }
        : s,
    );
    showNotification("Update sub-department successful", "success");
  }

  // sync with backend
  silentRefresh();
}

/* load when department changes */
watch(
  () => props.department?.id,
  async (id) => {
    if (id) await fetchSubDepts();
    else subDepts.value = [];
  },
  { immediate: true },
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
