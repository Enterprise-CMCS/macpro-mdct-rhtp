import {
  AccordionTemplate,
  ActionTableTemplate,
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
  NumberFieldTemplate,
  PageStatus,
  PageType,
  ParagraphTemplate,
  TableCheckpointTemplate,
  TextAreaBoxTemplate,
} from "@rhtp/shared";
import INITIATIVES from "./data/initiatives.json";

const returnToInitiativesDashboard: ButtonLinkTemplate = {
  type: ElementType.ButtonLink,
  id: "return-button",
  to: "initiatives",
  label: "Return to initiatives dashboard",
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

export const metricTable = (metrics: any[]): ActionTableTemplate => {
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

const checkpointsTables: TableCheckpointTemplate = {
  type: ElementType.TableCheckpoint,
  id: "checkpoint-table",
  required: true,
};

// TODO - better array typing and parsing once we have initiatives by state
export const buildInitiativePages = (
  state: string,
  initiatives: any = INITIATIVES
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
        checkpointsTables,
      ],
    });
  }
  return initiativePages;
};
