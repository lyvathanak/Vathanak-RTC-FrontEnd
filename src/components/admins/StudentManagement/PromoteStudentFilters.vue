<template>
  <div :class="['', locale === 'kh' ? 'khmer-text' : '']">
    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="text-base font-semibold text-gray-800">
          {{ title }}
        </h2>
        <p class="text-sm text-gray-500">
          {{ subtitle }}
        </p>
      </div>

      <!-- Filters Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <!-- Name -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.userName"
            @input="update('userName', $event.target.value)"
            type="text"
            :placeholder="placeholders.userName"
            class="filter-input pl-9" />
        </div>

        <!-- Program -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.program"
            @input="update('program', $event.target.value)"
            type="text"
            :placeholder="placeholders.program"
            class="filter-input" />
        </div>

        <!-- Academic Year -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.academicYear"
            @input="update('academicYear', $event.target.value)"
            type="text"
            :placeholder="placeholders.academicYear"
            class="filter-input" />
        </div>

        <!-- Generation -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.generation"
            @input="update('generation', $event.target.value)"
            type="text"
            :placeholder="placeholders.generation"
            class="filter-input" />
        </div>

        <!-- Year -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.year"
            @input="update('year', $event.target.value)"
            type="text"
            :placeholder="placeholders.year"
            class="filter-input" />
        </div>

        <!-- Department -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.department"
            @input="update('department', $event.target.value)"
            type="text"
            :placeholder="placeholders.department"
            class="filter-input" />
        </div>

        <!-- Group -->
        <div class="relative">
          <Search
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="modelValue.group"
            @input="update('group', $event.target.value)"
            type="text"
            :placeholder="placeholders.group"
            class="filter-input" />
        </div>
      </div>

      <!-- Actions -->
      <div
        class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
        <button
          type="button"
          class="h-10 w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition"
          @click="onReset">
          {{ resetText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  locale: {
    type: String,
    default: "en",
  },
  title: {
    type: String,
    default: "Student Filters",
  },
  subtitle: {
    type: String,
    default: "Filter students by name, program, year, and more",
  },
  resetText: {
    type: String,
    default: "Clear Filters",
  },
  placeholders: {
    type: Object,
    default: () => ({
      userName: "Student name",
      program: "Program",
      academicYear: "Academic year",
      generation: "Generation",
      year: "Year",
      department: "Department",
      group: "Group",
    }),
  },
});

const emit = defineEmits(["update:modelValue", "reset"]);

const update = (key, value) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};

const onReset = () => {
  emit("update:modelValue", {
    userName: "",
    program: "",
    academicYear: "",
    generation: "",
    year: "",
    department: "",
    group: "",
  });
  emit("reset");
};
</script>

<style scoped>
.khmer-text {
  font-size: 14px;
}
.filter-input {
  width: 100%;
  min-height: 40px;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}
.filter-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
</style>
