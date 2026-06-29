import {
  AlertTypes,
  ElementType,
  HeaderIcon,
  PageType,
  ReviewSubmitTemplate,
} from "@rhtp/shared";

export const reviewAndSubmit: ReviewSubmitTemplate = {
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
      type: ElementType.SubmitForReview,
      id: "review-submit-for-review",
    },
    {
      type: ElementType.Paragraph,
      id: "review-text",
      title: "Ready to Submit?",
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
      text:
        "<p>Your report has been submitted and is now locked from editing.</p></br></br>" +
        "<p>An automated confirmation email has been sent to you, your CMS Project Officer, and all points of contact listed on your General Information page. No further action is required on your part</p>",
    },
  ],
};
