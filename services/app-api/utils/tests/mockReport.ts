import { rhtpReportTemplate as rhtpReportTemplate2026 } from "../../forms/2026/rhtp/rhtp";
import {
  Report,
  PageType,
  ElementType,
  ReportStatus,
} from "../../types/reports";
import { StateAbbr } from "../constants";

const rhtpReportTemplate = rhtpReportTemplate2026;

export const validReport: Report = {
  type: rhtpReportTemplate.type,
  year: rhtpReportTemplate.year,
  pages: rhtpReportTemplate.pages,
  state: "NJ" as StateAbbr,
  id: "2rRaoAFm8yLB2N2wSkTJ0iRTDu0",
  created: 1736524513631,
  lastEdited: 1736524513631,
  lastEditedBy: "Anthony Soprano",
  lastEditedByEmail: "stateuser2@test.com",
  status: ReportStatus.NOT_STARTED,
  name: "RHTP valid report",
  archived: false,
  submissionCount: 0,
};

export const missingStateReport = {
  ...validReport,
  state: undefined,
};

export const incorrectStatusReport = {
  ...validReport,
  status: "wrong value", // Doesn't use ReportStatus enum
};

export const incorrectTypeReport = {
  ...validReport,
  type: "wrong type", // Doesn't use ReportType enum
};

export const invalidFormPageReport = {
  ...validReport,
  pages: [
    {
      id: "general-info",
      // missing title field
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: ElementType.Header,
          text: "General Information",
        },
        {
          type: ElementType.Textbox,
          required: true,
          label: "Contact title",
          helperText:
            "Enter person's title or a position title for CMS to contact with questions about this request.",
        },
      ],
    },
  ],
};

export const invalidParentPageReport = {
  ...validReport,
  pages: [
    {
      // missing id field
      childPageIds: ["general-info", "review-submit"],
    },
  ],
};

export const invalidPageElementType = {
  ...validReport,
  pages: [
    {
      id: "general-info",
      title: "General Info",
      type: PageType.Standard,
      sidebar: true,
      elements: [
        {
          type: "badElementType", // Doesn't use ElementType enum
          text: "State of Program Information",
        },
      ],
    },
  ],
};
