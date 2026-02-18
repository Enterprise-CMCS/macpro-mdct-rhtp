import {
  PageType,
  ElementType,
  ReportType,
  HeaderIcon,
  AlertTypes,
  ReportBase,
} from "../../../types/reports";
import { exportToPDF } from "../elements";

export const rhtpReportTemplate: ReportBase = {
  type: ReportType.RHTP,
  year: 2026,
  pages: [
    {
      id: "root",
      childPageIds: [
        "general-information",
        "sustainability-and-highlights",
        "review-submit",
      ],
    },
    {
      id: "general-information",
      title: "General Information",
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: ElementType.Header,
          id: "general-information-header",
          text: "General Information",
        },
        {
          id: "contact-name",
          type: ElementType.Textbox,
          label: "Contact name",
          required: true,
          helperText:
            "Enter a person's name or a position title for CMS to contact with questions about this report.",
        },
        {
          type: ElementType.Textbox,
          id: "contact-email",
          label: "Contact email address",
          required: true,
          helperText:
            "Enter an email address for the person or position above. Department or program-wide email addresses are allowed.",
        },
      ],
    },
    {
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
            "Share success stories that you want to highlight as result of your State’s implementation of the RHT Program.",
          required: true,
        },
        {
          type: ElementType.TextAreaField,
          id: "sustainability-planning",
          label:
            "What are the most significant updates or changes to your sustainability plan based on the past year's experiences, successes, and challenges?",
          required: true,
        },
      ],
    },
    {
      id: "review-submit",
      title: "Review & Submit",
      type: PageType.ReviewSubmit,
      sidebar: true,
      hideNavButtons: true,
      elements: [
        {
          type: ElementType.StatusAlert,
          id: "review-alert",
          status: AlertTypes.ERROR,
          title: "Your form is not ready for submission",
          text: "Some sections of the RHTP Report have errors or are missing required responses.",
        },
        {
          type: ElementType.Header,
          id: "review-header",
          text: "Review & Submit",
        },
        {
          type: ElementType.Paragraph,
          id: "review-text",
          title: "Ready to submit?",
          text: "Double check that everything in your RHTP Report is accurate. To make edits to your report after submitting, contact your CMS RHTP Lead to unlock your report.",
        },
        {
          type: ElementType.StatusTable,
          id: "review-status",
          to: "review-submit",
        },
      ],
      submittedView: [
        {
          type: ElementType.Header,
          id: "submitted-header",
          text: "Successfully Submitted",
          icon: HeaderIcon.Check,
        },
        {
          type: ElementType.SubmissionParagraph,
          id: "submitted-thank-you",
        },
        {
          type: ElementType.Divider,
          id: "divider",
        },
        {
          type: ElementType.Paragraph,
          id: "submitted-what-explanation",
          title: "What happens now?",
          text: 'Your dashboard will indicate the status of this report as "Submitted" and and it is now locked from editing.',
        },
        {
          type: ElementType.Paragraph,
          weight: "bold",
          id: "submitted-what-happens",
          text: "Email your CMS representative to inform them you submitted the RHTP Report and it is ready for their review.",
        },
        exportToPDF,
      ],
    },
  ],
};
