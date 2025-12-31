<script setup lang="ts">
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";
import { json } from "@/db/SurveyData/survey_json.js";

const survey = new Model(json);
</script>

<template>
  <SurveyComponent :model="survey"></SurveyComponent>
</template>