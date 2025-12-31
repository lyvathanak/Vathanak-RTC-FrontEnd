<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Floating circular button -->
    <div class="relative">
      <!-- Language button -->
      <button
        type="button"
        @click="toggle"
        class="bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      >
        <img
          :src="current.flag"
          :alt="current.label"
          class="w-8 h-8 rounded-full object-cover"
        />
      </button>

      <!-- Dropdown menu -->
      <transition name="slide-up">
        <div
          v-if="open"
          class="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl overflow-hidden min-w-[140px]"
        >
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="select(lang)"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors duration-150',
              current.code === lang.code ? 'bg-blue-50' : ''
            ]"
          >
            <img
              :src="lang.flag"
              :alt="lang.label"
              class="w-6 h-6 rounded-full object-cover"
            />
            <span :class="['text-sm font-medium', lang.code === 'kh' ? 'khmer-text' : '']">
              {{ lang.label }}
            </span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

// import flag assets
import khFlag from '@/assets/Flag/CambodiaFlag.png'
import usFlag from '@/assets/Flag/UsFlag.png'
import frFlag from '@/assets/Flag/FrenchFlag.png'

const { locale } = useI18n()
const router = useRouter()
const route = useRoute()

const languages = [
  { code: 'kh', label: 'ខ្មែរ', flag: khFlag },
  { code: 'en', label: 'English', flag: usFlag },
  { code: 'fr', label: 'Français', flag: frFlag }
]

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function select(lang) {
  locale.value = lang.code
  open.value = false

  // Navigate to the new language route
  const currentPath = route.path
  
  let currentPage = 'login'
  
  if (currentPath.includes('/login')) {
    currentPage = 'login'
  } else if (currentPath.includes('/forgot-password')) {
    currentPage = 'forgot-password'
  } else if (currentPath.includes('/otp')) {
    currentPage = 'otp'
  } else if (currentPath.includes('/confirm-password')) {
    currentPage = 'confirm-password'
  } else if (currentPath.includes('/admin/dashboard')) {
    currentPage = 'admin/dashboard'
  } else if (currentPath.includes('/hod/dashboard')) {
    currentPage = 'hod/dashboard'
  } else if (currentPath.includes('/teacher/dashboard')) {
    currentPage = 'teacher/dashboard'
  } else if (currentPath.includes('/student/dashboard')) {
    currentPage = 'student/dashboard'
  } else if (currentPath.includes('/dashboard')) {
    currentPage = 'dashboard'
  }
  
  const newPath = `/${lang.code}/${currentPage}`
  router.push(newPath).catch(err => {
    console.error('Navigation error:', err)
  })
}

function handleClickOutside(event) {
  if (!open.value) return
  
  const dropdown = event.target.closest('.fixed')
  if (!dropdown) {
    open.value = false
  }
}

onMounted(() => {
  open.value = false
  
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 100)
  
  const pathParts = route.path.split('/')
  const routeLang = pathParts[1]
  
  if (routeLang && ['en', 'fr', 'kh'].includes(routeLang) && routeLang !== locale.value) {
    locale.value = routeLang
  }
})

watch(() => route.path, (newPath) => {
  const pathParts = newPath.split('/')
  const routeLang = pathParts[1]
  
  if (routeLang && ['en', 'fr', 'kh'].includes(routeLang) && routeLang !== locale.value) {
    locale.value = routeLang
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const current = computed(() => {
  const pathParts = route.path.split('/')
  const currentLang = pathParts[1] || locale.value
  
  const found = languages.find((l) => l.code === currentLang)
  return found || languages[1]
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
