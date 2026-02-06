<template>
  <div class="mt-4">
    <!-- ✅ make scroll container relative -->
    <div
      class="relative overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table class="w-full subject-table">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr class="text-xs font-semibold text-gray-600 uppercase">
            <th class="px-4 py-3 text-left th-code">Subject Code</th>
            <th class="px-4 py-3 text-left th-name">Subject Name</th>
            <th class="px-4 py-3 text-left hidden sm:table-cell">Credit</th>
            <th class="px-4 py-3 text-left hidden md:table-cell">Total Hour</th>
            <th class="px-4 py-3 text-left hidden lg:table-cell">
              Practice Hour
            </th>
            <th class="px-4 py-3 text-left hidden md:table-cell">Program</th>
            <th class="px-4 py-3 text-left hidden lg:table-cell">Department</th>

            <!-- ✅ sticky header cell has bg-gray-50 and higher z-index -->
            <th class="px-3 py-3 text-left action-col action-col--head">
              Action
            </th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <tr v-for="s in subjects" :key="s.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 td-code">
              <div
                class="code-wrap font-medium text-gray-900"
                :title="s.__code">
                {{ s.__code || "-" }}
              </div>
            </td>

            <td class="px-4 py-3 td-name">
              <div class="name-wrap text-sm font-semibold text-gray-900">
                {{ s.__name || "-" }}
              </div>

              <div v-if="s.__code" class="mobile-code">
                {{ s.__code }}
              </div>

              <div
                v-if="s.description"
                class="desc-ellipsis mt-0.5 text-xs text-gray-500"
                :title="s.description">
                {{ s.description }}
              </div>
            </td>

            <td class="px-4 py-3 text-sm hidden sm:table-cell align-top">
              {{ formatCredit(s.credit) }}
            </td>
            <td class="px-4 py-3 text-sm hidden md:table-cell align-top">
              {{ formatHour(s.total_hours) }}
            </td>
            <td class="px-4 py-3 text-sm hidden lg:table-cell align-top">
              {{ formatHour(s.practice_hours) }}
            </td>
            <td class="px-4 py-3 text-sm hidden md:table-cell align-top">
              {{ programNameFromSubject(s) }}
            </td>
            <td class="px-4 py-3 text-sm hidden lg:table-cell align-top">
              {{ departmentNameFromSubject(s) }}
            </td>

            <!-- ✅ sticky body cell has bg-white and lower z-index than header -->
            <td class="px-2 py-2 action-col action-col--body">
              <div class="flex items-center gap-1.5 md:gap-2" @click.stop>
                <button
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  title="View"
                  @click.stop.prevent="$emit('view', s)">
                  <Eye class="size-4" />
                </button>

                <button
                  class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 active:bg-blue-100/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                  title="Edit"
                  @click.stop.prevent="$emit('edit', s)">
                  <Pencil class="size-4" />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <button
                      class="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100/60 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition"
                      title="Delete"
                      :disabled="deletingId === s.id"
                      @click.stop.prevent="$emit('ask-delete', s)">
                      <Trash2 class="size-4" />
                    </button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete
                        <strong>{{
                          s.__name || s.subject_name || "this subject"
                        }}</strong
                        >. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        class="bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                        :disabled="deletingId === s.id"
                        @click="$emit('confirm-delete')">
                        {{ deletingId === s.id ? "Deleting…" : "Delete" }}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="8" class="px-4 py-6 text-center text-sm text-gray-500">
              Loading…
            </td>
          </tr>

          <tr v-else-if="subjects.length === 0">
            <td colspan="8" class="px-4 py-6 text-center text-sm text-gray-500">
              No subjects found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { Eye, Trash2, Pencil } from "lucide-vue-next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

defineProps({
  subjects: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  deletingId: { type: [Number, String, null], default: null },

  formatCredit: { type: Function, required: true },
  formatHour: { type: Function, required: true },
  programNameFromSubject: { type: Function, required: true },
  departmentNameFromSubject: { type: Function, required: true },
});

defineEmits(["view", "edit", "ask-delete", "confirm-delete"]);
</script>

<style scoped>
.subject-table {
  table-layout: auto;
}

/* ✅ sticky action column (split header/body styles) */
.action-col {
  position: sticky;
  right: 0;
  min-width: 96px;
  width: 96px;
}
.action-col--head {
  background: #f9fafb; /* same as thead */
  z-index: 30;
}
.action-col--body {
  background: #ffffff;
  z-index: 10;
}

/* text */
.name-wrap {
  white-space: normal;
  word-break: break-word;
  line-height: 1.25;
}
.code-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.desc-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
.action-btn:hover {
  background: #f9fafb;
}
.action-btn:disabled {
  cursor: not-allowed;
}
.action-btn--edit {
  border-color: #bfdbfe;
  color: #2563eb;
}
.action-btn--edit:hover {
  background: #eff6ff;
}
.action-btn--delete {
  border-color: #fecaca;
  color: #dc2626;
}
.action-btn--delete:hover {
  background: #fef2f2;
}

/* responsive code column */
.th-code,
.td-code {
  display: none;
}
.mobile-code {
  display: inline-block;
  font-size: 11px;
  margin-top: 2px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #6b7280;
}

@media (min-width: 640px) {
  .th-code,
  .td-code {
    display: table-cell;
    width: 160px;
    min-width: 140px;
  }
  .mobile-code {
    display: none;
  }
}

/* only for small screens ensure scroll */
@media (max-width: 768px) {
  :deep(table) {
    min-width: 900px;
  }
}
</style>
