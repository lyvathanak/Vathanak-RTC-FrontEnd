<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6 py-6">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          @click="closeModal" />

        <!-- Modal Panel -->
        <div
          class="relative w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
          role="dialog"
          aria-modal="true"
          @click.stop>
          <!-- Header (sticky) -->
          <header
            class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-100 bg-white/90 backdrop-blur px-5 sm:px-6 py-4">
            <div class="min-w-0">
              <h2
                class="text-lg sm:text-2xl font-extrabold text-gray-900 truncate">
                {{ getModalTitle() }}
              </h2>
              <p class="text-xs sm:text-sm text-gray-500 mt-1">
                Manage templates: create, edit, preview, and assign roles.
              </p>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
              aria-label="Close">
              <X class="w-5 h-5" />
            </button>
          </header>

          <!-- Body -->
          <main class="flex-1 overflow-y-auto px-5 sm:px-6 py-5 bg-gray-50">
            <div class="max-w-6xl mx-auto">
              <Transition name="view-slide" mode="out-in">
                <div :key="currentView" class="space-y-5">
                  <!-- LIST -->
                  <CvTemplateList
                    v-if="currentView === 'list'"
                    :templates="templates"
                    :debug-mode="debugMode"
                    @new="createNewTemplate"
                    @edit="editTemplate"
                    @preview="previewTemplate"
                    @assign="assignTemplate"
                    @delete="deleteTemplate" />

                  <!-- EDIT -->
                  <CvTemplateEdit
                    v-else-if="currentView === 'edit'"
                    v-model="editingTemplate"
                    :is-template-valid="isTemplateValid"
                    @add-section="addSection"
                    @remove-section="removeSection"
                    @add-field="addFieldToSection"
                    @remove-field="removeFieldFromSection"
                    @create-default="createDefaultTemplate" />

                  <!-- PREVIEW -->
                  <CvTemplatePreview
                    v-else-if="currentView === 'preview'"
                    :template="previewTemplateData"
                    :get-field-placeholder="getFieldPlaceholder" />

                  <!-- ASSIGN -->
                  <CvTemplateAssign
                    v-else-if="currentView === 'assign'"
                    :template="assignTemplateData"
                    v-model:selectedRoles="selectedRoles"
                    v-model:assignmentNotes="assignmentNotes" />
                </div>
              </Transition>
            </div>
          </main>

          <!-- Footer (sticky) -->
          <footer
            class="sticky bottom-0 z-10 border-t border-gray-100 bg-white/90 backdrop-blur px-5 sm:px-6 py-4">
            <div class="flex items-center justify-between gap-3">
              <!-- Left side helper -->
              <div class="text-xs sm:text-sm text-gray-500">
                <span
                  v-if="currentView === 'edit' && !isTemplateValid"
                  class="text-red-600">
                  Please fill name, add sections and fields.
                </span>
                <span v-else>
                  Tip: Press
                  <kbd
                    class="px-2 py-0.5 rounded bg-gray-100 border text-gray-700"
                    >Esc</kbd
                  >
                  to close.
                </span>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 sm:gap-3">
                <!-- LIST -->
                <button
                  v-if="currentView === 'list'"
                  @click="$emit('close')"
                  class="px-4 sm:px-6 py-2 rounded-lg border border-red-300 text-white bg-red-700 hover:bg-red-800 transition font-semibold">
                  Close
                </button>

                <!-- EDIT -->
                <template v-else-if="currentView === 'edit'">
                  <button
                    @click="backToList"
                    class="px-4 sm:px-6 py-2 rounded-lg border border-red-300 text-white bg-red-700 hover:bg-red-800 transition font-semibold">
                    Cancel
                  </button>
                  <button
                    @click="saveTemplate"
                    :disabled="!isTemplateValid"
                    class="px-4 sm:px-6 py-2 rounded-lg bg-[#235AA6] text-white font-semibold hover:bg-[#1f4f93] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
                    {{
                      editingTemplate?.id
                        ? "Update Template"
                        : "Create Template"
                    }}
                  </button>
                </template>

                <!-- PREVIEW -->
                <template v-else-if="currentView === 'preview'">
                  <button
                    @click="backToList"
                    class="px-4 sm:px-6 py-2 rounded-lg border border-red-300 text-white bg-red-700 hover:bg-red-800 transition font-semibold">
                    Cancel
                  </button>
                </template>

                <!-- ASSIGN -->
                <template v-else-if="currentView === 'assign'">
                  <button
                    @click="backToList"
                    class="px-4 sm:px-6 py-2 rounded-lg border border-red-300 text-white bg-red-700 hover:bg-red-800 transition font-semibold">
                    Cancel
                  </button>
                  <button
                    @click="saveAssignment"
                    :disabled="selectedRoles.length === 0"
                    class="px-4 sm:px-6 py-2 rounded-lg bg-[#235AA6] text-white font-semibold hover:bg-[#1f4f93] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition">
                    Confirm Assignment
                  </button>
                </template>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { X } from "lucide-vue-next";

