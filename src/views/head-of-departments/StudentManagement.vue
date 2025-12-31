<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-9xl mx-auto">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 :class="['text-3xl font-bold text-gray-900', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('student_management') || 'Student Management' }}
          </h1>
          <p :class="['text-gray-600 mt-2', locale === 'kh' ? 'khmer-text' : '']">
            {{ t('manage_students_desc') || 'View and manage enrolled students' }}
          </p>
        </div>
        <button @click="router.back()" class="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg shadow hover:bg-gray-50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          {{ t('back') || 'Back' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Students</p>
            <p class="text-3xl font-bold text-purple-600">285</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Active Now</p>
            <p class="text-3xl font-bold text-green-600">240</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">At Risk</p>
            <p class="text-3xl font-bold text-red-600">12</p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 :class="['text-xl font-semibold', locale === 'kh' ? 'khmer-text' : '']">Student List</h2>
          <div class="flex gap-2">
            <input type="text" placeholder="Search ID or Name..." class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              {{ t('add_student') || 'Add Student' }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-gray-500 border-b">
                <th class="py-3 px-4">ID</th>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Year</th>
                <th class="py-3 px-4">Department</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">STU001</td>
                <td class="py-3 px-4 font-medium">Sok Dara</td>
                <td class="py-3 px-4">Year 3</td>
                <td class="py-3 px-4">Computer Science</td>
                <td class="py-3 px-4"><span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span></td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button class="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
              <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">STU002</td>
                <td class="py-3 px-4 font-medium">Chan Thida</td>
                <td class="py-3 px-4">Year 2</td>
                <td class="py-3 px-4">Computer Science</td>
                 <td class="py-3 px-4"><span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Probation</span></td>
                <td class="py-3 px-4">
                  <button class="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                  <button class="text-red-600 hover:text-red-800">Delete</button>
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