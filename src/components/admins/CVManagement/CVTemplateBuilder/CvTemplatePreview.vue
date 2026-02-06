<template>
  <div class="space-y-6">
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ring-1 ring-black/5">
      <!-- Header -->
      <div
        class="relative border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50">
        <div
          class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 ring-1 ring-blue-200">
                <Eye class="h-5 w-5 text-blue-700" />
              </div>
              <div class="min-w-0">
                <h3
                  class="truncate text-base sm:text-lg font-extrabold text-gray-900">
                  Preview:
                  <span class="text-blue-800">{{
                    template?.name || "Untitled"
                  }}</span>
                </h3>
                <p class="mt-1 line-clamp-2 text-sm text-gray-600">
                  {{ template?.description || "No description provided." }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              <Sparkles class="h-4 w-4" />
              Live Preview
            </span>

            <span
              v-if="template?.sections?.length"
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              <Layers class="h-4 w-4 text-gray-600" />
              {{ template.sections.length }} Sections
            </span>
          </div>
        </div>
      </div>

      <!-- CV Content -->
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="mx-auto max-w-5xl">
          <div
            class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <!-- Top Header -->
            <div
              class="flex flex-col gap-6 border-b border-gray-200 p-5 sm:p-7 lg:flex-row lg:items-start lg:gap-10">
              <!-- Photo -->
              <div
                class="group relative w-full max-w-[170px] overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                <div class="aspect-[3/4] w-full grid place-items-center">
                  <div class="text-center px-4">
                    <div
                      class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 ring-1 ring-black/5">
                      <User class="h-6 w-6 text-gray-600" />
                    </div>
                    <p
                      class="text-xs font-semibold tracking-wide text-gray-700">
                      PROFILE PHOTO
                    </p>
                    <p class="mt-1 text-[11px] text-gray-500">4x6 Size</p>
                  </div>
                </div>
                <div
                  class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 border-t border-gray-200 bg-white/80 px-3 py-2 text-[11px] text-gray-600">
                  <Upload class="h-3.5 w-3.5" />
                  Upload later
                </div>
              </div>

              <!-- Name / Title / Contact -->
              <div class="min-w-0 flex-1">
                <h1
                  class="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 uppercase">
                  JULIANA SILVA
                </h1>

                <div
                  class="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 ring-1 ring-blue-100">
                  <Briefcase class="h-4 w-4 text-blue-700" />
                  <h2 class="text-lg sm:text-xl font-bold text-blue-900">
                    Art Director
                  </h2>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ContactItem label="PHONE" value="+855 12 345 678">
                    <Phone class="h-4 w-4 text-blue-700" />
                  </ContactItem>
                  <ContactItem label="EMAIL" value="juliana.silva@email.com">
                    <Mail class="h-4 w-4 text-blue-700" />
                  </ContactItem>
                  <ContactItem label="ADDRESS" value="Phnom Penh, Cambodia">
                    <MapPin class="h-4 w-4 text-blue-700" />
                  </ContactItem>
                  <ContactItem
                    label="LINKEDIN"
                    value="linkedin.com/in/julianasilva">
                    <Linkedin class="h-4 w-4 text-blue-700" />
                  </ContactItem>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div
              class="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-5 lg:gap-10">
              <!-- Left -->
              <div class="lg:col-span-2 space-y-7">
                <SectionTitle title="Education">
                  <template #icon>
                    <GraduationCap class="h-4 w-4 text-gray-700" />
                  </template>
                </SectionTitle>

                <div
                  class="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="text-base font-extrabold text-gray-900">
                        Master of Arts
                      </p>
                      <p class="text-sm font-semibold text-gray-700">
                        Graphic Design
                      </p>
                      <p class="mt-1 text-sm text-gray-600">
                        Royal University of Phnom Penh
                      </p>
                    </div>
                    <span
                      class="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-200">
                      <Calendar class="h-3.5 w-3.5" /> 2020
                    </span>
                  </div>
                </div>

                <SectionTitle title="Skills">
                  <template #icon>
                    <Sparkles class="h-4 w-4 text-gray-700" />
                  </template>
                </SectionTitle>
                <div class="space-y-3">
                  <SkillRow label="Graphic Design" :level="4" />
                  <SkillRow label="Team Management" :level="5" />
                </div>

                <SectionTitle title="Languages">
                  <template #icon>
                    <Languages class="h-4 w-4 text-gray-700" />
                  </template>
                </SectionTitle>
                <div class="space-y-2">
                  <Pill label="Khmer" value="Native" />
                  <Pill label="English" value="Fluent" />
                </div>
              </div>

              <!-- Right -->
              <div class="lg:col-span-3 space-y-7">
                <SectionTitle title="About Me">
                  <template #icon>
                    <UserRound class="h-4 w-4 text-gray-700" />
                  </template>
                </SectionTitle>
                <div class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p class="text-sm leading-relaxed text-gray-700">
                    Creative and results-driven Art Director with over 8 years
                    of experience in digital design and brand strategy...
                  </p>
                </div>

                <SectionTitle title="Work Experience">
                  <template #icon>
                    <BriefcaseBusiness class="h-4 w-4 text-gray-700" />
                  </template>
                </SectionTitle>

                <div class="rounded-2xl border border-gray-200 bg-white p-5">
                  <div
                    class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0">
                      <h4 class="text-lg font-extrabold text-gray-900">
                        Digital Marketing Manager
                      </h4>
                      <p class="mt-1 text-sm font-semibold text-gray-600">
                        Creative Solutions Inc.
                        <span class="text-gray-400">•</span> Phnom Penh,
                        Cambodia
                      </p>
                    </div>

                    <span
                      class="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-extrabold text-white">
                      <Clock class="h-4 w-4" />
                      Jan 2022 – Present
                    </span>
                  </div>

                  <div class="mt-4 border-t border-gray-100 pt-4">
                    <ul class="space-y-2 text-sm text-gray-700">
                      <li class="flex gap-2">
                        <CheckCircle2 class="mt-0.5 h-4 w-4 text-blue-700" />
                        <span
                          >Lead a team of 12 designers and content
                          creators</span
                        >
                      </li>
                      <li class="flex gap-2">
                        <CheckCircle2 class="mt-0.5 h-4 w-4 text-blue-700" />
                        <span
                          >Increased brand engagement by 45% through innovative
                          campaigns</span
                        >
                      </li>
                      <li class="flex gap-2">
                        <CheckCircle2 class="mt-0.5 h-4 w-4 text-blue-700" />
                        <span
                          >Managed $500K annual marketing budget with 25%
                          ROI</span
                        >
                      </li>
                      <li class="flex gap-2">
                        <CheckCircle2 class="mt-0.5 h-4 w-4 text-blue-700" />
                        <span
                          >Developed award-winning brand identity for 5 major
                          clients</span
                        >
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fields Preview -->
          <div
            class="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div
              class="flex items-center justify-between gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div class="flex items-center gap-2">
                <ListChecks class="h-5 w-5 text-gray-700" />
                <h3 class="text-sm sm:text-base font-extrabold text-gray-900">
                  Template Fields Preview
                </h3>
              </div>
              <span class="text-xs font-semibold text-gray-600">Read-only</span>
            </div>

            <div class="p-4 sm:p-5">
              <div class="space-y-4">
                <div
                  v-for="section in template?.sections || []"
                  :key="section.id ?? section.name"
                  class="overflow-hidden rounded-2xl border border-gray-200">
                  <div
                    class="flex items-center justify-between gap-3 bg-white px-4 py-3">
                    <div class="flex items-center gap-2">
                      <Folder class="h-4 w-4 text-gray-600" />
                      <h4 class="text-sm font-extrabold text-gray-900">
                        {{ section.name }}
                      </h4>
                    </div>
                    <span class="text-xs font-semibold text-gray-600">
                      {{ section.fields?.length || 0 }} fields
                    </span>
                  </div>

                  <div class="border-t border-gray-100 bg-gray-50/60 p-4">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div
                        v-for="field in section.fields"
                        :key="field.label"
                        class="space-y-1.5">
                        <label
                          class="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <span>{{ field.label }}</span>
                          <span
                            v-if="field.required"
                            class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                            Required
                          </span>
                        </label>

                        <div class="relative">
                          <component
                            :is="fieldIcon(field.type)"
                            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                          <input
                            :type="field.type === 'file' ? 'text' : field.type"
                            :placeholder="getFieldPlaceholder(field)"
                            class="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="!template?.sections?.length"
                  class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <div
                    class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-black/5">
                    <Info class="h-6 w-6 text-gray-600" />
                  </div>
                  <p class="mt-3 text-sm font-semibold text-gray-800">
                    No sections found for this template.
                  </p>
                  <p class="mt-1 text-xs text-gray-600">
                    Add sections and fields in “Manage Templates” to see them
                    here.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, h } from "vue";