import CvTemplateList from "@/components/admins/CVManagement/CVTemplateBuilder/CvTemplateList.vue";
import CvTemplateEdit from "@/components/admins/CVManagement/CVTemplateBuilder/CvTemplateEdit.vue";
import CvTemplatePreview from "@/components/admins/CVManagement/CVTemplateBuilder/CvTemplatePreview.vue";
import CvTemplateAssign from "@/components/admins/CVManagement/CVTemplateBuilder/CvTemplateAssign.vue";

const props = defineProps({ show: { type: Boolean, default: false } });
const emit = defineEmits(["close", "template-saved"]);

const currentView = ref("list");
const editingTemplate = ref(null);
const previewTemplateData = ref(null);
const assignTemplateData = ref(null);

const debugMode = ref(true);
const templates = ref([]);

// ✅ FIX: you use selectedRoles before, now it exists
const selectedRoles = ref([]);
const assignmentNotes = ref("");

onMounted(() => loadTemplatesFromStorage());

const loadTemplatesFromStorage = () => {
  try {
    const saved = localStorage.getItem("cv-templates");
    templates.value = saved ? JSON.parse(saved) : [];
  } catch {
    templates.value = [];
  }
};

const saveTemplatesToStorage = () => {
  localStorage.setItem("cv-templates", JSON.stringify(templates.value));
};

const isTemplateValid = computed(() => {
  if (!editingTemplate.value) return false;
  const hasName = editingTemplate.value.name?.trim();
  const hasSections = editingTemplate.value.sections?.length > 0;
  const allSectionsValid = editingTemplate.value.sections?.every(
    (s) => s.name?.trim() && s.fields?.length > 0,
  );
  const allFieldsValid = editingTemplate.value.sections?.every((s) =>
    s.fields?.every((f) => f.label?.trim()),
  );
  return hasName && hasSections && allSectionsValid && allFieldsValid;
});

const getModalTitle = () => {
  switch (currentView.value) {
    case "edit":
      return "CV Template Builder";
    case "preview":
      return "Preview Template";
    case "assign":
      return "Assign Template";
    default:
      return "CV Template Builder";
  }
};

const getFieldPlaceholder = (field) =>
  field?.label ? `Enter ${field.label}` : "";

const closeModal = () =>
  currentView.value === "list" ? emit("close") : backToList();

const backToList = () => {
  currentView.value = "list";
  editingTemplate.value = null;
  previewTemplateData.value = null;
  assignTemplateData.value = null;
  selectedRoles.value = [];
  assignmentNotes.value = "";
};

const createNewTemplate = () => {
  editingTemplate.value = { id: null, name: "", description: "", sections: [] };
  currentView.value = "edit";
};

const addSection = () => {
  const s = editingTemplate.value.sections;
  s.push({
    id: `section-${Date.now()}`,
    name: `New Section ${s.length + 1}`,
    fields: [],
  });
};

const removeSection = (index) =>
  editingTemplate.value.sections.splice(index, 1);

const addFieldToSection = (sectionIndex) => {
  editingTemplate.value.sections[sectionIndex].fields.push({
    type: "text",
    label: "",
    required: false,
  });
};

