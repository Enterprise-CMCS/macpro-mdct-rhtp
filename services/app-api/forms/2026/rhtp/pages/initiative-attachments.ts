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
        "  <li>Utilize the comment icon to add new comments and adjust statuses where appropriate by attachment</li>" +
        "</ul>" +
        "<br />",
    },
    {
      type: ElementType.Accordion,
      id: "initiatives-instructions-accordion",
      label: "Understanding initiative statuses",
      value:
        "<ul>" +
        "  <li><b>Pending Review</b> - This status is applied automatically when a new attachment is added. It lets CMS know the document is ready to be reviewed.</li>" +
        "  <li><b>Needs revision</b> - CMS uses this status when a document needs updates or corrections from the state. Please review CMS feedback and upload a revised version as needed. When in this status, attachments can no longer be deleted.</li>" +
        "  <li><b>Locked for Scoring</b> - CMS uses this status when a document has been locked for scoring. When in this status, attachments are locked and cannot be edited or deleted.</li>" +
        "  <li><b>Informational</b> - CMS or the state may use this status for documents that are for reference only. These documents are not used for scoring. When in this status, attachments can no longer be deleted.</li>" +
        "  <li><b>Archived</b> - CMS or the state may use this status for documents that are no longer part of the active submission but should be kept for records. When in this status, attachments can no longer be deleted.</li>" +
        "</ul>",
    },
    {
      type: ElementType.AttachmentTable,
      id: "initiative-attachments-table",
      answer: [],
    },
  ],
};
