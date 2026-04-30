import { ElementType, FormPageTemplate, PageType } from "@rhtp/shared";

export const initiativeAttachments: FormPageTemplate = {
  id: "initiative-attachments",
  title: "Initiative Attachments",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "initiatives-header",
      text: "Initiative Attachments",
    },
    {
      type: ElementType.Paragraph,
      id: "initiatives-instructions",
      text:
        "<p>The table below lists all attachments added to any initiatives. From here you can:</p>" +
        "<ul>" +
        "  <li>Add new attachments</li>" +
        "  <li>Edit or delete existing attachments dependent on their status</li>" +
        "  <li>Leave or respond to comments on any attachment</li>" +
        "</ul>" +
        "<br />" +
        "<p>Utilize the comment icon to add new comments and adjust statuses where appropriate by attachment.</p>",
    },
    {
      type: ElementType.Accordion,
      id: "initiatives-instructions-accordion",
      label: "Understanding initiative statuses",
      value:
        "<ul>" +
        "  <li>Pending Review - Automatically move to this status when an attachment has been added</li>" +
        "  <li>Needs revision - CMS will update to this status for states review</li>" +
        "  <li>Locked for Scoring - CMS will update to this status when the document is locked for scoring purposes</li>" +
        "  <li>Informational - Both CMS and States can adjust attachments to this status if the document is purely informational and should not be used for scoring</li>" +
        "  <li>Archived - Utilized by both CMS and States for documents that are no longer relevant to the submission but should be kept for record keeping purposes</li>" +
        "</ul>",
    },
    {
      type: ElementType.AttachmentTable,
      id: "initiative-attachments-table",
      answer: [],
    },
  ],
};
