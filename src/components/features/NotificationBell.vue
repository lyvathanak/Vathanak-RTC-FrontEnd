<template>
  <div ref="notifRef" class="relative">
    <!-- Button -->
    <button
      @click="toggleNotifDropdown"
      @mouseenter="showNotifDropdown"
      @mouseleave="hideNotifDropdown"
      class="relative p-2 text-white hover:bg-white/10 rounded"
      aria-label="Notifications"
      :aria-expanded="isNotifOpen">
      <Bell class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />

      <!-- Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {{ unreadCount > 99 ? "99+" : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isNotifOpen"
      class="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50"
      @mouseenter="showNotifDropdown"
      @mouseleave="hideNotifDropdown">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b">
        <div class="font-semibold text-gray-900">Notifications</div>

        <div class="flex items-center gap-3">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs font-medium text-blue-600 hover:underline">
            Mark all read
          </button>
          <button
            v-if="notifications.length > 0"
            @click="clearAllFake"
            class="text-xs font-medium text-gray-600 hover:underline">
            Clear
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="max-h-80 overflow-y-auto">
        <div
          v-if="notifications.length === 0"
          class="px-4 py-6 text-sm text-gray-500">
          No notifications
        </div>

        <button
          v-for="n in notifications"
          :key="n.id"
          @click="openNotification(n)"
          class="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition flex gap-3">
          <!-- dot -->
          <div class="pt-1">
            <span
              class="w-2.5 h-2.5 rounded-full inline-block"
              :class="n.read_at ? 'bg-gray-300' : 'bg-blue-600'"></span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="font-medium text-sm text-gray-900 truncate">
                {{ n.title }}
              </div>
              <div class="text-[11px] text-gray-500 whitespace-nowrap">
                {{ formatTimeAgo(n.created_at) }}
              </div>
            </div>

            <div class="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {{ n.message }}
            </div>

            <div class="mt-2 flex items-center gap-2">
              <span
                class="text-[11px] px-2 py-0.5 rounded-full"
                :class="typeClass(n.type)">
                {{ n.type }}
              </span>

              <button
                v-if="!n.read_at"
                @click.stop="markAsRead(n.id)"
                class="text-[11px] text-blue-600 hover:underline">
                Mark read
              </button>
            </div>
          </div>
        </button>
      </div>

      <!-- Footer -->
      <div
        class="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
        <button
          @click="viewAll"
          class="text-xs font-medium text-blue-600 hover:underline">
          View all
        </button>

        <button
          @click="isNotifOpen = false"
          class="text-xs font-medium text-gray-700 hover:underline">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Bell } from "lucide-vue-next";
import { showNotification } from "@/lib/notifications";

const router = useRouter();
const { locale } = useI18n();

const notifRef = ref(null);
const isNotifOpen = ref(false);
const hoverTimer = ref(null);

// ✅ 10 fake notifications (created_at used for real time-ago formatting)
const now = Date.now();
const notifications = ref([
  {
    id: 1,
    title: "New Announcement",
    message: "Admin posted: Final exam schedule is updated.",
    type: "info",
    url: `/${locale.value}/student/dashboard`,
    read_at: null,
    created_at: new Date(now - 2 * 60 * 1000).toISOString(), // 2m
  },
  {
    id: 2,
    title: "Attendance Marked",
    message: "You were marked ABSENT in Web Programming.",
    type: "warning",
    url: `/${locale.value}/student/attendance`,
    read_at: null,
    created_at: new Date(now - 60 * 60 * 1000).toISOString(), // 1h
  },
  {
    id: 3,
    title: "Grade Published",
    message: "Your score for Database Design is now available.",
    type: "success",
    url: `/${locale.value}/student/grades`,
    read_at: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "Leave Request Approved",
    message: "Your leave request has been approved by Admin.",
    type: "success",
    url: `/${locale.value}/student/leave`,
    read_at: null,
    created_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    title: "New Assignment",
    message: "A new assignment was posted for Web Programming.",
    type: "info",
    url: `/${locale.value}/student/assignments`,
    read_at: null,
    created_at: new Date(now - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    title: "Payment Reminder",
    message: "Your tuition payment is due soon. Please review.",
    type: "warning",
    url: `/${locale.value}/student/payments`,
    read_at: null,
    created_at: new Date(now - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    title: "Profile Updated",
    message: "Your profile information was updated successfully.",
    type: "success",
    url: `/${locale.value}/student/profile`,
    read_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    title: "New Message",
    message: "You received a new message from your advisor.",
    type: "info",
    url: `/${locale.value}/student/messages`,
    read_at: null,
    created_at: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    title: "Attendance Warning",
    message: "Your attendance is below 80% in Database Design.",
    type: "warning",
    url: `/${locale.value}/student/attendance`,
    read_at: null,
    created_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    title: "System Update",
    message: "System maintenance scheduled for tonight.",
    type: "info",
    url: `/${locale.value}/student/dashboard`,
    read_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]);

// If locale changes, update URLs automatically
watch(
  () => locale.value,
  (newLocale) => {
    notifications.value = notifications.value.map((n) => ({
      ...n,
      url: n.url?.replace(/^\/(en|kh)\//, `/${newLocale}/`) || n.url,
    }));
  }
);

const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read_at).length
);

// Dropdown behaviors (avoid flicker)
const toggleNotifDropdown = () => {
  clearHoverTimer();
  isNotifOpen.value = !isNotifOpen.value;
};

const showNotifDropdown = () => {
  clearHoverTimer();
  isNotifOpen.value = true;
};

const hideNotifDropdown = () => {
  clearHoverTimer();
  hoverTimer.value = setTimeout(() => {
    isNotifOpen.value = false;
  }, 150);
};

const clearHoverTimer = () => {
  if (hoverTimer.value) clearTimeout(hoverTimer.value);
  hoverTimer.value = null;
};

const markAsRead = (id) => {
  const n = notifications.value.find((x) => x.id === id);
  if (!n) return;
  n.read_at = new Date().toISOString();
  showNotification("Marked as read", "success", 1500);
};

const markAllAsRead = () => {
  const nowIso = new Date().toISOString();
  notifications.value = notifications.value.map((n) => ({
    ...n,
    read_at: n.read_at || nowIso,
  }));
  showNotification("All notifications marked as read", "success", 1500);
};

const openNotification = (n) => {
  if (!n.read_at) n.read_at = new Date().toISOString();
  if (n.url) router.push(n.url);
  isNotifOpen.value = false;
};

const clearAllFake = () => {
  notifications.value = [];
  showNotification("Notifications cleared", "success", 1500);
};

const viewAll = () => {
  // change route if you have a dedicated notifications page
  router.push(`/${locale.value}/student/notifications`);
  isNotifOpen.value = false;
};

// Click outside to close
const onDocClick = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    isNotifOpen.value = false;
  }
};

onMounted(() => document.addEventListener("click", onDocClick));
onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
  clearHoverTimer();
});

// UI helpers
const typeClass = (type) => {
  if (type === "warning") return "bg-yellow-50 text-yellow-700";
  if (type === "success") return "bg-green-50 text-green-700";
  return "bg-blue-50 text-blue-700";
};

const formatTimeAgo = (iso) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};
</script>
