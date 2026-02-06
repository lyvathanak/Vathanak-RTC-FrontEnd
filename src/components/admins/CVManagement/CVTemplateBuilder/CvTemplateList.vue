<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg sm:text-xl font-extrabold text-gray-900">
          Existing Templates
        </h3>
        <p class="text-sm text-gray-500">
          Manage, preview, assign, or update your CV templates.
        </p>
      </div>

      <button
        @click="$emit('new')"
        class="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#235AA6] text-white hover:bg-[#1f4f93] px-4 py-2.5 font-semibold shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
        <Plus class="w-4 h-4" />
        New Template
      </button>
    </div>

    <!-- Debug -->
    <div
      v-if="debugMode"
      class="text-xs text-gray-500 p-2 bg-gray-50 border border-gray-200 rounded-xl">
      Templates in array:
      <span class="font-semibold">{{ templates.length }}</span>
    </div>

    <!-- Grid -->
    <div
      v-if="templates.length"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
      <article
        v-for="t in templates"
        :key="t.id"
        class="h-full flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 hover:shadow-md transition overflow-hidden">
        <!-- HEADER -->
        <header class="h-28 p-5 border-b border-gray-100 bg-gray-50/60">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h4 class="text-base font-extrabold text-gray-900 truncate">
                {{ t.name }}
              </h4>
              <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                {{ t.description || "No description provided." }}
              </p>
            </div>

            <span
              class="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#235AA6] ring-1 ring-blue-100">
              <Layers class="w-3.5 h-3.5" />
              {{ t.sections?.length || 0 }}
            </span>
          </div>
        </header>

        <!-- BODY (flex-1 keeps layout consistent) -->
        <section class="p-5 space-y-3 flex-1">
          <div class="flex items-center justify-between">
            <h5 class="text-sm font-extrabold text-gray-800">Sections</h5>

            <button
              v-if="t.sections?.length"
              type="button"
              @click="$emit('preview', t)"
              class="inline-flex items-center gap-1 text-xs font-bold text-[#235AA6] hover:text-[#1f4f93]">
              <Eye class="w-3.5 h-3.5" />
              Quick preview
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="(section, i) in t.sections || []"
              :key="i"
              class="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
              <GripVertical class="w-3.5 h-3.5 text-gray-400" />
              {{ section.name }}
            </span>

            <span
              v-if="!(t.sections && t.sections.length)"
              class="text-sm text-gray-400 italic">
              No sections yet.
            </span>
          </div>
        </section>

        <!-- FOOTER (mt-auto pins it to bottom always) -->
        <footer class="mt-auto p-5 border-t border-gray-100 bg-gray-50/60">
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="$emit('edit', t)"
              class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 transition">
              <Pencil class="w-4 h-4" />
              Edit
            </button>

            <button
              @click="$emit('preview', t)"
              class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 transition">
              <Eye class="w-4 h-4" />
              Preview
            </button>

            <button
              @click="$emit('assign', t)"
              class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 transition">
              <UserPlus class="w-4 h-4" />
              Assign
            </button>

            <div class="flex-1"></div>

            <button
              @click="$emit('delete', t)"
              class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50 transition">
              <Trash2 class="w-4 h-4" />
              Delete
            </button>
          </div>
          <div class="pt-2 text-xs text-gray-500 flex items-center gap-2 mt-3">
            <Info class="w-4 h-4" />
            Tip: Use <span class="font-semibold text-gray-700">Assign</span> to
            apply this template to a CV.
          </div>
        </footer>
      </article>
    </div>

    <!-- Empty -->
    <div
      v-else
      class="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
      <div
        class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
        <FileText class="w-7 h-7 text-blue-600" />
      </div>
      <h4 class="text-lg font-extrabold text-gray-900 mb-2">
        No Templates Yet
      </h4>
      <p class="text-gray-500 mb-5 max-w-md mx-auto">
        Create your first CV template to start generating consistent,
        professional CVs.
      </p>
      <button
        @click="$emit('new')"
        class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white font-semibold shadow-sm hover:bg-blue-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
        <Plus class="w-4 h-4" />
        Create First Template
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  Plus,
  FileText,
  Pencil,
  Eye,
  UserPlus,
  Trash2,
  Layers,
  GripVertical,
  Info,
} from "lucide-vue-next";

defineProps({
  templates: { type: Array, default: () => [] },
  debugMode: { type: Boolean, default: false },
});
defineEmits(["new", "edit", "preview", "assign", "delete"]);
</script>
