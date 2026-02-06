<template>
  <div class="cv-submission">
    <!-- Page Header -->
    <div
      class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100">
      <div class="w-full max-w-none px-4 sm:px-6 lg:px-8 py-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h2
              class="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Test CV Submission
            </h2>
            <p class="text-gray-600 mt-1">
              Fill in the CV form and submit to test the system
            </p>
          </div>

          <button
            @click="showTemplateBuilder = true"
            class="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition">
            <Settings class="w-4 h-4" />
            Manage Templates
          </button>
        </div>
      </div>
    </div>

    <div class="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <!-- Template Selection -->
      <section class="space-y-4">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Select CV Template</h3>
            <p class="text-sm text-gray-600 mt-1">
              Choose a template to generate the form fields below.
            </p>
          </div>

          <div class="text-xs text-gray-500">
            {{ assignedTemplates.length }} template{{
              assignedTemplates.length === 1 ? "" : "s"
            }}
          </div>
        </div>

        <div
          v-if="assignedTemplates.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="template in assignedTemplates"
            :key="template.id"
            type="button"
            @click="selectTemplate(template)"
            :class="[
              'text-left group relative rounded-2xl border p-5 transition-all outline-none',
              'bg-white hover:-translate-y-0.5 hover:shadow-lg',
              selectedTemplate?.id === template.id
                ? 'border-blue-400 ring-4 ring-blue-100 shadow-sm'
                : 'border-gray-200 hover:border-gray-300',
            ]">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="font-extrabold text-gray-900 truncate">
                  {{ template.name }}
                </h4>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                  {{ template.description }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {{ template.sections?.length || 0 }} sections
                  </span>
                  <span
                    class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {{ countFields(template) }} fields
                  </span>
                  <span
                    v-if="selectedTemplate?.id === template.id"
                    class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Selected
                  </span>
                </div>
              </div>

              <div
                class="mt-0.5 h-10 w-10 rounded-2xl flex items-center justify-center ring-1 transition"
                :class="
                  selectedTemplate?.id === template.id
                    ? 'bg-blue-50 ring-blue-200'
                    : 'bg-gray-50 ring-gray-200 group-hover:bg-blue-50 group-hover:ring-blue-200'
                ">
                <Check
                  v-if="selectedTemplate?.id === template.id"
                  class="w-5 h-5 text-blue-600" />
                <FileText
                  v-else
                  class="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </div>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-8 text-center">
          <div
            class="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white ring-1 ring-gray-200 flex items-center justify-center">
            <FileText class="w-7 h-7 text-gray-400" />
          </div>
          <h4 class="text-lg font-extrabold text-gray-900">
            No Templates Available
          </h4>
          <p class="text-gray-600 mt-1 mb-5">
            You need to create or assign a CV template first.
          </p>
          <button
            @click="showTemplateBuilder = true"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Plus class="w-4 h-4" />
            Create Template
          </button>
        </div>
      </section>

      <!-- CV Form -->
      <section v-if="selectedTemplate" class="space-y-6">
        <!-- Form header -->
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-extrabold text-gray-900">
                {{ selectedTemplate.name }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                Fill in all required fields (<span
                  class="text-red-500 font-semibold"
                  >*</span
                >) then submit.
              </p>
            </div>

            <button
              @click="resetForm"
              type="button"
              class="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              <X class="w-4 h-4" />
              Clear Template
            </button>
          </div>
        </div>

        <!-- Sections -->
        <div class="space-y-6">
          <div
            v-for="section in selectedTemplate.sections"
            :key="section.id"
            class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <!-- Section Header -->
            <div
              class="px-6 py-5 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <h3 class="text-base sm:text-lg font-extrabold text-gray-900">
                {{ section.name }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                Fill in the information below
              </p>
            </div>

            <!-- Section Fields -->
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="field in section.fields"
                  :key="field.label"
                  :class="[field.type === 'textarea' ? 'md:col-span-2' : '']">
                  <label class="block text-sm font-semibold text-gray-800 mb-2">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500">*</span>
                  </label>

                  <!-- Text Input -->
                  <input
                    v-if="field.type === 'text'"
                    v-model="formData[field.label]"
                    type="text"
                    :placeholder="getPlaceholder(field)"
                    :required="field.required"
                    :class="[
                      'w-full rounded-xl border px-4 py-3 text-sm',
                      'bg-white placeholder:text-gray-400',
                      'focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition',
                      errors[field.label]
                        ? 'border-red-300 ring-4 ring-red-50'
                        : 'border-gray-200',
                    ]" />

                  <!-- Textarea -->
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    v-model="formData[field.label]"
                    :placeholder="getPlaceholder(field)"
                    :required="field.required"
                    rows="5"
                    :class="[
                      'w-full rounded-xl border px-4 py-3 text-sm',
                      'bg-white placeholder:text-gray-400',
                      'focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition',
                      errors[field.label]
                        ? 'border-red-300 ring-4 ring-red-50'
                        : 'border-gray-200',
                    ]"></textarea>

                  <!-- Select -->
                  <select
                    v-else-if="field.type === 'select'"
                    v-model="formData[field.label]"
                    :required="field.required"
                    :class="[
                      'w-full rounded-xl border px-4 py-3 text-sm bg-white',
                      'focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition',
                      errors[field.label]
                        ? 'border-red-300 ring-4 ring-red-50'
                        : 'border-gray-200',
                    ]">
                    <option value="">
                      Select {{ field.label.toLowerCase() }}
                    </option>

                    <optgroup
                      v-if="
                        field.label.includes('Degree') ||
                        field.label.includes('degree')
                      "
                      label="Degree Levels">
                      <option
                        v-for="level in CV_CONSTANTS.degreeLevels"
                        :key="level"
                        :value="level">
                        {{ level }}
                      </option>
                    </optgroup>

                    <optgroup
                      v-if="
                        field.label.includes('Proficiency') ||
                        field.label.includes('Level')
                      "
                      label="Proficiency Levels">
                      <option
                        v-for="level in CV_CONSTANTS.proficiencyLevels"
                        :key="level"
                        :value="level">
                        {{ level }}
                      </option>
                    </optgroup>

                    <optgroup
                      v-if="
                        field.label.includes('Experience') ||
                        field.label.includes('Level')
                      "
                      label="Experience Levels">
                      <option
                        v-for="level in CV_CONSTANTS.experienceLevels"
                        :key="level"
                        :value="level">
                        {{ level }}
                      </option>
                    </optgroup>

                    <optgroup
                      v-if="field.label.includes('Contact Type')"
                      label="Contact Types">
                      <option
                        v-for="type in CV_CONSTANTS.contactType"
                        :key="type"
                        :value="type">
                        {{ type }}
                      </option>
                    </optgroup>

                    <option v-if="field.label.includes('Gender')" value="Male">
                      Male
                    </option>
                    <option
                      v-if="field.label.includes('Gender')"
                      value="Female">
                      Female
                    </option>
                    <option v-if="field.label.includes('Gender')" value="Other">
                      Other
                    </option>

                    <option
                      v-if="field.label.includes('Status')"
                      value="Single">
                      Single
                    </option>
                    <option
                      v-if="field.label.includes('Status')"
                      value="Married">
                      Married
                    </option>
                    <option
                      v-if="field.label.includes('Status')"
                      value="Divorced">
                      Divorced
                    </option>
                  </select>

                  <!-- File Upload -->
                  <div v-else-if="field.type === 'file'" class="space-y-3">
                    <input
                      type="file"
                      @change="handleFileUpload(field.label, $event)"
                      :required="field.required"
                      class="hidden"
                      :id="`file-${field.label}`"
                      :accept="
                        field.label.includes('Photo')
                          ? 'image/*'
                          : '.pdf,.doc,.docx'
                      " />

                    <label
                      :for="`file-${field.label}`"
                      :class="[
                        'group flex items-center gap-4 rounded-2xl border-2 border-dashed px-5 py-6 cursor-pointer transition',
                        errors[field.label]
                          ? 'border-red-300 bg-red-50/40'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40',
                      ]">
                      <div
                        class="h-12 w-12 rounded-2xl bg-white ring-1 ring-gray-200 flex items-center justify-center group-hover:ring-blue-200">
                        <Upload
                          class="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-extrabold text-gray-900">
                          Upload {{ field.label.toLowerCase() }}
                        </p>
                        <p class="text-xs text-gray-600 mt-1">
                          {{
                            field.label.includes("Photo")
                              ? "PNG, JPG, GIF up to 5MB"
                              : "PDF, DOC, DOCX up to 10MB"
                          }}
                        </p>
                      </div>
                    </label>

                    <div
                      v-if="formData[field.label]"
                      class="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
                      <div
                        class="h-10 w-10 rounded-2xl bg-white ring-1 ring-green-200 flex items-center justify-center">
                        <Check class="w-5 h-5 text-green-600" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-sm font-extrabold text-green-900 truncate">
                          {{ getFileName(formData[field.label]) }}
                        </p>
                        <p class="text-xs text-green-700">
                          {{ getFileSize(formData[field.label]) }}
                        </p>
                      </div>
                      <button
                        @click="removeFile(field.label)"
                        type="button"
                        class="rounded-xl p-2 text-red-600 hover:bg-red-50 transition"
                        aria-label="Remove file">
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Multi-select -->
                  <div v-else-if="isMultiSelectField(field)" class="space-y-3">
                    <div class="flex flex-col sm:flex-row gap-2">
                      <input
                        v-model="currentMultiInput[field.label]"
                        type="text"
                        :placeholder="`Add ${field.label.toLowerCase()} (e.g., PHP)`"
                        class="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
                        @keyup.enter="addMultiItem(field.label)" />

                      <select
                        v-if="
                          field.label.includes('Skill') ||
                          field.label.includes('Language')
                        "
                        v-model="currentMultiLevel[field.label]"
                        class="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition">
                        <option value="">Level</option>
                        <option
                          v-for="level in field.label.includes('Skill')
                            ? CV_CONSTANTS.skillProficiencyLevels
                            : CV_CONSTANTS.proficiencyLevels"
                          :key="level"
                          :value="level">
                          {{ level }}
                        </option>
                      </select>

                      <button
                        @click="addMultiItem(field.label)"
                        type="button"
                        class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                        Add
                      </button>
                    </div>

                    <div
                      v-if="getMultiItems(field.label).length > 0"
                      class="flex flex-wrap gap-2">
                      <div
                        v-for="(item, index) in getMultiItems(field.label)"
                        :key="index"
                        class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
                        <div class="leading-tight">
                          <p class="text-xs font-extrabold text-gray-900">
                            {{ item.name }}
                          </p>
                          <p
                            v-if="item.level"
                            class="text-[11px] text-gray-600">
                            ({{ item.level }})
                          </p>
                        </div>
                        <button
                          @click="removeMultiItem(field.label, index)"
                          type="button"
                          class="rounded-full p-1 text-red-600 hover:bg-red-50 transition"
                          aria-label="Remove item">
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Error Message -->
                  <p
                    v-if="errors[field.label]"
                    class="text-red-600 text-sm mt-2 font-medium">
                    {{ errors[field.label] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="sticky bottom-0 z-10">
          <div
            class="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur px-5 py-4 shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.25)]">
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p class="text-sm text-gray-600">
                Make sure required fields are filled before submitting.
              </p>

              <div class="flex justify-end gap-3">
                <button
                  @click="resetForm"
                  type="button"
                  class="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                  Reset Form
                </button>

                <button
                  @click="submitCV"
                  :disabled="isSubmitting || !isFormValid"
                  class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition inline-flex items-center gap-2">
                  <FileText class="w-4 h-4" />
                  {{ isSubmitting ? "Submitting..." : "Submit CV" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50">
      <div
        class="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div class="p-6 text-center">
          <div
            class="mx-auto mb-4 h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <Check class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-xl font-extrabold text-gray-900">
            CV Submitted Successfully!
          </h3>
          <p class="text-gray-600 mt-2">
            Your CV has been submitted and is now pending approval.
          </p>

          <div class="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              @click="showSuccessModal = false"
              class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              OK
            </button>
            <button
              @click="viewMySubmission"
              class="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
              View Submission
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Builder Modal -->
    <CVTemplateBuilder
      v-if="showTemplateBuilder"
      :show="showTemplateBuilder"
      @close="showTemplateBuilder = false"
      @template-saved="handleTemplateSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as cvApi from "@/stores/apis/CVManagement.js";
import { CV_CONSTANTS } from "@/stores/apis/CVManagement.js";
import {
  FileText,
  Eye,
  X,
  Upload,
  Check,
  Plus,
  User,
  Download,
  Users,
  UserPlus,
  Settings,
  Search,
} from "lucide-vue-next";
import CVDetails from "./CVDetails.vue";
import CVTemplateBuilder from "./CVTemplateBuilder.vue";

// Emits
const emit = defineEmits(["submission-created", "submission-deleted"]);

// State
const assignedTemplates = ref([]);
const selectedTemplate = ref(null);
const showTemplateBuilder = ref(false);
const showSuccessModal = ref(false);
const formData = ref({});
const isSubmitting = ref(false);
const errors = ref({});
const mySubmissions = ref([]);
const currentMultiInput = ref({});
const currentMultiLevel = ref({});

// Load assigned templates
const loadAssignedTemplates = async () => {
  try {
    // Get templates from localStorage (since templates are managed in Template Builder)
    const allTemplates = JSON.parse(
      localStorage.getItem("cv-templates") || "[]",
    );

    // Get templates assigned to Admin role
    assignedTemplates.value = allTemplates.filter((template) => {
      if (!template.assignedRoles || template.assignedRoles.length === 0) {
        return true; // If no assignment, available to all
      }
      return template.assignedRoles.includes("Admin");
    });

    console.log("📋 Assigned templates:", assignedTemplates.value.length);

    // If no templates, create a default one with dropdown fields
    if (assignedTemplates.value.length === 0) {
      const defaultTemplate = {
        id: 1,
        name: "Professional CV Template",
        description:
          "Standard CV template for software developers with dropdown fields",
        assignedRoles: ["Admin"],
        sections: [
          {
            id: "personal",
            name: "Personal Information",
            fields: [
              { type: "text", label: "Full Name", required: true },
              { type: "text", label: "Job Title", required: true },
              { type: "select", label: "Gender", required: false },
              { type: "select", label: "Marital Status", required: false },
            ],
          },
          {
            id: "contact",
            name: "Contact Information",
            fields: [
              { type: "text", label: "Email", required: true },
              { type: "text", label: "Phone", required: true },
              { type: "text", label: "Address", required: false },
              { type: "text", label: "LinkedIn", required: false },
              { type: "text", label: "Github", required: false },
            ],
          },
          {
            id: "education",
            name: "Education",
            fields: [
              { type: "select", label: "Highest Degree", required: true },
              { type: "text", label: "Major/Field", required: true },
              { type: "text", label: "University", required: true },
              { type: "text", label: "Graduation Year", required: false },
              { type: "textarea", label: "Description", required: false },
            ],
          },
          {
            id: "skills",
            name: "Skills",
            fields: [
              { type: "textarea", label: "Technical Skills", required: false },
            ],
          },
          {
            id: "languages",
            name: "Languages",
            fields: [{ type: "textarea", label: "Languages", required: false }],
          },
          {
            id: "experience",
            name: "Work Experience",
            fields: [
              { type: "textarea", label: "Work Experience", required: true },
            ],
          },
        ],
      };
      assignedTemplates.value = [defaultTemplate];
      // Save to localStorage
      localStorage.setItem("cv-templates", JSON.stringify([defaultTemplate]));
    }
  } catch (error) {
    console.error("Error loading templates:", error);
  }
};

// Helper methods
const countFields = (template) => {
  return (
    template.sections?.reduce(
      (total, section) => total + (section.fields?.length || 0),
      0,
    ) || 0
  );
};

const selectTemplate = (template) => {
  selectedTemplate.value = template;
  formData.value = {};
  errors.value = {};
  console.log("✅ Selected template:", template.name);
};

const getPlaceholder = (field) => {
  const placeholders = {
    "Full Name": "Enter your full name",
    "Job Title": "Enter your job title",
    Email: "example@email.com",
    Phone: "+855 12 345 678",
    Address: "Enter your address",
    LinkedIn: "https://linkedin.com/in/username",
    Github: "https://github.com/username",
    University: "University name",
    "Major/Field": "e.g., Computer Science",
    "Graduation Year": "e.g., 2024",
    Description: "Enter additional details...",
  };
  return placeholders[field.label] || `Enter ${field.label.toLowerCase()}`;
};

const isMultiSelectField = (field) => {
  return field.label.includes("Skill") || field.label.includes("Language");
};

const getMultiItems = (fieldLabel) => {
  if (!formData.value[fieldLabel]) return [];
  if (Array.isArray(formData.value[fieldLabel]))
    return formData.value[fieldLabel];

  // Parse string format
  try {
    return JSON.parse(formData.value[fieldLabel]);
  } catch {
    return [];
  }
};

const addMultiItem = (fieldLabel) => {
  const input = currentMultiInput.value[fieldLabel]?.trim();
  const level = currentMultiLevel.value[fieldLabel];

  if (!input) return;

  const currentItems = getMultiItems(fieldLabel);
  const newItem = {
    name: input,
    level: level || "Intermediate",
  };

  const updatedItems = [...currentItems, newItem];
  formData.value[fieldLabel] = JSON.stringify(updatedItems);

  // Clear inputs
  currentMultiInput.value[fieldLabel] = "";
  currentMultiLevel.value[fieldLabel] = "";
};

const removeMultiItem = (fieldLabel, index) => {
  const currentItems = getMultiItems(fieldLabel);
  currentItems.splice(index, 1);
  formData.value[fieldLabel] = JSON.stringify(currentItems);
};

const handleFileUpload = (fieldLabel, event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Store file object
  formData.value[fieldLabel] = file;
};

const getFileName = (file) => {
  if (!file) return "";
  if (typeof file === "string") return "Uploaded file";
  return file.name;
};

const getFileSize = (file) => {
  if (!file || typeof file !== "object") return "";
  const sizeInMB = file.size / (1024 * 1024);
  return `${sizeInMB.toFixed(2)} MB`;
};

const removeFile = (fieldLabel) => {
  delete formData.value[fieldLabel];
};

// Form validation
const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!selectedTemplate.value) {
    errors.value.general = "Please select a template";
    isValid = false;
    return isValid;
  }

  // Check required fields
  selectedTemplate.value.sections.forEach((section) => {
    section.fields.forEach((field) => {
      if (field.required) {
        const value = formData.value[field.label];
        if (!value || (typeof value === "string" && !value.trim())) {
          errors.value[field.label] = `${field.label} is required`;
          isValid = false;
        }
      }
    });
  });

  // Validate email format
  if (formData.value["Email"]) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.value["Email"])) {
      errors.value["Email"] = "Please enter a valid email address";
      isValid = false;
    }
  }

  // Validate phone format
  if (formData.value["Phone"]) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(formData.value["Phone"])) {
      errors.value["Phone"] = "Please enter a valid phone number";
      isValid = false;
    }
  }

  return isValid;
};

