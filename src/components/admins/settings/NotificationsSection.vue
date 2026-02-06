<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b bg-white">
      <div class="flex items-start gap-3">
        <div
          class="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Bell class="h-5 w-5 text-[#235AA6]" />
        </div>

        <div class="min-w-0">
          <h3
            :class="[
              'text-sm sm:text-base font-bold text-gray-900',
              khmerClass,
            ]">
            {{ safeT("notifications", "Notifications") }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
            {{ safeT("notifications_desc", "Control how you receive alerts") }}
          </p>
        </div>
      </div>
    </div>

    <div class="p-4 sm:p-6 space-y-5">
      <!-- Channels -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingToggle
          :title="safeT('in_app_notifications', 'In-app notifications')"
          :desc="
            safeT(
              'in_app_notifications_desc',
              'Show notifications inside the system',
            )
          "
          :icon="Monitor"
          :model-value="modelValue.inApp"
          @update:model-value="(v) => update('inApp', v)" />

        <SettingToggle
          :title="safeT('email_notifications', 'Email notifications')"
          :desc="
            safeT('email_notifications_desc', 'Receive notifications via email')
          "
          :icon="Mail"
          :model-value="modelValue.email"
          @update:model-value="(v) => update('email', v)" />
      </div>

      <!-- Types -->
      <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-900">
              {{ safeT("notification_types", "Notification types") }}
            </p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{
                safeT(
                  "notification_types_desc",
                  "Choose what you want to be notified about",
                )
              }}
            </p>
          </div>

          <span
            class="hidden sm:inline-flex text-[11px] font-bold px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700">
            {{ enabledCount }} {{ enabledCount === 1 ? "enabled" : "enabled" }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <SettingToggle
            :title="safeT('leave_requests', 'Leave requests')"
            :desc="
              safeT('leave_requests_desc', 'Requests, approvals, and updates')
            "
            :icon="Calendar"
            :model-value="modelValue.leaveRequests"
            @update:model-value="(v) => update('leaveRequests', v)" />

          <SettingToggle
            :title="safeT('external_exam', 'External exam enrollment')"
            :desc="
              safeT(
                'external_exam_desc',
                'Enrollment confirmations and changes',
              )
            "
            :icon="GraduationCap"
            :model-value="modelValue.externalExam"
            @update:model-value="(v) => update('externalExam', v)" />

          <SettingToggle
            :title="safeT('feedback_messages', 'Feedback messages')"
            :desc="safeT('feedback_messages_desc', 'New replies and mentions')"
            :icon="MessageSquare"
            :model-value="modelValue.feedback"
            @update:model-value="(v) => update('feedback', v)" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, defineComponent, h } from "vue";
import {
  Bell,
  Monitor,
  Mail,
  Calendar,
  GraduationCap,
  MessageSquare,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";

const { t, te } = useI18n();

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      inApp: false,
      email: false,
      leaveRequests: false,
      externalExam: false,
      feedback: false,
    }),
  },
  khmerClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

function update(key, value) {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

/** ✅ No missing-key warning */
function safeT(key, fallback) {
  return te(key) ? t(key) : fallback;
}

const enabledCount = computed(() => {
  const v = props.modelValue;
  return [v.leaveRequests, v.externalExam, v.feedback].filter(Boolean).length;
});

/** Toggle card component */
const SettingToggle = defineComponent({
  name: "SettingToggle",
  props: {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    icon: { type: Function, required: true },
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  setup(p, { emit }) {
    const onToggle = () => emit("update:modelValue", !p.modelValue);

    return () =>
      h(
        "div",
        {
          class:
            "group rounded-2xl border border-gray-200 bg-white px-4 py-3 sm:px-5 sm:py-4 " +
            "hover:shadow-sm transition flex items-center justify-between gap-4",
        },
        [
          h("div", { class: "flex items-start gap-3 min-w-0" }, [
            h(
              "div",
              {
                class:
                  "h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 " +
                  (p.modelValue
                    ? "bg-blue-50 border-blue-100"
                    : "bg-gray-50 border-gray-200"),
              },
              [
                h(p.icon, {
                  class: p.modelValue
                    ? "h-5 w-5 text-[#235AA6]"
                    : "h-5 w-5 text-gray-600",
                }),
              ],
            ),
            h("div", { class: "min-w-0" }, [
              h(
                "p",
                { class: "text-sm font-extrabold text-gray-900 truncate" },
                p.title,
              ),
              h(
                "p",
                { class: "text-xs text-gray-500 mt-0.5 line-clamp-2" },
                p.desc,
              ),
            ]),
          ]),

          h(
            "button",
            {
              type: "button",
              role: "switch",
              "aria-checked": p.modelValue,
              onClick: onToggle,
              class: "switch " + (p.modelValue ? "switch--on" : "switch--off"),
            },
            [
              h("span", {
                class:
                  "switch-dot " +
                  (p.modelValue ? "switch-dot--on" : "switch-dot--off"),
              }),
            ],
          ),
        ],
      );
  },
});
</script>


<style scoped>
/* Switch */
.switch {
  position: relative;
  width: 46px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(229, 231, 235, 1);
  transition:
    background 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
  outline: none;
  flex-shrink: 0;
}
.switch--off {
  background: #fff;
}
.switch--on {
  background: rgba(35, 90, 166, 1);
  border-color: rgba(35, 90, 166, 1);
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.18);
}
.switch:focus-visible {
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.18);
  border-color: rgba(35, 90, 166, 1);
}

.switch-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 999px;
  transition:
    left 140ms ease,
    background 120ms ease,
    border-color 120ms ease;
  border: 1px solid rgba(229, 231, 235, 1);
  background: #fff;
}
.switch-dot--off {
  left: 3px;
}
.switch-dot--on {
  left: 21px;
  border-color: rgba(255, 255, 255, 0.35);
}
</style>
