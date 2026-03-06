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
          quarterly: false,
          required: true,
          helperText:
            "Enter a person's name or a position title for CMS to contact with questions about this report.",
        },
        {
          type: ElementType.Textbox,
          id: "contact-email",
          label: "Contact email address",
          quarterly: true,
          required: true,
          helperText:
            "Enter an email address for the person or position above. Department or program-wide email addresses are allowed.",
        },
        {
          type: ElementType.TableCheckpoint,
          id: "checkpoint-0",
          label: "Planning",
          stage: 0,
          checkpoints: [
            {
              id: "planning-1",
              label: "Establish governance",
              attachable: true,
            },
            {
              id: "planning-2",
              label: "Submit project plan to CMS",
              attachable: false,
            },
          ],
          required: true,
        },
        {
          type: ElementType.TableCheckpoint,
          id: "checkpoint-2",
          label: "Early Implementation",
          stage: 2,
          checkpoints: [
            {
              id: "early-implementation-1",
              label: "Continue initiative",
              attachable: true,
            },
            {
              id: "early-implementation-2",
              label: "Achieve at least one milestone",
              attachable: true,
            },
            {
              id: "early-implementation-3",
              label: "Establish metric reporting methodology",
              attachable: true,
            },
            {
              id: "early-implementation-4",
              label: "Submit updated project plan to CMS",
              attachable: false,
            },
          ],
          required: true,
        },
        {
          type: ElementType.AccordionGroup,
          id: "group-test",
          accordions: [
            {
              label: "B.2 Presidental Fitness Test",
              children: [
                {
                  id: "test-comment",
                  type: ElementType.Textbox,
                  label: "Testing textbox",
                  helperText: "This is the hint text",
                  required: true,
                },
              ],
            },
            {
              label: "B.3 SNAP Food Restriction Waiver Policy",
              children: [
                {
                  type: ElementType.Dropdown,
                  id: "curr-status",
                  label: "Current Status",
                  helperText: "This is the hint text",
                  options: [
                    { label: "Option 1", value: "op-1" },
                    { label: "Option 2", value: "op-2" },
                  ],
                  required: true,
                },
                {
                  type: ElementType.AttachmentArea,
                  id: "upload-area",
                  label: "Supporting Evidence: Attachments",
                  required: false,
                },
                {
                  id: "optional-comment",
                  type: ElementType.TextAreaField,
                  label: "Optional Comments/Notes",
                  helperText: "This is the hint text",
                  required: true,
                },
              ],
            },
            {
              label: "B.4 Nutrition Continuing Medical Education",
              children: [
                {
                  id: "optional-comment",
                  type: ElementType.TextAreaField,
                  label: "Optional Comments/Notes",
                  helperText: "This is the hint text",
                  required: true,
                },
              ],
            },
          ],
          required: true,
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