import {
  Eye,
  Sparkles,
  Layers,
  User,
  Upload,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  GraduationCap,
  Calendar,
  Languages,
  UserRound,
  Briefcase,
  BriefcaseBusiness,
  Clock,
  CheckCircle2,
  ListChecks,
  Folder,
  Info,
  Type,
  Hash,
  CalendarDays,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-vue-next";

const props = defineProps({
  template: { type: Object, default: null },
  getFieldPlaceholder: { type: Function, required: true },
});

/** field icon */
const fieldIcon = (type) => {
  switch (type) {
    case "email":
      return Mail;
    case "number":
      return Hash;
    case "date":
      return CalendarDays;
    case "url":
      return LinkIcon;
    case "file":
      return ImageIcon;
    case "text":
    case "textarea":
    default:
      return Type;
  }
};

/**
 * ✅ runtime-safe local components (no template strings)
 */
const ContactItem = defineComponent({
  name: "ContactItem",
  props: { label: String, value: String },
  setup(p, { slots }) {
    return () =>
      h(
        "div",
        {
          class:
            "flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm",
        },
        [
          h(
            "div",
            {
              class:
                "flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 ring-1 ring-blue-200",
            },
            slots.default?.(),
          ),
          h("div", { class: "min-w-0" }, [
            h(
              "p",
              {
                class: "text-[11px] font-extrabold tracking-wide text-gray-500",
              },
              p.label,
            ),
            h(
              "p",
              { class: "truncate text-sm font-semibold text-gray-800" },
              p.value,
            ),
          ]),
        ],
      );
  },
});

const SectionTitle = defineComponent({
  name: "SectionTitle",
  props: { title: String },
  setup(p, { slots }) {
    return () =>
      h("div", { class: "flex items-center gap-2" }, [
        h(
          "div",
          {
            class:
              "flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-gray-200",
          },
          slots.icon?.(),
        ),
        h(
          "h3",
          {
            class:
              "text-base font-extrabold text-gray-900 uppercase tracking-wider",
          },
          p.title,
        ),
        h("div", { class: "h-px flex-1 bg-gray-200" }),
      ]);
  },
});

const SkillRow = defineComponent({
  name: "SkillRow",
  props: { label: String, level: { type: Number, default: 0 } },
  setup(p) {
    return () =>
      h(
        "div",
        {
          class:
            "flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm",
        },
        [
          h("span", { class: "text-sm font-semibold text-gray-800" }, p.label),
          h(
            "div",
            { class: "flex items-center gap-1.5" },
            Array.from({ length: 5 }, (_, i) =>
              h("span", {
                key: i,
                class: `h-2.5 w-2.5 rounded-full ${i + 1 <= p.level ? "bg-blue-600" : "bg-gray-200"}`,
              }),
            ),
          ),
        ],
      );
  },
});

const Pill = defineComponent({
  name: "Pill",
  props: { label: String, value: String },
  setup(p) {
    return () =>
      h(
        "div",
        {
          class:
            "flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm",
        },
        [
          h("span", { class: "text-sm font-semibold text-gray-800" }, p.label),
          h(
            "span",
            {
              class:
                "inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800 ring-1 ring-blue-200",
            },
            p.value,
          ),
        ],
      );
  },
});
</script>
