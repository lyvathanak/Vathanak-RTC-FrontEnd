<template>
  <div
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-225 w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr
            class="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 sticky-left text-left w-20">ID</th>
            <th class="px-6 py-3 text-left min-w-70">Department</th>
            <th class="px-4 py-3 text-left w-56">Head</th>
            <th class="px-4 py-3 text-left w-28">Status</th>
            <th class="px-4 py-3 text-left w-44">Created</th>
            <th class="px-4 py-3 sticky-right text-right w-36">Actions</th>
          </tr>
        </thead>

        <!-- Loading -->
        <tbody v-if="loading">
          <tr v-for="i in 5" :key="i" class="border-b last:border-b-0">
            <td class="px-4 py-4 sticky-left bg-white">
              <div class="h-4 w-12 rounded bg-gray-100 animate-pulse" />
            </td>
            <td class="px-6 py-4">
              <div class="h-4 w-56 rounded bg-gray-100 animate-pulse" />
              <div class="h-3 w-80 mt-2 rounded bg-gray-100 animate-pulse" />
            </td>
            <td class="px-4 py-4">
              <div class="h-4 w-40 rounded bg-gray-100 animate-pulse" />
              <div class="h-3 w-52 mt-2 rounded bg-gray-100 animate-pulse" />
            </td>
            <td class="px-4 py-4">
              <div class="h-6 w-20 rounded-full bg-gray-100 animate-pulse" />
            </td>
            <td class="px-4 py-4">
              <div class="h-4 w-28 rounded bg-gray-100 animate-pulse" />
            </td>
            <td class="px-4 py-4 sticky-right bg-white">
              <div class="flex justify-end gap-2">
                <div class="h-9 w-9 rounded-xl bg-gray-100 animate-pulse" />
                <div class="h-9 w-9 rounded-xl bg-gray-100 animate-pulse" />
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Data -->
        <tbody v-else-if="rows?.length" class="divide-y">
          <tr
            v-for="d in rows"
            :key="d.id"
            class="hover:bg-gray-50/70 transition-colors">
            <!-- ID -->
            <td
              class="px-4 py-4 sticky-left bg-white text-gray-700 font-semibold whitespace-nowrap">
              {{ d.id }}
            </td>

            <!-- Department -->
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900 leading-5 line-clamp-1">
                {{ getDeptName(d) }}
              </div>
              <div
                class="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1"
                :title="d.description || ''">
                {{ d.description || "—" }}
              </div>
            </td>

            <!-- Head -->
            <td class="px-4 py-4">
              <div class="font-semibold text-gray-800 line-clamp-1">
                {{ getHeadName(d) }}
              </div>
              <div
                v-if="getHeadEmail(d)"
                class="text-xs text-gray-500 line-clamp-1">
                {{ getHeadEmail(d) }}
              </div>
            </td>

            <!-- Status (your list API doesn't include status → assume Active if exists; change if you have a field) -->
            <td class="px-4 py-4">
              <span
                class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold border-emerald-200 bg-emerald-50 text-emerald-700">
                <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </td>

            <!-- Created -->
            <td class="px-4 py-4 text-gray-700">
              <div class="font-semibold">
                {{ formatDateDMY(getCreatedAt(d)) }}
              </div>
              <div class="text-xs text-gray-500">
                {{ formatTimeDMY(getCreatedAt(d)) }}
              </div>
            </td>

            <!-- Actions -->
            <td class="px-4 py-4 sticky-right bg-white">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
                  title="View"
                  @click="$emit('view', d)">
                  <Eye class="size-4" />
                </button>

                <button
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 active:scale-[0.99] transition"
                  title="Edit"
                  @click="$emit('edit', d)">
                  <Pencil class="size-4" />
                </button>

                <button
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Delete"
                  :disabled="deletingId === d.id"
                  @click="$emit('delete', d)">
                  <Trash2 class="size-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty -->
        <tbody v-else>
          <tr>
            <td colspan="6" class="px-6 py-12 text-center">
              <div class="text-gray-900 font-bold">No departments</div>
              <div class="text-gray-500 text-sm mt-1">{{ emptyText }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Eye, Trash2, Pencil } from "lucide-vue-next";

defineProps({
  rows: { type: Array, default: () => [] }, // expects API rows like your "all_department"
  loading: { type: Boolean, default: false },
  deletingId: { type: [Number, String, null], default: null },
  emptyText: { type: String, default: "No departments found." },
});

defineEmits(["view", "edit", "delete"]);

/**
 * Backend format: "05-01-2026 16:30:49" (DD-MM-YYYY HH:mm:ss)
 * JS Date() can't parse reliably, so parse manually.
 */
function parseDMYDateTime(value) {
  if (!value || typeof value !== "string") return null;
  const [datePart, timePart] = value.split(" ");
  if (!datePart) return null;

  const [dd, mm, yyyy] = datePart.split("-").map((n) => Number(n));
  if (!dd || !mm || !yyyy) return null;

  let hh = 0,
    mi = 0,
    ss = 0;
  if (timePart) {
    const parts = timePart.split(":").map((n) => Number(n));
    hh = parts[0] ?? 0;
    mi = parts[1] ?? 0;
    ss = parts[2] ?? 0;
  }

  const d = new Date(yyyy, mm - 1, dd, hh, mi, ss);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateDMY(value) {
  const d = parseDMYDateTime(value);
  return d ? d.toLocaleDateString() : "—";
}

function formatTimeDMY(value) {
  const d = parseDMYDateTime(value);
  return d
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
}

function getDeptName(d) {
  return (
    d?.department_name ??
    d?.departmentName ??
    d?.name ??
    d?.department?.department_name ??
    d?.department?.name ??
    "—"
  );
}

function getHeadName(d) {
  return (
    d?.head_of_department?.name ??
    d?.head_of_department_name ??
    d?.head_name ??
    d?.head?.name ??
    "Not assigned"
  );
}

function getHeadEmail(d) {
  return (
    d?.head_of_department?.email ??
    d?.head_of_department_email ??
    d?.head_email ??
    d?.head?.email ??
    ""
  );
}

function getCreatedAt(d) {
  return d?.created_at ?? d?.createdAt ?? d?.created ?? d?.created_date ?? "";
}
</script>

<style scoped>
.sticky-left {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
}

.sticky-right {
  position: sticky;
  right: 0;
  z-index: 2;
  background: white;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
