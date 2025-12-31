<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('teacher_management') || 'Teacher Management' }}
          </h1>
          <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('manage_teachers_desc') || 'Oversee department faculty and assignments' }}
          </p>
        </div>
        <button @click="router.back()" class="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg shadow hover:bg-gray-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ t('back') || 'Back' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Faculty</p>
            <p class="text-3xl font-bold text-blue-600">12</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
             <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
           <div>
            <p class="text-sm font-medium text-gray-500">Full Time</p>
            <p class="text-3xl font-bold text-indigo-600">8</p>
          </div>
          <div class="p-3 bg-indigo-100 rounded-full">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
         <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
           <div>
            <p class="text-sm font-medium text-gray-500">Part Time</p>
            <p class="text-3xl font-bold text-orange-600">4</p>
          </div>
          <div class="p-3 bg-orange-100 rounded-full">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 :class="['text-xl font-semibold', locale === 'kh' ? 'khmer-text' : '']">Faculty List</h2>
           <div class="flex gap-2">
            <input type="text" placeholder="Search Teacher..." class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {{ t('add_teacher') || 'Add Teacher' }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-gray-500 border-b">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Position</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Classes</th>
                <th class="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">TCH001</td>
                <td class="py-3 px-4 font-medium">Dr. Kim Sopheak</td>
                <td class="py-3 px-4">Professor</td>
                <td class="py-3 px-4"><span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">Full Time</span></td>
                <td class="py-3 px-4">3</td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2">Profile</button>
                  <button class="text-gray-600 hover:text-gray-800">Schedule</button>
                </td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">TCH005</td>
                <td class="py-3 px-4 font-medium">Mr. Long Vith</td>
                <td class="py-3 px-4">Lecturer</td>
                <td class="py-3 px-4"><span class="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Part Time</span></td>
                <td class="py-3 px-4">1</td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2">Profile</button>
                  <button class="text-gray-600 hover:text-gray-800">Schedule</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/Authentication/authStore.js";

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();
</script>