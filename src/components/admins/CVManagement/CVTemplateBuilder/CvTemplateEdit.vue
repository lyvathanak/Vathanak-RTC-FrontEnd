<template>
  <div class="space-y-6">
    <!-- Header / Intro -->
    <div
      class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-xl sm:text-2xl font-extrabold text-blue-950">
            {{ modelValue?.id ? "Edit Template" : "Create New Template" }}
          </h3>
          <p class="mt-1 text-sm sm:text-base text-[#235AA6]">
            {{
              modelValue?.id
                ? "Update your existing CV template sections and fields."
                : "Define the sections and fields for your new CV template."
            }}
          </p>
        </div>

        <div class="hidden sm:flex items-center gap-2">
          <span
            class="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-[#235AA6]">
            {{ modelValue.sections?.length || 0 }} Sections
          </span>
          <span
            class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
            {{ totalFields }} Fields
          </span>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="space-y-5">
      <!-- Template Name -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900">
              Template Name <span class="text-red-500">*</span>
            </label>
            <p class="mt-1 text-xs sm:text-sm text-gray-500">
              Give this template a recognizable name (e.g., “ITC Modern CV”).
            </p>
          </div>
        </div>

        <input
          :value="modelValue.name"
          @input="update('name', $event.target.value)"
          placeholder="e.g., Professional CV Template"
          class="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#235AA6] focus:ring-4 focus:ring-blue-500/15" />
      </div>

      <!-- Description -->
      <div
        class="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
        <label class="block text-sm font-semibold text-gray-900">
          Description
        </label>
        <p class="mt-1 text-xs sm:text-sm text-gray-500">
          Optional. Briefly describe when to use this template.
        </p>

        <textarea
          :value="modelValue.description"
          @input="update('description', $event.target.value)"
          rows="3"
          placeholder="Short description…"
          class="mt-4 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-[#235AA6] focus:ring-4 focus:ring-blue-500/15" />
      </div>

      <!-- Sections -->
      <div
        class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div
          class="flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 sm:px-6 py-4">
          <div>
            <label class="block text-sm font-semibold text-gray-900">
              Template Sections <span class="text-red-500">*</span>
            </label>
            <p class="mt-1 text-xs sm:text-sm text-gray-500">
              Organize fields into sections (Education, Experience, Skills…)
            </p>
          </div>

          <button
            @click="$emit('add-section')"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#235AA6] shadow-sm transition hover:bg-blue-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-500/15">
            <Plus class="w-4 h-4" />
            Add Section
          </button>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <!-- Section Cards -->
          <div
            v-for="(section, sectionIndex) in modelValue.sections"
            :key="section.id || sectionIndex"
            class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <!-- Section Header -->
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-50 to-white px-4 sm:px-5 py-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <div
                  class="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-blue-100 text-[#235AA6]">
                  <GripVertical class="w-4 h-4" />
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="section.name"
                      type="text"
                      placeholder="Section name (e.g., Education)"
                      class="w-64 max-w-[70vw] rounded-xl border border-transparent bg-white/60 px-3 py-2 text-sm font-semibold text-blue-950 outline-none transition focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/10" />
                    <span
                      class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-[#235AA6]">
                      {{ section.fields.length }} fields
                    </span>
                  </div>
                  <p class="mt-1 text-xs text-[#235AA6]/80">
                    Add fields users will fill in for this section.
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 self-start sm:self-auto">
                <button
                  @click="$emit('add-field', sectionIndex)"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-blue-700 transition hover:bg-blue-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-blue-500/15">
                  <Plus class="w-4 h-4" />
                  Add Field
                </button>

                <button
                  @click="$emit('remove-section', sectionIndex)"
                  type="button"
                  class="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white p-2 text-red-700 transition hover:bg-red-50 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-red-500/15"
                  title="Remove section">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Fields -->
            <div class="p-4 sm:p-5 space-y-3">
              <div
                v-for="(field, fieldIndex) in section.fields"
                :key="fieldIndex"
                class="group rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm transition hover:border-gray-300">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <!-- Field type -->
                  <div class="w-full lg:w-56">
                    <BaseSelect
                      :modelValue="field.type"
                      @update:modelValue="(v) => (field.type = v)"
                      label="Type"
                      placeholder="Choose type"
                      :options="fieldTypeOptions" />
                  </div>

                  <!-- Label -->
                  <div class="flex-1">
                    <label
                      class="block text-xs font-semibold text-gray-700 mb-1"
                      >Label</label
                    >
                    <input
                      v-model="field.label"
                      placeholder="e.g., University name"
                      class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#235AA6] focus:ring-4 focus:ring-blue-500/15" />
                  </div>

                  <!-- Required + remove -->
                  <div
                    class="flex items-center justify-between lg:justify-end gap-3 lg:w-44">
                    <label class="inline-flex items-center gap-2">
                      <input
                        v-model="field.required"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-[#235AA6] focus:ring-[#235AA6]" />
                      <span class="text-sm font-medium text-gray-800"
                        >Required</span
                      >
                    </label>

                    <button
                      @click="$emit('remove-field', sectionIndex, fieldIndex)"
                      type="button"
                      class="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white p-2 text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/15"
                      title="Remove field">
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Hint row (optional) -->
                <div
                  class="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span class="inline-flex items-center gap-1">
                    <Info class="w-3.5 h-3.5" />
                    Tip: Keep labels short and clear.
                  </span>
                  <span
                    class="hidden sm:inline text-gray-400 group-hover:text-gray-500 transition">
                    Field #{{ fieldIndex + 1 }}
                  </span>
                </div>
              </div>

              <!-- Empty fields -->
              <div
                v-if="section.fields.length === 0"
                class="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <p class="text-sm font-semibold text-gray-800">
                  No fields in this section
                </p>
                <p class="mt-1 text-xs sm:text-sm text-gray-500">
                  Click “Add Field” to start building.
                </p>
              </div>
            </div>
          </div>

          <!-- Empty sections -->
          <div
            v-if="modelValue.sections.length === 0"
            class="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <div
              class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-200">
              <List class="w-6 h-6 text-gray-500" />
            </div>
            <p class="mt-3 text-sm font-semibold text-gray-900">
              No sections added yet
            </p>
            <p class="mt-1 text-sm text-gray-500">
              Click “Add Section” to begin.
            </p>

            <button
              @click="$emit('create-default')"
              type="button"
              class="mt-4 inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-[#235AA6] shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/15">
              Create a default professional template
            </button>
          </div>
        </div>
      </div>

      <!-- Validation -->
      <div
        v-if="!isTemplateValid"
        class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        <div class="flex items-start gap-2">
          <AlertTriangle class="w-5 h-5 mt-0.5" />
          <div>
            <p class="font-semibold">Template is incomplete</p>
            <p class="text-red-700/90">
              Please fill template name, add at least 1 section and 1 field.
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom bar (optional place for Save/Cancel buttons) -->
      <div class="sticky bottom-0">
        <div
          class="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 sm:px-6 py-3 shadow-sm">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p class="text-xs sm:text-sm text-gray-600">
              Sections:
              <span class="font-semibold text-gray-900">{{
                modelValue.sections.length
              }}</span>
              · Fields:
              <span class="font-semibold text-gray-900">{{ totalFields }}</span>
            </p>

            <!-- put your Save/Cancel buttons in the parent, or slot here -->
            <p class="text-xs text-gray-400">
              Changes are reflected immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Plus,
  X,
  List,
  Trash2,
  Info,
  AlertTriangle,
  GripVertical,
} from "lucide-vue-next";
import BaseSelect from "@/components/features/BaseSelect.vue";

const props = defineProps({
  modelValue: { type: Object, required: true },
  isTemplateValid: { type: Boolean, default: false },
});

const fieldTypeOptions = [
  { label: "Text Input", value: "text" },
  { label: "Text Area", value: "textarea" },
  { label: "Dropdown", value: "select" },
  { label: "File Upload", value: "file" },
];

const emit = defineEmits([
  "update:modelValue",
  "add-section",
  "remove-section",
  "add-field",
  "remove-field",
  "create-default",
]);

const update = (key, val) => {
  emit("update:modelValue", { ...props.modelValue, [key]: val });
};

const totalFields = computed(() => {
  const sections = props.modelValue?.sections || [];
  return sections.reduce((sum, s) => sum + (s.fields?.length || 0), 0);
});
</script>
