import {
  ActionTableTemplate,
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
  NumberFieldTemplate,
  PageStatus,
  PageType,
  ParagraphTemplate,
  SubHeaderTemplate,
  TableCheckpointTemplate,
  TextAreaBoxTemplate,
  MaskType,
} from "@rhtp/shared";
import INITIATIVES from "./data/initiatives.json";

type MetricData = {
  name: string;
  status: string;
  target?: string; // TODO: (probably) make required once we have new CMS data with targets
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

const initiativeHeader: (
  initiativeName: string,
  initiativeNumber: string
) => HeaderTemplate = (initiativeName: string, initiativeNumber: string) => ({
  type: ElementType.Header,
  id: "initiative-header",
  text: `${initiativeNumber}: ${initiativeName}`,
});

const initiativeInstructions: ParagraphTemplate = {
  type: ElementType.Paragraph,
  id: "initiative-instructions",
  text: "Use this page to provide information about your initiative and the metrics you use to measure its progress. Then, update any checkpoints for review. Note, only Initiative checkpoints and attachments can be updated in quarterly reporting cycles.",
};

const checkpointsHeader: SubHeaderTemplate = {
  type: ElementType.SubHeader,
  id: "checkpoints-header",
  text: "Checkpoints",
};

const checkpointsInstructions: ParagraphTemplate = {
  type: ElementType.Paragraph,
  id: "checkpoints-instructions",
  text:
    "<p>Checkpoints are grouped into the stages listed below. On this page, you can take the following actions on any checkpoint unless otherwise noted.</p>" +
    "<ul>" +
    "  <li>Add or remove attachments with supporting documentation</li>" +
    "  <li>Check if the checkpoint is ready for CMS review</li>" +
    "  <li>Leave comments for CMS, or respond to comments from them by attachment</li>" +
    "</ul>",
};

const initiativeNarrative = (narrative: string = ""): TextAreaBoxTemplate => ({
  type: ElementType.TextAreaField,
  id: "initiative-narrative",
  label: "Narrative",
  helperText:
    "Provide a narrative description of the initiative’s progress during this reporting period.",
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
    label: "Metric",
    hintText:
      "Each initiative should have at least 4 metrics to measure its progress toward initiative goals.",
    modal: {
      title: "Metric",
      elements: [
        {
          id: "status",
          type: ElementType.Dropdown,
          label: "Status",
          editOnly: true,
          children: [
            { label: "Active", value: "Active" },
            { label: "Abandoned", value: "Abandoned" },
          ],
          required: true,
        },
        {
          id: "metric",
          label: "Metric name",
          type: ElementType.TextAreaField,
          required: true,
        },
        {
          id: "target",
          label: "What is the target for this metric?",
          type: ElementType.NumberField,
          required: false,
          mask: MaskType.CommaSeparated,
        },
        {
          id: "currValue",
          label: "What is the metric’s current value?",
          type: ElementType.NumberField,
          required: false,
          mask: MaskType.CommaSeparated,
        },
        {
          id: "date",
          label: "Date of the current value",
          type: ElementType.Date,
          required: false,
        },
      ],
    },
    rows: [
      { id: "no", header: "#", type: ElementType.Paragraph },
      { id: "status", header: "Status", type: ElementType.Paragraph },
      { id: "metric", header: "Metric", type: ElementType.Paragraph },
      {
        id: "target",
        header: "Target",
        type: ElementType.Paragraph,
        mask: MaskType.CommaSeparated,
      },
      {
        id: "prevValue",
        header: "Previous value",
        type: ElementType.NumberField,
        disabled: true,
        mask: MaskType.CommaSeparated,
      },
      {
        id: "currValue",
        header: "Current value",
        type: ElementType.NumberField,
        mask: MaskType.CommaSeparated,
      },
      { id: "date", header: "As of Date MM/DD/YYYY", type: ElementType.Date },
    ],
    answer: [],
  };

  const metricAnswers: any[] = [];
  metrics.map((metric) => {
    const answer = [
      { id: "status", value: metric.status },
      { id: "metric", value: metric.name },
      { id: "target", value: metric.target },
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
        initiativeHeader(title, initiativeNumber),
        initiativeInstructions,
        initiativeNarrative(narrative),
        initiativeNumberOfPeopleServed,
        metricTable(metrics),
        checkpointsHeader,
        checkpointsInstructions,
        checkpointsTables,
        BackToInitiativesButton,
      ],
    });
  }
  return initiativePages;
};
