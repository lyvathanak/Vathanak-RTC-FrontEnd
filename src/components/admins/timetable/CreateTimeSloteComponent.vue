<template>
      <!-- Slot Editor Dialog -->
    <div v-if="showEditor" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @keydown.esc="cancelEditor">
      <div class="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xl space-y-4">
        <div class="text-xl font-semibold">{{ isEditing ? 'Edit time slot' : 'New time slot' }}</div>

        <div class="text-sm text-gray-600">On <b>{{ draftDayLabel }}</b></div>

        <div class="grid md:grid-cols-2 gap-3">
          <!-- 🔹 Day-of-week (create only) -->
          <div v-if="!isEditing" class="md:col-span-2">
            <label class="block text-sm mb-1">Day of week</label>
            <div class="relative">
              <select
                v-model.number="editorWeekday"
                class="border rounded px-3 py-2 w-full appearance-none pr-10"
                @change="moveDraftToWeekday(editorWeekday)"
              >
                <option v-for="(lbl, idx) in weekdayLabels" :key="idx" :value="idx">{{ lbl }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1">Start</label>
            <input v-model="draftStart" type="time" class="border rounded px-3 py-2 w-full" step="300" />
          </div>
          <div>
            <label class="block text-sm mb-1">End</label>
            <input v-model="draftEnd" type="time" class="border rounded px-3 py-2 w-full" step="300" />
          </div>

          <div>
            <label class="block text-sm mb-1">Teacher</label>
            <div class="relative">
              <select v-model.number="draftTeacherId" class="border rounded px-3 py-2 w-full appearance-none pr-10">
                <option value="">—</option>
                <option v-for="t in staffOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm mb-1">Room <span class="text-red-600">*</span></label>
            <div class="relative">
              <select v-model.number="draftRoomId" class="border rounded px-3 py-2 w-full appearance-none pr-10">
                <option value="">(pick a room)</option>
                <option v-for="r in roomOptions" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm mb-1">Title</label>
            <input v-model="draftRemark" class="border rounded px-3 py-2 w-full" placeholder="Remark / Subject" />
          </div>
        </div>

        <div v-if="formError" class="text-sm text-red-600">{{ formError }}</div>

        <div class="flex justify-between items-center gap-2">
          <button
            v-if="isEditing"
            class="px-3 py-2 rounded border text-red-600"
            @click="onEventDelete({ id: editingSlotId })"
          >
            Delete
          </button>
          <div class="grow"></div>
          <button class="px-3 py-2 rounded border" @click="cancelEditor">Cancel</button>
          <button class="px-3 py-2 rounded bg-blue-600 text-white" @click="saveEditor">
            {{ isEditing ? 'Save changes' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
    </template>
<script setup>
</script>