const isFormValid = computed(() => {
  if (!selectedTemplate.value) return false;

  // Check required fields quickly (no error messages)
  for (const section of selectedTemplate.value.sections || []) {
    for (const field of section.fields || []) {
      if (field.required) {
        const v = formData.value[field.label];
        if (!v || (typeof v === "string" && !v.trim())) return false;
      }
    }
  }

  return true;
});

// Submit CV using backend API
const submitCV = async () => {
  if (!validateForm()) {
    alert("Please fill in all required fields correctly");
    return;
  }

  isSubmitting.value = true;

  try {
    console.log("📤 Submitting CV with form data:", formData.value);

    // Transform form data to backend API format
    const apiData = cvApi.buildCVFormData(formData.value);

    // Add current user info
    const currentUserId = localStorage.getItem("current_user_id") || 1;
    const currentUserName =
      localStorage.getItem("current_user_name") || "Admin User";

    console.log("📤 Mapped API data:", apiData);

    // Create CV using backend API
    const result = await cvApi.createNewCV(apiData);

    if (result.success) {
      // Create submission object for local state
      const submission = {
        id: result.cv_id || Date.now(),
        user_id: currentUserId,
        user_name: currentUserName,
        template_id: selectedTemplate.value?.id,
        template_name: selectedTemplate.value?.name || "Professional CV",
        template_description: selectedTemplate.value?.description || "",
        form_data: formData.value,
        submitted_date: new Date().toISOString(),
        status: "pending",
        // Store the API data too
        api_data: apiData,
      };

      // Also save to localStorage for immediate display
      const localSubmissions = JSON.parse(
        localStorage.getItem("admin-cv-submissions") || "[]",
      );
      localSubmissions.push(submission);
      localStorage.setItem(
        "admin-cv-submissions",
        JSON.stringify(localSubmissions),
      );

      // Show success
      showSuccessModal.value = true;
      resetForm();

      // Emit event
      emit("submission-created");

      console.log("✅ CV submitted successfully! CV ID:", result.cv_id);
    } else {
      throw new Error(result.error || "Failed to create CV");
    }
  } catch (error) {
    console.error("Error submitting CV:", error);
    alert(`Failed to submit CV: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formData.value = {};
  errors.value = {};
  currentMultiInput.value = {};
  currentMultiLevel.value = {};
  selectedTemplate.value = null;
};

const handleTemplateSaved = () => {
  loadAssignedTemplates();
  showTemplateBuilder.value = false;
};

const viewMySubmission = () => {
  // This would navigate to the management tab or show modal
  showSuccessModal.value = false;
  emit("submission-created");
};

// Initialize
onMounted(() => {
  loadAssignedTemplates();
});
</script>

<style scoped>
.cv-submission {
  min-height: 100vh;
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

/* Better textarea behavior */
textarea {
  resize: vertical;
  min-height: 120px;
}

/* Smooth modal entrance */
.fixed {
  animation: fadeIn 0.22s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Optional clamp helper (if not already in Tailwind config) */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
