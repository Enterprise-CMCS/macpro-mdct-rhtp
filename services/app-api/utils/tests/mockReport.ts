import { rhtpReportTemplate } from "../../forms/2026/rhtp/rhtp";
import {
  Report,
  PageType,
  ElementType,
  ReportStatus,
  StateAbbr,
  RhtpSubType,
  ReportType,
  AccordionGroupItem,
  ActionTableTemplate,
  FormPageTemplate,
  InitiativePageTemplate,
  PageStatus,
  TextboxTemplate,
  ActionAnswerShape,
} from "@rhtp/shared";

const pages = rhtpReportTemplate("PA");

export const validReport: Report = {
  type: ReportType.RHTP,
  subType: RhtpSubType.ANNUAL,
  subTypeKey: "A1",
  budgetPeriod: 1,
  pages: pages,
  state: "NJ" as StateAbbr,
  id: "2rRaoAFm8yLB2N2wSkTJ0iRTDu0",
  created: 1736524513631,
  lastEdited: 1736524513631,
  lastEditedBy: "Anthony Soprano",
  lastEditedByEmail: "stateuser2@test.com",
  status: ReportStatus.NOT_STARTED,
  name: "RHTP valid report",
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

export const metricAnswers: ActionAnswerShape[] = [
  [
    { id: "status", value: "active" },
    { id: "metric", value: "hello" },
    { id: "prevValue", value: "" },
    { id: "currValue", value: "1000" },
    { id: "date", value: "2/2/2025" },
  ],
];

export const mockAddedInitiatives = [
  {
    id: "added-initiative-1",
    title: "Added Initiative 1",
    initiativeNumber: "0987",
    elements: [
      {
        type: ElementType.Textbox,
        id: "mock-added-initiative-element",
        label: "Added Initiative element",
        required: true,
        answer: "mock text answer",
      } as TextboxTemplate,
      {
        id: "metrics-table", // id match for specific logic
        type: ElementType.ActionTable,
        label: "Metric table element",
        required: true,
        answer: metricAnswers,
      } as unknown as ActionTableTemplate,
    ],
  },
  {
    id: "added-initiative-2",
    title: "Added Initiative 2",
    initiativeNumber: "1010",
    status: PageStatus.ABANDONED,
    elements: [],
  },
] as InitiativePageTemplate[];

export const mockStatePolicyCommitments = [
  {
    id: "state-policy-commitments",
    title: "State Policy Commitments",
    type: PageType.Standard,
    elements: [
      {
        type: ElementType.AccordionGroup,
        id: "state-policy-commitments-group",
        accordions: [
          {
            label: "State Policy Commitment 1",
            elements: [
              {
                type: ElementType.Textbox,
                id: "state-policy-commitment-1-textbox",
                label: "State Policy Commitment 1 Textbox",
                answer: "State Policy Commitment 1 Answer",
              },
              {
                type: ElementType.AttachmentArea,
                id: "attachment-id",
                answer: [{ name: "mock-name", size: 100, fileId: "mock-id" }],
              },
            ],
          },
        ] as AccordionGroupItem[],
      },
    ],
  },
] as FormPageTemplate[];
