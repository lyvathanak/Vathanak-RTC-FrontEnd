<template>
        <!-- Create time table dialog -->
    <div v-if="showCreateTable" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-5 w-full max-w-xl space-y-4">
        <div class="text-xl font-semibold">Create Time Table</div>
        <div class="grid gap-3">
          <div>
            <label class="block text-sm mb-1">Name</label>
            <input v-model="newTableName" class="border rounded px-3 py-2 w-full" placeholder="Time Table for Group" />
          </div>
          <div>
            <label class="block text-sm mb-1">Description</label>
            <input v-model="newTableDesc" class="border rounded px-3 py-2 w-full" placeholder="Description" />
          </div>
          <div>
            <label class="block text-sm mb-1">Group</label>
            <div class="relative">
              <select v-model.number="filterGroupId" class="border rounded px-3 py-2 w-full appearance-none pr-10">
                <option :value="null">(pick a group)</option>
                <option v-for="g in groupOptions" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown class="w-4 h-4 text-gray-500" />
              </span>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button class="px-3 py-2 rounded border" @click="showCreateTable=false">Cancel</button>
          <button class="px-3 py-2 rounded bg-blue-600 text-white" @click="doCreateTable">Create</button>
        </div>
      </div>
    </div>
</template>
<script setup>
defineProps({
    showCreateTable: Boolean,
    groupOptions: Array,
})

</script>