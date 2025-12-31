<template>
  <section class="w-full bg-gray-100 py-12 px-4 sm:px-8 lg:px-16">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <!-- LEFT: Location Map -->
      <div
        class="w-full h-[350px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-md">
        <iframe
          class="w-full h-full border-0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.008929710429!2d104.89690577586244!3d11.56968634405862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109517388680e15%3A0x63057e6682968f5!2sInstitute%20of%20Technology%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1731502095000!5m2!1sen!2skh"></iframe>
      </div>

      <!-- RIGHT: Contact Form -->
      <div class="flex flex-col justify-center w-full">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          {{ t("contact_here") }}
        </h1>
        <p
          :class="[
            'text-xs sm:text-sm md:text-base text-[#74828F] mb-6 sm:mb-8',
            locale === 'kh' ? 'khmer-text' : '',
          ]">
          {{ t("feedback_more_info") }}
        </p>

        <form
          @submit.prevent="submitForm"
          class="space-y-3 sm:space-y-4 lg:space-y-5">
          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2">
              {{ t("email_address") }}
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              :placeholder="t('enter_email_address')"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <!-- Remark -->
          <div>
            <label
              for="remark"
              class="block text-sm font-medium text-gray-700 mb-2">
              {{ t("add_remark") }} <span class="text-red-500">*</span>
            </label>
            <textarea
              id="remark"
              v-model="formData.remark"
              required
              :placeholder="t('enter_remark_here')"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"></textarea>
          </div>

          <!-- Submit -->
          <div>
            <button
              type="submit"
              :disabled="submitting"
              class="bg-[#235AA6] hover:bg-[#1f4f93] disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-200 w-full sm:w-auto">
              {{ submitting ? "Submitting..." : t("submit_here") }}
            </button>
          </div>
        </form>
        <!-- Copyright Section -->
        <div class="text-center xl:text-right w-full mt-4 sm:mt-6 lg:mt-0">
          <p
            class="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
            Copyright © 2025 RTC | Battambang. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import api from "@/stores/apis/axios.js";
import { useI18n } from "vue-i18n";
import { showNotification } from "@/lib/notifications.js";


const { t, locale } = useI18n();

const formData = ref({
  email: "",
  remark: "",
});

const submitting = ref(false);

const submitForm = async () => {
  if (!formData.value.remark.trim()) {
    showNotification(t("enter_remark_here"), "error");
    return;
  }

  submitting.value = true;
  try {
    await api.post("/feedbacks/submit_feedback", {
      email: formData.value.email,
      remark: formData.value.remark,
    });
    showNotification(t("feedback_submitted_success"), "success");
    formData.value.email = "";
    formData.value.remark = "";
  } catch (e) {
    const msg = e?.response?.data?.message || t("feedback_submit_error");
    showNotification(msg, "error");
    console.error("Feedback submit error:", e);
  } finally {
    submitting.value = false;
  }
};
</script>
