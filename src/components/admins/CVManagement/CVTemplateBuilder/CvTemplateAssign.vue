<template>
  <div class="space-y-5">
    <!-- Header / Info -->
    <div
      class="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h3 class="text-lg sm:text-xl font-extrabold text-purple-900">
            Assign Template
          </h3>
          <p class="mt-1 text-sm text-purple-700">
            Choose which roles can use this CV template.
            <span class="font-semibold">Admin is always included.</span>
          </p>

          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span
              class="inline-flex items-center rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-semibold text-purple-800">
              Template:
              <span class="ml-1 truncate font-extrabold">
                {{ template?.name || "—" }}
              </span>
            </span>

            <span
              class="inline-flex items-center rounded-full border border-purple-100 bg-purple-100/60 px-3 py-1 text-xs font-semibold text-purple-800">
              Roles selected: {{ selectedRoles.length + 1 }}
            </span>
          </div>
        </div>

        <div
          class="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 ring-1 ring-purple-200">
          <span class="text-purple-800 text-lg">📄</span>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-5 py-4">
        <h4 class="text-sm font-extrabold text-gray-900">Role access</h4>
        <p class="mt-1 text-xs text-gray-500">
          Admin is locked. Toggle additional roles below.
        </p>
      </div>

      <div class="p-5 space-y-5">
        <!-- Admin (locked) -->
        <div
          class="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-blue-200">
              <span class="text-blue-700">✅</span>
            </div>
            <div>
              <div class="text-sm font-extrabold text-blue-900">
                Admin
                <span
                  class="ml-2 align-middle rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  Always
                </span>
              </div>
              <div class="text-xs text-blue-700/80">
                Required access for managing templates.
              </div>
            </div>
          </div>

          <div
            class="text-xs font-semibold text-blue-700 rounded-full bg-white px-3 py-1 ring-1 ring-blue-200">
            Included
          </div>
        </div>

        <!-- Teacher -->
        <RoleOption
          label="Teacher"
          description="Teachers can create and submit CVs using this template."
          :checked="selectedRoles.includes('Teacher')"
          @toggle="toggleRole('Teacher')" />

        <!-- Staff -->
        <RoleOption
          label="Staff"
          description="Staff users can use this template for internal CV records."
          :checked="selectedRoles.includes('Staff')"
          @toggle="toggleRole('Staff')" />

        <!-- Notes -->
        <div>
          <label class="block text-sm font-bold text-gray-800">
            Assignment notes
            <span class="text-gray-400 font-semibold">(optional)</span>
          </label>
          <p class="mt-1 text-xs text-gray-500">
            Visible to admins. Add context like why the template was assigned.
          </p>

          <div class="mt-3">
            <textarea
              :value="assignmentNotes"
              @input="$emit('update:assignmentNotes', $event.target.value)"
              rows="3"
              placeholder="e.g., Assign for 2026 internship intake, Teacher & Staff only…"
              class="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none ring-0 focus:border-purple-300 focus:ring-4 focus:ring-purple-100" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-4">
        <div class="text-xs text-gray-600">
          <span class="font-semibold text-gray-800">Effective roles:</span>
          <span class="ml-2 inline-flex flex-wrap gap-2 align-middle">
            <span
              class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
              Admin
            </span>

            <span
              v-for="r in selectedRoles"
              :key="r"
              class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800">
              {{ r }}
            </span>

            <span
              v-if="selectedRoles.length === 0"
              class="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-700">
              Admin only
            </span>
          </span>
        </div>

        <div class="text-xs text-gray-500">
          Tip: Keep access minimal to avoid template clutter.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, h } from "vue";

const props = defineProps({
  template: { type: Object, default: null },
  selectedRoles: { type: Array, default: () => [] },
  assignmentNotes: { type: String, default: "" },
});

const emit = defineEmits(["update:selectedRoles", "update:assignmentNotes"]);

const toggleRole = (role) => {
  const set = new Set(props.selectedRoles);
  set.has(role) ? set.delete(role) : set.add(role);
  emit("update:selectedRoles", [...set]);
};

/**
 * ✅ No `template:` anywhere -> no runtime compilation warning
 */
const RoleOption = defineComponent({
  name: "RoleOption",
  props: {
    label: { type: String, required: true },
    description: { type: String, default: "" },
    checked: { type: Boolean, default: false },
  },
  emits: ["toggle"],
  setup(p, { emit }) {
    const onClick = () => emit("toggle");

    return () =>
      h(
        "button",
        {
          type: "button",
          onClick,
          class: [
            "w-full text-left flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition",
            "hover:bg-gray-50 active:scale-[0.999]",
            "focus:outline-none focus:ring-4 focus:ring-purple-100",
            p.checked
              ? "border-purple-200 bg-purple-50/40"
              : "border-gray-200 bg-white",
          ].join(" "),
        },
        [
          h("div", { class: "flex items-start gap-3" }, [
            h(
              "div",
              {
                class: [
                  "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ring-1",
                  p.checked
                    ? "bg-white ring-purple-200"
                    : "bg-gray-50 ring-gray-200",
                ].join(" "),
              },
              [
                h(
                  "span",
                  { class: p.checked ? "text-purple-700" : "text-gray-400" },
                  p.checked ? "✓" : "○",
                ),
              ],
            ),

            h("div", {}, [
              h(
                "div",
                {
                  class: [
                    "text-sm font-extrabold",
                    p.checked ? "text-purple-900" : "text-gray-900",
                  ].join(" "),
                },
                p.label,
              ),
              h(
                "div",
                {
                  class: [
                    "mt-0.5 text-xs",
                    p.checked ? "text-purple-700/80" : "text-gray-500",
                  ].join(" "),
                },
                p.description,
              ),
            ]),
          ]),

          h(
            "span",
            {
              class: [
                "rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                p.checked
                  ? "bg-purple-100 text-purple-800 ring-purple-200"
                  : "bg-gray-100 text-gray-700 ring-gray-200",
              ].join(" "),
            },
            p.checked ? "Enabled" : "Disabled",
          ),
        ],
      );
  },
});
</script>
