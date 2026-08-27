import {
  ActionTableTemplate,
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
  PageStatus,
  PageType,
  ParagraphTemplate,
  SubHeaderTemplate,
  TableCheckpointTemplate,
  TextAreaBoxTemplate,
  MaskType,
  AccordionTemplate,
  TextboxTemplate,
  DividerTemplate,
} from "@rhtp/shared";
import INITIATIVES from "./data/initiatives.json";
import { initiativeAttachmentStatusInstructions } from "../initiative-attachments";

type MetricData = {
  name: string;
  status: string;
  target?: string; // TODO: (probably) make required once we have new CMS data with targets
  currValue?: string;
  date?: string;
};

type InitiativeData = {
  id: string;
  title: string;
  initiativeNumber: string;
  narrative?: string;
  status?: PageStatus | undefined;
  numberOfPeopleServed?: string;
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
  text: "Use this page to provide information about your initiative and the metrics you use to measure its progress. Then, update any checkpoints for review.",
};

const initiativeAccordion: AccordionTemplate = {
  type: ElementType.Accordion,
  id: "initiative-accordion",
  label: "What is included in Annual Reporting vs Quarterly Reporting?",
  value:
    "<b>Annual Reporting Data should include:</b>" +
    "<ul>" +
    "  <li>Initiative Progress Narrative</li>" +
    "  <li>Initiative People Served</li>" +
    "  <li>Initiative Metrics</li>" +
    "  <li>Initiative Checkpoints</li>" +
    "</ul>" +
    "<b>Quarterly Reporting Data can include:</b>" +
    "<ul>" +
    "  <li>Initiative Progress Narrative (Optional)" +
    "  <li>Initiative Checkpoints</li>" +
    "</ul>",
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
    "  <li>Add or remove attachments of evidentiary documentation.</li>" +
    "  <li>Select the checkbox when the checkpoint is complete and ready for CMS review.</li>" +
    "  <li>Leave comments for CMS, or respond to comments from them by attachment.</li>" +
    "</ul>" +
    "<br>",
  helperTextLink: {
    link: "Understanding Your Initiative Attachments",
    label: "Understanding Your Initiative Attachments",
    text:
      "<p>These are files uploaded directly inside individual stages/checkpoint to prove your team has hit specific milestones (such as an operational governance chart or a finalized project plan). These documents directly impact your upcoming annual performance score.</p></br>" +
      "<p>Why do some checkpoints require a manual file upload while others do not?</p></br>" +
      "<ul>" +
      "  <li><b>State-Driven Milestones (Upload Required):</b>These require active verification from your state team. For milestones like Checkpoint 0.1 (Establish Governance) or Checkpoint 2.3 (Establish Metric Reporting Methodology), you must manually upload your local documentation so your Project Officer can evaluate it.</li>" +
      "  <li><b>CMS-Driven Milestones (Locked / Automated Verification):</b>These checkpoints track formal federal review processes, such as Checkpoint 1.1 (CMS Approval of Project Plan) or Checkpoint 3.1 (CMS Approval of Updated Project Plan). Because verification depends on an internal administrative action by CMS, your State team cannot upload files here. Your Project Officer will verify your previous work to advance your score.</li>" +
      "</ul>",
  },
};

const initiativeNarrative = (narrative: string = ""): TextAreaBoxTemplate => ({
  type: ElementType.TextAreaField,
  id: "initiative-narrative",
  label: "Narrative",
  helperText:
    "Narrative is optional for quarterly reporting. Limit responses to 2,000 characters, or approximately 250–350 words.",
  helperTextLink: {
    link: "Initiative Progress Narrative Guidance",
    label: "Initiative Progress Narrative Guidance",
    text:
      "<p>Provide a concise update on the progress of each initiative during the reporting period. Responses should focus on key activities completed, milestones reached, challenges encountered, and any notable outcomes or impacts to date.</p></br>" +
      "<p>This section is intended for progress reporting purposes only and should not repeat the full project narrative from the NCC Kit. Please focus on recent initiative progress and avoid including broad background information unless it is necessary for context.</p></br>" +
      "<p>States are encouraged to include any relevant updates that may be important for CMS to understand the status, implementation progress, or emerging results of the initiative.</p>",
  },
  required: true,
  answer: narrative,
  quarterly: true,
  charLimit: 2000,
});

