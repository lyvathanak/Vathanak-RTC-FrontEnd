<script setup lang="ts">
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";

import { SurveyCreatorModel } from "survey-creator-core";
import { SurveyCreatorComponent } from "survey-creator-vue";

// 👉 Import a predefined theme
import { LayeredDarkPanelless } from "survey-core/themes";

const creatorOptions = {
  autoSaveEnabled: true,
  collapseOnDrag: true
};

const creator = new SurveyCreatorModel(creatorOptions);

// 👉 Apply theme to Survey Creator
creator.applyTheme(LayeredDarkPanelless);

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
  localStorage.getItem("survey-json") || JSON.stringify(defaultJson);

creator.saveSurveyFunc = (saveNo, callback) => {
  localStorage.setItem("survey-json", creator.text);
  callback(saveNo, true);
};
</script>

<template>
  <div style="height: 100vh">
    <SurveyCreatorComponent :model="creator" />
  </div>
</template>
