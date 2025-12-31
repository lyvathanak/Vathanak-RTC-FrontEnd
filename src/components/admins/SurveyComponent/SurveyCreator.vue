<script setup>
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";

import { SurveyCreatorModel } from "survey-creator-core";
import { SurveyCreatorComponent } from "survey-creator-vue";

const creatorOptions = {
  autoSaveEnabled: true,
  collapseOnDrag: true
};

const creator = new SurveyCreatorModel(creatorOptions);

const defaultJson = {
  pages: [
    {
      name: "Name",
      elements: [
        {
          name: "FirstName",
          type: "text",
          title: "Enter your first name"
        },
        {
          name: "LastName",
          type: "text",
          title: "Enter your last name"
        }
      ]
    }
  ]
};

creator.text =
  window.localStorage.getItem("survey-json") || JSON.stringify(defaultJson);

creator.saveSurveyFunc = (saveNo, callback) => {
  window.localStorage.setItem("survey-json", creator.text);
  callback(saveNo, true);
};
</script>

<template>
  <div style="height: 100vh; box-sizing: border-box;">
    <SurveyCreatorComponent :model="creator" />
  </div>
</template>
