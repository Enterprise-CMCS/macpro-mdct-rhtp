import {
  AccordionTemplate,
  ElementType,
  FormPageTemplate,
  PageType,
} from "@rhtp/shared";

export const initiativeAttachmentStatusInstructions: AccordionTemplate = {
  type: ElementType.Accordion,
  id: "initiatives-instructions-accordion",
  label: "Understanding initiative statuses",
  value:
    "<ul>" +
    "  <li><b>Pending Review (System Automated):</b> This status is applied automatically when you upload a new file to signal to CMS that your document is ready for review. While in this status, if no comments have been made, you retain full editing power and can delete or swap the file freely.</li>" +
    "  <li><b>Needs Revision (CMS Project Officer):</b> Your reviewer selects this status when a document requires updates or corrective context before it can be formally approved. For compliance tracking, the file is locked from deletion. Please review CMS feedback and upload a revised version as needed.</li>" +
    "  <li><b>Informational (CMS or State User):</b> This status is used for files that are for reference only and do not affect your performance scoring. Once selected, the file is locked from deletion so it remains a permanent part of your state record-keeping history.</li>" +
    "  <li><b>Archived (CMS or State User):</b> This status allows you to safely hide older, outdated file versions from your active workspace view without purging them from your historical audit trail. The system locks the file from deletion, preserving it securely in the background for permanent compliance tracking.</li>" +
    "  <li><b>Locked for Scoring (CMS Admin Only):</b> CMS applies this status once a file has been reviewed and is reading for scoring. When in this status, the files are locked and cannot be edited or deleted.</li>" +
    "</ul>",
};

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
    initiativeAttachmentStatusInstructions,
    {
      type: ElementType.AttachmentTable,
      id: "initiative-attachments-table",
      answer: [],
    },
  ],
};
