export const json = {
  title: "Math Skills Survey",
  showProgressBar: "top",
  pages: [
    {
      elements: [
        {
          type: "radiogroup",
          name: "math_level",
          title: "How would you rate your overall math level?",
          choices: [
            "Beginner",
            "Intermediate",
            "Advanced"
          ]
        },
        {
          type: "checkbox",
          name: "math_topics",
          title: "Which math topics are you familiar with?",
          choices: [
            "Addition & Subtraction",
            "Multiplication & Division",
            "Algebra",
            "Geometry",
            "Statistics"
          ]
        },
        {
          type: "rating",
          name: "math_confidence",
          title: "How confident are you in solving math problems?",
          mininumRateDescription: "Not confident",
          maximumRateDescription: "Very confident"
        }
      ]
    },
    {
      elements: [
        {
          type: "radiogroup",
          name: "math_difficulty",
          title: "Do you find math difficult?",
          choices: [
            "Yes",
            "Sometimes",
            "No"
          ]
        },
        {
          type: "comment",
          name: "math_problem",
          title: "Which math topic do you struggle with the most?"
        }
      ]
    },
    {
      elements: [
        {
          type: "text",
          name: "student_name",
          title: "Enter your name (optional)"
        }
      ]
    }
  ]
};
