<template>
  <div class="w-full overflow-x-auto">
    <!-- Use min width so it stays like the screenshot and scrolls on small screens -->
    <div class="min-w-225 grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Total -->
      <div
        class="relative rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md hover:-translate-y-px">
        <div
          class="absolute inset-0 rounded-2xl bg-gray-50 opacity-60 pointer-events-none"></div>

        <div class="relative flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-gray-600">Total</div>
            <div class="mt-2 text-3xl font-extrabold text-gray-900">
              {{ total }}
            </div>
          </div>
          <div
            class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/70">
            <Layers class="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>

      <!-- Pending -->
      <div
        class="relative rounded-2xl border border-yellow-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md hover:-translate-y-px">
        <div
          class="absolute inset-0 rounded-2xl bg-yellow-50 opacity-60 pointer-events-none"></div>

        <div class="relative flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-yellow-700">Pending</div>
            <div class="mt-2 text-3xl font-extrabold text-yellow-700">
              {{ pending }}
            </div>
          </div>
          <div
            class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-yellow-200 bg-white/70">
            <Clock class="h-5 w-5 text-yellow-600" />
          </div>
        </div>
      </div>

      <!-- Approved -->
      <div
        class="relative rounded-2xl border border-green-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md hover:-translate-y-px">
        <div
          class="absolute inset-0 rounded-2xl bg-green-50 opacity-60 pointer-events-none"></div>

        <div class="relative flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-green-700">Approved</div>
            <div class="mt-2 text-3xl font-extrabold text-green-700">
              {{ approved }}
            </div>
          </div>
          <div
            class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-green-200 bg-white/70">
            <CheckCircle2 class="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <!-- Rejected -->
      <div
        class="relative rounded-2xl border border-red-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md hover:-translate-y-px">
        <div
          class="absolute inset-0 rounded-2xl bg-red-50 opacity-60 pointer-events-none"></div>

        <div class="relative flex items-start justify-between gap-3">
          <div>
            <div class="text-sm font-semibold text-red-700">Rejected</div>
            <div class="mt-2 text-3xl font-extrabold text-red-700">
              {{ rejected }}
            </div>
          </div>
          <div
            class="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white/70">
            <XCircle class="h-5 w-5 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Layers, Clock, CheckCircle2, XCircle } from "lucide-vue-next";

defineProps({
  pending: { type: Number, default: 0 },
  approved: { type: Number, default: 0 },
  rejected: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});
</script>
