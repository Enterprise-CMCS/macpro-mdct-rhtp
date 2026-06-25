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
      type: ElementType.SubHeader,
      id: "success-stories-header",
      text: "Success Stories",
    },
    {
      id: "success-stories",
      type: ElementType.TextAreaField,
      label:
        "Share success stories that you want to highlight as result of your State’s implementation of the RHT Program.",
      helperText:
        "Limit responses to 3,000 characters, approximately 400–500 words.",
      required: true,
      quarterly: false,
    },
    {
      id: "success-stories-paragraph",
      type: ElementType.Paragraph,
      title: "Success Stories: Supporting Evidence",
      text: "Upload supporting documentation (e.g., press releases illustrating success stories).",
      style: "hint",
    },
    {
      type: ElementType.ListInput,
      id: "success-links",
      label: "Links",
      helperText: "Add URLs to supporting documentation.",
      fieldLabel: "Link",
      buttonText: "Add link",
      validation: "link",
      required: false,
    },
    {
      type: ElementType.AttachmentArea,
      id: "success-attachments",
      label: "Attachments",
      helperText: "Upload supporting documentation.",
      uploadedSubLabel: "Success Stories: Supporting Evidence",
      required: false,
    },
    {
      type: ElementType.Divider,
      id: "divider",
    },
    {
      type: ElementType.SubHeader,
      id: "success-stories-header",
      text: "Sustainability Planning",
    },
    {
      type: ElementType.TextAreaField,
      id: "sustainability-planning",
      label:
        "What are the most significant updates or changes to your sustainability plan based on the past year’s experiences, successes, and challenges?",
      helperText:
        "Limit responses to 3,000 characters, approximately 400–500 words.",
      required: true,
      quarterly: false,
    },
    {
      id: "sustainability-paragraph",
      type: ElementType.Paragraph,
      title: "Sustainability Planning: Supporting Evidence",
      text: "Upload supporting documentation.",
      style: "hint",
    },
    {
      type: ElementType.ListInput,
      id: "sustainability-links",
      label: "Links",
      helperText: "Add URLs to supporting documentation.",
      fieldLabel: "Link",
      buttonText: "Add link",
      validation: "link",
      required: false,
    },
    {
      type: ElementType.AttachmentArea,
      id: "sustainability-attachments",
      label: "Attachments",
      helperText: "Upload supporting documentation.",
      uploadedSubLabel: "Sustainability Planning: Supporting Evidence",
      required: false,
    },
  ],
};
