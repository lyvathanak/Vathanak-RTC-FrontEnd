<!-- src/views/ConfirmPassword.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="flex flex-col items-center justify-center bg-[#E3E3E3] rounded-lg shadow-lg gap-5 p-13 w-full max-w-fit">
      <!-- Header with Logo -->
      <div class="flex flex-col items-center gap-5">
        <img
          src="/logo.png"
          alt="Logo"
          width="120"
          height="120"
          class="mx-auto rounded-full mb-4"
        />
        <div class="flex flex-col items-center text-center">
          <h1 class="text-sm font-medium text-[#235AA6] khmer-text-light">
            សាលាមធ្យមសិក្សា​សុខាភិបាល​ភូមិភាគបាត់ដំបង
          </h1>
          <h1 class="text-xs text-[#235AA6] font-medium tracking-wide uppercase">
            BATTAMBANG REGIONAL TRAINING CENTER FOR HEALTH
          </h1>
        </div>
      </div>

      <!-- Back -->
      <div class="flex items-center gap-2 self-start w-full max-w-md">
        <button
          type="button"
          class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4" />
          <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{ t('back') || 'Back' }}</span>
        </button>
      </div>

      <!-- Title -->
      <h3 :class="['text-2xl font-bold text-[#235AA6]', locale === 'kh' ? 'khmer-text' : '']">
        {{ t('new_password') || 'New Password' }}
      </h3>

      <!-- Password Form -->
      <form @submit.prevent="handleSubmit" class="flex flex-col items-center gap-4 w-full max-w-md">
        <!-- New Password -->
        <div class="w-full">
          <label :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('new_password') || 'New Password' }}
          </label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model.trim="newPassword"
              :placeholder="t('enter_new_password') || 'Enter your New Password'"
              :disabled="isSubmitting"
              :class="[
                'w-full p-4 pr-12 border border-gray-300 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="passwordError" class="text-xs text-red-600 mt-1">
            {{ passwordError }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="w-full">
          <label :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('confirm_password') || 'Confirm Password' }}
          </label>
          <div class="relative">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model.trim="confirmPassword"
              :placeholder="t('enter_confirm_password') || 'Enter your Confirm Password'"
              :disabled="isSubmitting"
              :class="[
                'w-full p-4 pr-12 border border-gray-300 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="confirmError" class="text-xs text-red-600 mt-1">
            {{ confirmError }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          :class="[
            'w-full bg-[#235AA6] text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            locale === 'kh' ? 'khmer-text' : ''
          ]"
        >
          <span v-if="isSubmitting">{{ t('confirming') || 'Confirming…' }}</span>
          <span v-else>{{ t('confirm') || 'Confirm' }}</span>
        </button>

        <!-- Message -->
        <div 
          v-if="message.text" 
          :class="message.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'"
          class="w-full text-sm text-center p-2 rounded-lg"
        >
          {{ message.text }}
        </div>
      </form>
    </div>

    <!-- Floating Language Selector -->
    <FloatChangeLanguage />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Eye, EyeOff } from 'lucide-vue-next'
import api from '@/stores/apis/axios'
import FloatChangeLanguage from '@/components/language/FloatChangeLanguage.vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

// Get reset_token from query params
const resetToken = route.query.reset_token || ''
const method = route.query.method || 'phone'

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

const message = ref({ type: null, text: '' })
const passwordError = ref(null)
const confirmError = ref(null)

function goBack() {
  if (router) router.back()
  else window.history.back()
}

function validatePassword(password) {
  if (password.length < 8) {
    return t('password_min_length') || 'Password must be at least 8 characters long.'
  }
//   if (!/[A-Z]/.test(password)) {
//     return t('password_uppercase') || 'Password must contain at least one uppercase letter.'
//   }
//   if (!/[a-z]/.test(password)) {
//     return t('password_lowercase') || 'Password must contain at least one lowercase letter.'
//   }
  if (!/[0-9]/.test(password)) {
    return t('password_number') || 'Password must contain at least one number.'
  }
  return null
}

async function handleSubmit() {
  message.value = { type: null, text: '' }
  passwordError.value = null
  confirmError.value = null

  // Validate new password
  const passwordValidation = validatePassword(newPassword.value)
  if (passwordValidation) {
    passwordError.value = passwordValidation
    return
  }

  // Check if passwords match
  if (newPassword.value !== confirmPassword.value) {
    confirmError.value = t('passwords_do_not_match') || 'Passwords do not match.'
    return
  }

  isSubmitting.value = true
  try {
    if (!resetToken) {
      throw new Error('Reset token not found. Please start over.')
    }
    
    await resetPassword(resetToken, newPassword.value)

    message.value = {
      type: 'success',
      text: t('password_reset_success') || 'Password reset successfully!'
    }

    // Redirect to login after success
    setTimeout(() => {
      const currentLang = router.currentRoute.value.params.lang || 'en'
      router.push(`/${currentLang}/login`)
    }, 2000)
  } catch (err) {
    message.value = {
      type: 'error',
      text: (err && err.message) || t('password_reset_failed') || 'Failed to reset password. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

/* ------- Real API calls ------- */
async function resetPassword(token, password) {
  const res = await api.post('/auth/reset-password', {
    reset_token: token,
    new_password: password,
    new_password_confirmation: password
  })

  return res.data
}
/* ------------------------------------------------- */
</script>