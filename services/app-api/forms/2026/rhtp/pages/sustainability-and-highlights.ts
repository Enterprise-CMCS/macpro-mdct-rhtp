import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";

export const sustainabilityAndHighlights: FormPageTemplate = {
  id: "sustainability-and-highlights",
  title: "Sustainability and Highlights",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "sustainability-and-highlights-header",
      text: "Sustainability and Highlights",
    },
    {
      id: "success-stories",
      type: ElementType.TextAreaField,
      label:
        "Share success stories that you want to highlight as a result of your state’s implementation of the RHT Program.",
      required: true,
    },
    {
      type: ElementType.TextAreaField,
      id: "sustainability-planning",
      label:
        "What are the most significant updates or changes to your sustainability plan based on the past year’s experiences, successes, and challenges?",
      required: true,
    },
  ],
};
