<template>
  <section
    class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 border-b bg-white">
      <div class="flex items-start gap-3">
        <div
          class="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Shield class="h-5 w-5 text-[#235AA6]" />
        </div>

        <div class="min-w-0">
          <h3
            :class="[
              'text-sm sm:text-base font-bold text-gray-900',
              khmerClass,
            ]">
            {{ safeT("security", "Security") }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mt-0.5">
            {{
              safeT(
                "security_desc",
                "Change your password and security settings",
              )
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="p-4 sm:p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Current -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ safeT("current_password", "Current password") }}
          </label>

          <div class="relative">
            <input
              :value="modelValue.currentPassword"
              @input="onPassword('currentPassword', $event)"
              :type="showCurrent ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="input-base pr-11"
              :class="[
                fieldErrors.current_password
                  ? 'ring-1 ring-red-200 border-red-200'
                  : '',
              ]" />

            <button
              type="button"
              class="icon-btn"
              @click="showCurrent = !showCurrent">
              <component :is="showCurrent ? EyeOff : Eye" class="h-4 w-4" />
            </button>
          </div>

          <p
            v-if="fieldErrors.current_password"
            class="text-xs font-semibold text-red-600 mt-1">
            {{ fieldErrors.current_password?.[0] }}
          </p>
        </div>

        <!-- New -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-700">
            {{ safeT("new_password", "New password") }}
          </label>

          <div class="relative">
            <input
              :value="modelValue.newPassword"
              @input="onPassword('newPassword', $event)"
              :type="showNew ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Create a strong password"
              class="input-base pr-11"
              :class="[
                fieldErrors.new_password
                  ? 'ring-1 ring-red-200 border-red-200'
                  : '',
                modelValue.newPassword && !isStrong && !fieldErrors.new_password
                  ? 'ring-1 ring-amber-200 border-amber-200'
                  : '',
                modelValue.newPassword && isStrong && !fieldErrors.new_password
                  ? 'ring-1 ring-emerald-200 border-emerald-200'
                  : '',
              ]" />

            <button type="button" class="icon-btn" @click="showNew = !showNew">
              <component :is="showNew ? EyeOff : Eye" class="h-4 w-4" />
            </button>
          </div>

          <p
            v-if="fieldErrors.new_password"
            class="text-xs font-semibold text-red-600 mt-1">
            {{ fieldErrors.new_password?.[0] }}
          </p>

          <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <div class="flex items-center justify-between gap-3">
              <p class="text-[11px] font-semibold text-gray-700">
                {{ safeT("password_rules", "Password rules") }}
              </p>

              <span
                v-if="modelValue.newPassword"
                :class="[
                  'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  isStrong
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200',
                ]">
                {{
                  isStrong ? safeT("strong", "Strong") : safeT("weak", "Weak")
                }}
              </span>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2">
              <RuleItem :ok="rules.len">{{
                safeT("rule_len", "8+ characters")
              }}</RuleItem>
              <RuleItem :ok="rules.upper">{{
                safeT("rule_upper", "Uppercase")
              }}</RuleItem>
              <RuleItem :ok="rules.lower">{{
                safeT("rule_lower", "Lowercase")
              }}</RuleItem>
              <RuleItem :ok="rules.number">{{
                safeT("rule_number", "Number")
              }}</RuleItem>
            </div>
          </div>
        </div>

        <!-- Confirm -->
        <div class="space-y-1.5 md:col-span-2">
          <div class="flex items-center justify-between gap-2">
            <label class="text-xs font-semibold text-gray-700">
              {{ safeT("confirm_password", "Confirm password") }}
            </label>

            <span
              v-if="modelValue.confirmPassword"
              :class="[
                'text-[11px] font-bold px-2 py-0.5 rounded-full border',
                matches
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-red-700 bg-red-50 border-red-200',
              ]">
              {{
                matches
                  ? safeT("match", "Matched")
                  : safeT("not_match", "Not matched")
              }}
            </span>
          </div>

          <div class="relative">
            <input
              :value="modelValue.confirmPassword"
              @input="onPassword('confirmPassword', $event)"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Re-type your new password"
              class="input-base pr-11"
              :class="[
                fieldErrors.new_password_confirmation
                  ? 'ring-1 ring-red-200 border-red-200'
                  : '',
                modelValue.confirmPassword &&
                matches &&
                !fieldErrors.new_password_confirmation
                  ? 'ring-1 ring-emerald-200 border-emerald-200'
                  : '',
                modelValue.confirmPassword &&
                !matches &&
                !fieldErrors.new_password_confirmation
                  ? 'ring-1 ring-red-200 border-red-200'
                  : '',
              ]" />

            <button
              type="button"
              class="icon-btn"
              @click="showConfirm = !showConfirm">
              <component :is="showConfirm ? EyeOff : Eye" class="h-4 w-4" />
            </button>
          </div>

          <p
            v-if="fieldErrors.new_password_confirmation"
            class="text-xs font-semibold text-red-600 mt-1">
            {{ fieldErrors.new_password_confirmation?.[0] }}
          </p>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="passwordError || localError"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
        <div class="flex items-start gap-2">
          <AlertTriangle class="h-4 w-4 text-red-700 mt-0.5" />
          <p class="text-sm font-semibold text-red-700">
            {{ passwordError || localError }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.99] transition disabled:opacity-60"
          :disabled="loading"
          @click="clearForm">
          {{ safeT("cancel", "Cancel") }}
        </button>

        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#235AA6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4c93] active:bg-[#1a407c] transition disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="handleChangePassword">
          <svg
            v-if="loading"
            class="animate-spin h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>

          <span>
            {{
              loading
                ? safeT("changing", "Changing...")
                : safeT("change_password", "Change password")
            }}
          </span>
        </button>
      </div>

      <!-- Logout other devices -->
      <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
        <div
          class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div
                class="h-9 w-9 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
                <LogOut class="h-4 w-4 text-gray-700" />
              </div>
              <p class="text-sm font-bold text-gray-900">
                {{ safeT("logout_other_devices", "Logout other devices") }}
              </p>
            </div>

            <p class="text-xs text-gray-500 mt-1.5">
              {{
                safeT(
                  "logout_other_devices_desc",
                  "Sign out from other devices for better security.",
                )
              }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 active:scale-[0.99] transition focus:outline-none focus:ring-2 focus:ring-[#235AA6]/25"
            @click="emit('logoutOthers')">
            <span class="text-red-600 font-bold">●</span>
            {{ safeT("logout", "Logout") }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, defineComponent, h, watch } from "vue";
import { Eye, EyeOff, Shield, AlertTriangle, LogOut } from "lucide-vue-next";
import { changePassword } from "@/stores/Authentication/ChangePassword";
import { showNotification } from "@/lib/notifications.js";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
  },
  t: { type: Function, required: true },
  khmerClass: { type: String, default: "" },
  passwordError: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "logoutOthers", "changed"]);

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const loading = ref(false);
const localError = ref("");
const fieldErrors = ref({});