const removeFieldFromSection = (sectionIndex, fieldIndex) => {
  editingTemplate.value.sections[sectionIndex].fields.splice(fieldIndex, 1);
};

const generateUniqueId = () => {
  if (!templates.value.length) return 1;
  return Math.max(...templates.value.map((t) => t.id || 0)) + 1;
};

const saveTemplate = async () => {
  if (!editingTemplate.value.id) {
    const newTemplate = { ...editingTemplate.value, id: generateUniqueId() };
    templates.value = [...templates.value, newTemplate];
    saveTemplatesToStorage();
    emit("template-saved", newTemplate);
  } else {
    const idx = templates.value.findIndex(
      (t) => t.id === editingTemplate.value.id,
    );
    if (idx !== -1) {
      const next = [...templates.value];
      next[idx] = { ...editingTemplate.value };
      templates.value = next;
      saveTemplatesToStorage();
      emit("template-saved", next[idx]);
    }
  }
  await nextTick();
  backToList();
};

const editTemplate = (template) => {
  editingTemplate.value = JSON.parse(JSON.stringify(template));
  currentView.value = "edit";
};

const previewTemplate = (template) => {
  previewTemplateData.value = template;
  currentView.value = "preview";
};

const assignTemplate = (template) => {
  assignTemplateData.value = template;
  selectedRoles.value = [];
  assignmentNotes.value = "";
  currentView.value = "assign";
};

const saveAssignment = () => {
  const rolesToAssign = ["Admin", ...selectedRoles.value];
  const idx = templates.value.findIndex(
    (t) => t.id === assignTemplateData.value.id,
  );
  if (idx !== -1) {
    templates.value[idx].assignedTo = rolesToAssign;
    saveTemplatesToStorage();
  }
  alert(
    `Template "${assignTemplateData.value.name}" assigned to ${rolesToAssign.join(", ")}`,
  );
  backToList();
};

const deleteTemplate = (template) => {
  if (!confirm(`Delete template "${template.name}"?`)) return;
  templates.value = templates.value.filter((t) => t.id !== template.id);
  saveTemplatesToStorage();
};

const createDefaultTemplate = () => {
  if (!editingTemplate.value) return;

  editingTemplate.value.name =
    editingTemplate.value.name?.trim() || "Professional CV Template";
  editingTemplate.value.description =
    editingTemplate.value.description?.trim() || "A clean default CV layout.";

  editingTemplate.value.sections = [
    {
      id: `section-${Date.now()}-profile`,
      name: "Profile",
      fields: [
        { type: "textarea", label: "Summary", required: true },
        { type: "text", label: "Address", required: false },
      ],
    },
    {
      id: `section-${Date.now()}-education`,
      name: "Education",
      fields: [
        { type: "text", label: "School / University", required: true },
        { type: "text", label: "Degree", required: true },
        { type: "text", label: "Years", required: false },
      ],
    },
    {
      id: `section-${Date.now()}-experience`,
      name: "Experience",
      fields: [
        { type: "text", label: "Company", required: true },
        { type: "text", label: "Role", required: true },
        { type: "textarea", label: "Responsibilities", required: false },
      ],
    },
    {
      id: `section-${Date.now()}-skills`,
      name: "Skills",
      fields: [{ type: "textarea", label: "Skills", required: true }],
    },
  ];
};

watch(
  () => props.show,
  (v) => {
    document.body.style.overflow = v ? "hidden" : "";
    if (v) currentView.value = "list";
  },
);

const onKeyDown = (e) => {
  if (e.key === "Escape" && props.show) closeModal();
};

onMounted(() => window.addEventListener("keydown", onKeyDown));
onUnmounted(() => window.removeEventListener("keydown", onKeyDown));
</script>

<style scoped>
/* Modal fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* View slide */
.view-slide-enter-active,
.view-slide-leave-active {
  transition: all 0.18s ease;
}
.view-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.view-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* nicer scrollbar */
main::-webkit-scrollbar {
  width: 8px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 999px;
}
main::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
