<!-- src/views/ForgotPassword.vue -->
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

        <!-- Organization Name -->
        <div class="flex flex-col items-center text-center">
          <h1 class="text-sm font-medium text-[#235AA6] khmer-text-light">
            សាលាមធ្យមសិក្សា​សុខាភិបាល​ភូមិភាគបាត់ដំបង
          </h1>
          <h1 class="text-xs text-[#235AA6] font-medium tracking-wide uppercase">
            BATTAMBANG REGIONAL TRAINING CENTER FOR HEALTH
          </h1>
        </div>
      </div>

      <!-- Title row -->
      <div class="flex items-center gap-2 self-start w-full max-w-md">
        <button
          type="button"
          class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          @click="goBack"
        >
          <ArrowLeft class="w-4 h-4" />
          <span :class="[locale === 'kh' ? 'khmer-text' : '']">{{ t('back_to_login') || 'Back' }}</span>
        </button>
      </div>

      <h3 :class="['text-2xl font-bold text-[#235AA6]', locale === 'kh' ? 'khmer-text' : '']">
        {{ t('forgot_password') || 'Forgot Password' }}
      </h3>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-3 w-full max-w-md">
        <!-- Global error/success -->
        <div
          v-if="message.text"
          class="text-sm text-center p-2 rounded-lg"
          :class="message.type === 'error' ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'"
        >
          {{ message.text }}

          <!-- Telegram linking instructions when not linked -->
          <div
            v-if="message.type === 'error' && message.text.includes('not linked')"
            class="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-xs text-yellow-800 text-left"
          >
            <p class="mb-2">
              Your account is not linked with our Telegram bot yet. Please follow these steps:
            </p>
            <ol class="list-decimal list-inside space-y-1 mb-3">
              <li>Tap the button below to open our Telegram bot.</li>
              <li>Press <strong>Start</strong>.</li>
              <li>Send your phone number: <strong>{{ phone }}</strong>.</li>
            </ol>
            <button
              type="button"
              class="bg-blue-600 text-white font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition"
              @click="openTelegramBot"
            >
              Open Telegram bot
            </button>
          </div>
        </div>

        <!-- Verify by selector -->
        <div class="w-full">
          <label :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('verify_by') || 'Verify by' }}
          </label>
          <div class="relative">
            <select
              v-model="method"
              :disabled="isLoading"
              :class="[
                'mt-1 w-full p-3 border border-gray-300 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 appearance-none pr-10',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
            >
              <option value="email">{{ t('verify_by_email') || 'Email' }}</option>
              <option value="phone">{{ t('verify_by_phone') || 'Phone' }}</option>
            </select>
            <ChevronDown class="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>

        <!-- Email field -->
        <div v-if="method === 'email'" class="w-full">
          <label :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('email_address') || 'Email Address' }}
          </label>
          <div class="relative">
            <input
              type="email"
              v-model.trim="email"
              :placeholder="t('enter_email') || 'Enter your E-mail'"
              :disabled="isLoading"
              :class="[
                'w-full p-4 pr-12 border border-gray-300 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
              
            />
            <Mail class="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <p v-if="fieldError && method==='email'" class="text-xs text-red-600 mt-1">
            {{ fieldError }}
          </p>
        </div>

        <!-- Phone field -->
        <div v-else class="w-full">
          <label :class="['text-sm font-medium', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('phone_number') || 'Phone Number' }}
          </label>
          <div class="relative">
            <input
              type="tel"
              v-model.trim="phone"
              :placeholder="t('enter_phone') || '+855 12 345 678'"
              :disabled="isLoading"
              :class="[
                'w-full p-4 pr-12 border border-gray-300 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 disabled:opacity-50',
                locale === 'kh' ? 'khmer-text' : ''
              ]"
              
              inputmode="tel"
            />
            <Phone class="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <p v-if="fieldError && method==='phone'" class="text-xs text-red-600 mt-1">
            {{ fieldError }}
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading"
          :class="[
            'w-full bg-[#235AA6] text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            locale === 'kh' ? 'khmer-text' : '',
          ]"
        >
          <span v-if="isLoading">{{ t('sending') || 'Sending…' }}</span>
          <span v-else>{{ t('send') || 'Send' }}</span>
        </button>
      </form>
    </div>

    <!-- Floating Language Selector -->
    <FloatChangeLanguage />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowLeft, Mail, Phone, ChevronDown } from 'lucide-vue-next'
import api from '@/stores/apis/axios'
import FloatChangeLanguage from '@/components/language/FloatChangeLanguage.vue'

const router = useRouter()
const { t, locale } = useI18n()

const method = ref('email')
const email = ref('')
const phone = ref('')
const isLoading = ref(false)

const message = ref({ type: null, text: '' })
const fieldError = ref(null)

// 👇 your Telegram bot username
const telegramBotUsername = 'rtcbb_bot'

function goBack() {
  const currentLang = router.currentRoute.value.params.lang || 'en'
  router.push(`/${currentLang}/login`)
}

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function normalizePhone(v) {
  return v.replace(/[ \-]/g, '')
}

function validatePhone(v) {
  const n = normalizePhone(v)
  return /^(\+855\d{8,9}|0\d{8,9})$/.test(n)
}

function openTelegramBot() {
  window.open(`https://t.me/${telegramBotUsername}`, '_blank')
}

async function handleSubmit() {
  message.value = { type: null, text: '' }
  fieldError.value = null

  if (method.value === 'email') {
    if (!validateEmail(email.value)) {
      fieldError.value = t('invalid_email') || 'Please enter a valid email.'
      return
    }
  } else {
    if (!validatePhone(phone.value)) {
      fieldError.value = t('invalid_phone') || 'Please enter a valid phone number.'
      return
    }
  }

  isLoading.value = true
  try {
    if (method.value === 'email') {
      await requestResetByEmail(email.value)
      message.value = {
        type: 'success',
        text:
          t('code_sent_check_inbox') ||
          'We sent a reset link/code to your email. Please check your inbox.'
      }
    } else {
      // 👇 Call Laravel endpoint to send OTP via Telegram
      await requestResetByPhone(normalizePhone(phone.value))
      message.value = {
        type: 'success',
        text:
          t('code_sent_check_telegram') ||
          'We sent a reset code to your Telegram. Please check your Telegram messages.'
      }
    }

    const currentLang = router.currentRoute.value.params.lang || 'en'
    router.push({
      path: `/${currentLang}/otp`,
      query: {
        method: method.value,
        email: email.value,
        phone: phone.value
      }
    })
  } catch (err) {
    message.value = {
      type: 'error',
      text:
        (err && err.message) ||
        t('an_unexpected_error_occurred') ||
        'An unexpected error occurred. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

/** ----- Real API calls now ----- */
async function requestResetByEmail(email) {
  // still placeholder – your existing email reset API can go here
  await new Promise((r) => setTimeout(r, 600))
}

// 🔥 This now calls your Laravel OTP endpoint
async function requestResetByPhone(phone) {
  try {
    const res = await api.post('/auth/request-phone-otp', {
      phone_number: phone
    })
    return res.data
  } catch (error) {
    // Axios stores error response in error.response.data
    const message = error.response?.data?.message || error.message || 'Failed to request OTP by phone.'
    throw new Error(message)
  }
}
/** -------------------------------------------------------------------- */

const currentLocale = computed(() => String(locale.value))
</script>