function update(key, value) {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}
function onPassword(key, e) {
  update(key, e.target.value);
}

function clearForm() {
  localError.value = "";
  fieldErrors.value = {};
  emit("update:modelValue", {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
}

/** Avoid i18n missing-key warning */
function safeT(key, fallback) {
  const out = props.t(key);
  return out === key ? fallback : out;
}

/** Password rules */
const rules = computed(() => {
  const v = props.modelValue.newPassword || "";
  return {
    len: v.length >= 8,
    upper: /[A-Z]/.test(v),
    lower: /[a-z]/.test(v),
    number: /[0-9]/.test(v),
  };
});
const isStrong = computed(() => {
  const r = rules.value;
  return r.len && r.upper && r.lower && r.number;
});
const matches = computed(() => {
  if (!props.modelValue.confirmPassword) return false;
  return props.modelValue.newPassword === props.modelValue.confirmPassword;
});

// Clear errors while typing
watch(
  () => props.modelValue,
  () => {
    localError.value = "";
    fieldErrors.value = {};
  },
  { deep: true },
);

const handleChangePassword = async () => {
  localError.value = "";
  fieldErrors.value = {};

  if (!props.modelValue.currentPassword) {
    localError.value = safeT(
      "current_required",
      "Current password is required",
    );
    showNotification(localError.value, "error");
    return;
  }
  if (!props.modelValue.newPassword) {
    localError.value = safeT("new_required", "New password is required");
    showNotification(localError.value, "error");
    return;
  }
  if (!isStrong.value) {
    localError.value = safeT(
      "password_weak",
      "Password is weak. Please follow the rules.",
    );
    showNotification(localError.value, "error");
    return;
  }
  if (!matches.value) {
    localError.value = safeT("not_match", "Passwords do not match");
    showNotification(localError.value, "error");
    return;
  }

  loading.value = true;

  const payload = {
    current_password: props.modelValue.currentPassword,
    new_password: props.modelValue.newPassword,
    new_password_confirmation: props.modelValue.confirmPassword,
  };

  const result = await changePassword(payload);

  loading.value = false;

  if (result.success) {
    showNotification(result.message, "success");
    clearForm();
    emit("changed", result.data);
  } else {
    fieldErrors.value = result.errors || {};
    localError.value =
      result.message || safeT("failed", "Failed to change password");
    showNotification(localError.value, "error");
  }
};

/** RuleItem render function */
const RuleItem = defineComponent({
  name: "RuleItem",
  props: { ok: { type: Boolean, default: false } },
  setup(p, { slots }) {
    return () =>
      h("div", { class: "flex items-center gap-2" }, [
        h(
          "span",
          {
            class: [
              "h-5 w-5 inline-flex items-center justify-center rounded-full border text-[11px] font-black",
              p.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-white border-gray-200 text-gray-400",
            ],
          },
          p.ok ? "✓" : "•",
        ),
        h(
          "span",
          {
            class: [
              "text-[11px] font-semibold",
              p.ok ? "text-gray-800" : "text-gray-500",
            ],
          },
          slots.default ? slots.default() : "",
        ),
      ]);
  },
});
</script>

<style scoped>
.input-base {
  width: 100%;
  height: 44px;
  border-radius: 16px;
  border: 1px solid rgba(229, 231, 235, 1);
  background: #fff;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(17, 24, 39, 1);
  outline: none;
  transition:
    box-shadow 120ms ease,
    border-color 120ms ease,
    background 120ms ease;
}
.input-base::placeholder {
  color: rgba(156, 163, 175, 1);
  font-weight: 600;
}
.input-base:focus {
  border-color: rgba(35, 90, 166, 1);
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.18);
}

.icon-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  height: 34px;
  width: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(107, 114, 128, 1);
  transition:
    background 120ms ease,
    color 120ms ease,
    transform 120ms ease;
}
.icon-btn:hover {
  background: rgba(243, 244, 246, 1);
  color: rgba(55, 65, 81, 1);
}
.icon-btn:active {
  transform: translateY(-50%) scale(0.98);
}
.icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(35, 90, 166, 0.18);
}
</style>
