import {
  AccordionTemplate,
  ActionTableTemplate,
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
  NumberFieldTemplate,
  PageElement,
  PageStatus,
  PageType,
  ParagraphTemplate,
  TextAreaBoxTemplate,
} from "@rhtp/shared";
import INITIATIVES from "./data/initiatives.json";

type MetricData = {
  name: string;
  status: string;
};

type InitiativeData = {
  id: string;
  title: string;
  initiativeNumber: string;
  narrative?: string;
  status?: PageStatus | undefined;
  metrics?: MetricData[];
};

const returnToInitiativesDashboard: ButtonLinkTemplate = {
  type: ElementType.ButtonLink,
  id: "return-button",
  to: "initiatives",
  label: "Return to initiatives dashboard",
};

const BackToInitiativesButton: ButtonLinkTemplate = {
  type: ElementType.ButtonLink,
  id: "back-button",
  to: "initiatives",
  label: "Back to Initiatives",
  style: "alt-continue",
};

const initiativeHeader: (initiativeName: string) => HeaderTemplate = (
  initiativeName: string
) => ({
  type: ElementType.Header,
  id: "initiative-header",
  text: initiativeName,
});

const initiativeInstructions: ParagraphTemplate = {
  type: ElementType.Paragraph,
  id: "initiative-instructions",
  text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
};

const initiativeInstructionsAccordion: AccordionTemplate = {
  type: ElementType.Accordion,
  id: "initiative-instructions-accordion",
  label: "Further instructions",
  value: "More coming soon...",
};

const initiativeNarrative = (narrative: string = ""): TextAreaBoxTemplate => ({
  type: ElementType.TextAreaField,
  id: "initiative-narrative",
  label: "Narrative",
  required: true,
  answer: narrative,
});

const initiativeNumberOfPeopleServed: NumberFieldTemplate = {
  type: ElementType.NumberField,
  id: "initiative-number-of-people-served",
  label: "Number of people served",
  required: true,
};

export const metricTable = (
  metrics: MetricData[] = []
): ActionTableTemplate => {
  const table: ActionTableTemplate = {
    type: ElementType.ActionTable,
    id: "metrics-table",
    label: "Metrics",
    hintText:
      "To add an metric, click button below. [Hint text here to let users know they must report on 4 metrics per initative]",
    modal: {
      title: "Metric",
      hintText: "[hint text]",
      elements: [
        {
          id: "status",
          type: ElementType.Dropdown,
          editOnly: true,
          children: [
            { label: "Active", value: "Active" },
            { label: "Abandoned", value: "Abandoned" },
          ],
          required: true,
        },
        { id: "metric", type: ElementType.TextAreaField, required: true },
        { id: "currValue", type: ElementType.NumberField, required: true },
        { id: "date", type: ElementType.Date, required: true },
      ],
    },
    rows: [
      { id: "no", header: "#", type: ElementType.Paragraph },
      { id: "status", header: "Status", type: ElementType.Paragraph },
      { id: "metric", header: "Metric", type: ElementType.Paragraph },
      {
        id: "prevValue",
        header: "Previous Value",
        type: ElementType.NumberField,
        disabled: true,
      },
      {
        id: "currValue",
        header: "Current Value",
        type: ElementType.NumberField,
      },
      { id: "date", header: "As of Date", type: ElementType.Date },
    ],
    answer: [],
  };

  const metricAnswers: any[] = [];
  metrics.map((metric) => {
    const answer = [
      { id: "status", value: metric.status },
      { id: "metric", value: metric.name },
      { id: "prevValue", value: "" },
      { id: "currValue", value: "" },
      { id: "date", value: "" },
    ];
    metricAnswers.push(answer);
  });
  table.answer = metricAnswers;

  return table;
};

const checkpointsTables: PageElement[] = [
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
    id: "checkpoint-1",
    label: "Project Preparation",
    stage: 1,
    checkpoints: [
      {
        id: "project-prop-1",
        label: "CMS approval of project plan",
        attachable: false,
      },
      {
        id: "project-prop-2",
        label: "Launch initiative",
        attachable: true,
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
    type: ElementType.TableCheckpoint,
    id: "checkpoint-3",
    label: "Midway Implementation",
    stage: 3,
    checkpoints: [
      {
        id: "midway-imp-1",
        label: "CMS approval of updated project plan",
        attachable: false,
      },
      {
        id: "midway-imp-2",
        label: "Complete Q2 2028 milestones",
        attachable: true,
      },
      {
        id: "midway-imp-3",
        label: "Report initial metric progress to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-4",
    label: "Project for Completion",
    stage: 4,
    checkpoints: [
      {
        id: "project-for-complete-1",
        label: "Share final deliverables plan with CMS",
        attachable: false,
      },
      {
        id: "project-for-complete-2",
        label: "CMS approval of final deliverables plan",
        attachable: false,
      },
      {
        id: "project-for-complete-3",
        label: "Complete post-program planning",
        attachable: true,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-5",
    label: "Full Implementation",
    stage: 5,
    checkpoints: [
      {
        id: "full-implementation-1",
        label: "Submit final deliverables for CMS",
        attachable: false,
      },
      {
        id: "full-implementation-2",
        label: "Complete all 2030 milestones",
        attachable: true,
      },
      {
        id: "full-implementation-3",
        label: "Report updated metric progress to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
];

// TODO - better array typing and parsing once we have initiatives by state
export const buildInitiativePages = (
  state: string,
  initiatives: { [key: string]: InitiativeData[] } = INITIATIVES as {
    [key: string]: InitiativeData[];
  }
) => {
  if (!(state in initiatives)) return [];
  const initiativesForState = initiatives[state];
  const initiativePages = [];
  for (const {
    id,
    title,
    initiativeNumber,
    status,
    narrative,
    metrics,
  } of initiativesForState) {
    initiativePages.push({
      id,
      title,
      initiativeNumber,
      status: status ?? PageStatus.NOT_STARTED,
      type: PageType.Standard,
      sidebar: false,
      elements: [
        returnToInitiativesDashboard,
        initiativeHeader(title),
        initiativeInstructions,
        initiativeInstructionsAccordion,
        initiativeNarrative(narrative),
        initiativeNumberOfPeopleServed,
        metricTable(metrics),
        ...checkpointsTables,
        BackToInitiativesButton,
      ],
    });
  }
  return initiativePages;
};