const initiativeNumberOfPeopleServed = (
  numberOfPeopleServed: string = ""
): TextboxTemplate => ({
  type: ElementType.Textbox,
  id: "initiative-number-of-people-served",
  label: "Number of people served",
  mask: MaskType.NumberNA,
  helperText:
    "Number of People Served is only reported annually. If this number is not applicable for the initiative, enter N/A. <b>Invalid entries will automatically clear.</b>",
  helperTextLink: {
    link: "Reporting Guidelines",
    label: "Number of People Served",
    text:
      "<p>States should provide a best estimate of the number of individuals who have benefited from RHT Program funds during the reporting period. Estimates should be reasonable, supported by available data, and reflect the scope and reach of the initiative.</p></br>" +
      "<p>For system-based initiatives that do not provide direct services (e.g., IT systems, Health Information Exchanges), States may define the number of people served more broadly. For example:</p>" +
      "<ul>" +
      "<li>For health system–level initiatives, the number served may reflect the total population served by the system.</li>" +
      "<li>For statewide systems (e.g., HIEs), the number served may reflect the number of patients with data in the system or the total number of state residents.</li>" +
      "<li>These estimates do not need to be de-duplicated and do not need to be limited to rural populations if the initiative has a broader reach.</li>" +
      "<li>States should aim to provide the most accurate and justifiable estimate possible and may include brief context in the narrative section if helpful for CMS’s understanding.</li>" +
      "</ul>",
  },
  required: true,
  quarterly: false,
  answer: numberOfPeopleServed,
});

export const metricTable = (
  metrics: MetricData[] = []
): ActionTableTemplate => {
  const table: ActionTableTemplate = {
    type: ElementType.ActionTable,
    id: "metrics-table",
    heading: "Track Initiative Performance Metrics",
    label: "Metric",
    helperText:
      "The metrics for each initiative will be <b>pre-populated</b> based on the information previously provided. Metric values are only required to be reported annually. Any value reported on a Quarterly Report will be pre-populated but editable for the remainder of the Program Year. Contact your Project Officer if the metrics listed are incorrect.<br>" +
      "Additionally, <b>“As of Date”</b> is NOT today's date. This must be the historical date on which the metric value was either extracted from a database or calculated by the State. This value should not be updated until the metric value is updated or the previous value is confirmed by subsequent analysis.<br>" +
      "Current Values: Enter a number, currency (e.g., $100), percentage (e.g., 50%), or N/A if no data. <b>Invalid entries will automatically clear.</b>",
    quarterly: true,
    modal: {
      title: "Metric",
      elements: [
        {
          id: "status",
          type: ElementType.Dropdown,
          label: "Status",
          editOnly: true,
          hintText:
            "Setting \“Abandoned\" preserves its historical values for auditing but flags it as abandoned, removing it from the state's current active data entry requirements.",
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
          type: ElementType.Textbox,
          required: false,
          mask: MaskType.MagicNumber,
        },
        {
          id: "currValue",
          label: "What is the metric’s current value?",
          type: ElementType.Textbox,
          required: false,
          mask: MaskType.MagicNumber,
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
        mask: MaskType.MagicNumber,
      },
      {
        id: "prevValue",
        header: "Previous annual value",
        type: ElementType.Textbox,
        disabled: true,
        mask: MaskType.MagicNumber,
      },
      {
        id: "currValue",
        header: "Current value",
        type: ElementType.Textbox,
        mask: MaskType.MagicNumber,
      },
      { id: "date", header: "As of Date MM/DD/YYYY", type: ElementType.Date },
    ],
    answer: [],
    required: true,
  };

  const metricAnswers: any[] = [];
  metrics.map((metric) => {
    const answer = [
      { id: "status", value: metric.status },
      { id: "metric", value: metric.name },
      { id: "target", value: metric.target },
      { id: "prevValue", value: "" },
      { id: "currValue", value: metric.currValue },
      { id: "date", value: metric.date },
    ];
    metricAnswers.push(answer);
  });
  table.answer = metricAnswers;

  return table;
};

const divider: DividerTemplate = {
  type: ElementType.Divider,
  id: "divider",
};

const checkpointsTables: TableCheckpointTemplate = {
  type: ElementType.TableCheckpoint,
  id: "checkpoint-table",
  required: false,
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
    numberOfPeopleServed,
    metrics,
  } of initiativesForState) {
    initiativePages.push({
      id,
      title,
      initiativeNumber,
      status: status ?? PageStatus.NOT_STARTED,
      type: PageType.Standard,
      sidebar: false,
      hideNavButtons: true,
      elements: [
        returnToInitiativesDashboard,
        initiativeHeader(title, initiativeNumber),
        initiativeInstructions,
        initiativeAccordion,
        initiativeNarrative(narrative),
        initiativeNumberOfPeopleServed(numberOfPeopleServed),
        metricTable(metrics),
        checkpointsHeader,
        checkpointsInstructions,
        initiativeAttachmentStatusInstructions,
        checkpointsTables,
        divider,
        BackToInitiativesButton,
      ],
    });
  }
  return initiativePages;
};
