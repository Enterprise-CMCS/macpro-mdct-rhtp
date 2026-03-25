// Shared types between frontend and backend

// STATES
export const StateNames = {
  AL: "Alabama",
  AK: "Alaska",
  AS: "American Samoa",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FM: "Federated States of Micronesia",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MH: "Marshall Islands",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  MP: "Northern Mariana Islands",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PW: "Palau",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VI: "Virgin Islands",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
} as const;

export type StateAbbr = keyof typeof StateNames;

export const isStateAbbr = (abbr: string | undefined): abbr is StateAbbr => {
  return Object.keys(StateNames).includes(abbr as keyof typeof StateNames);
};

export enum ReportType {
  RHTP = "RHTP",
}

// TODO: Update when the quarter naming has been decided on
export enum RhtpSubType {
  ANNUAL = 0,
  Q1 = 1,
  Q2 = 2,
  Q3 = 3,
  Q4 = 4,
}

export const isReportType = (
  reportType: string | undefined
): reportType is ReportType => {
  return Object.values(ReportType).includes(reportType as ReportType);
};

export interface CreateReportOptions {
  copyFromReportId?: string;
}

export interface CreateInitiativeOptions {
  initiativeName: string;
  initiativeNumber: string;
}

export interface UpdateInitiativeOptions {
  initiativeAbandon: boolean;
}

export interface ReportOptions {
  name: string;
  year: number;
  subType?: RhtpSubType;
  copyFromReportId?: string;
}

export enum ReportStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  SUBMITTED = "Submitted",
}

export enum AlertTypes {
  ERROR = "error",
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
}

export enum PageStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  ABANDONED = "Abandoned",
  COMPLETE = "Complete",
}

export interface Report extends ReportBase, ReportOptions {
  id: string;
  name: string;
  state: StateAbbr;
  created?: number;
  lastEdited?: number;
  lastEditedBy?: string;
  lastEditedByEmail?: string;
  submitted?: number;
  submissionDates?: { submitted: number }[];
  submittedBy?: string;
  submittedByEmail?: string;
  status: ReportStatus;
  submissionCount: number;
}

export type LiteReport = Omit<Report, "pages">;

export type ReportBase = {
  type: ReportType;
  subType?: RhtpSubType;
  year: number;
  pages: (
    | ParentPageTemplate
    | FormPageTemplate
    | InitiativePageTemplate
    | ReviewSubmitTemplate
  )[];
};

export type ParentPageTemplate = {
  id: PageId;
  childPageIds: PageId[];
  title?: undefined;
  type?: undefined;
  elements?: undefined;
  sidebar?: undefined;
  hideNavButtons?: undefined;
};

export type FormPageTemplate = {
  id: PageId;
  title: string;
  type: PageType;
  status?: PageStatus;
  elements: PageElement[];
  sidebar?: boolean;
  hideNavButtons?: boolean;
  childPageIds?: PageId[];
};

export interface InitiativePageTemplate extends FormPageTemplate {
  initiativeNumber: string;
}

export interface ReviewSubmitTemplate extends FormPageTemplate {
  submittedView: PageElement[];
}

export type PageId = string;

export type UploadListProp = {
  name: string;
  size: number;
  fileId: string;
};

export type CheckpointShape = {
  id: string;
  label: string;
  attachable: boolean;
};

export type CheckpointAnswerShape = {
  id: string;
  label: string;
  completed: boolean;
  attachments?: UploadListProp[];
};

export enum PageType {
  Standard = "standard",
  Modal = "modal",
  ReviewSubmit = "reviewSubmit",
}

export type AccordionGroupItem = {
  label: string;
  children: PageElement[];
};

export enum ElementType {
  Header = "header",
  SubHeader = "subHeader",
  Textbox = "textbox",
  TextAreaField = "textAreaField",
  NumberField = "numberField",
  Date = "date",
  Dropdown = "dropdown",
  Accordion = "accordion",
  Paragraph = "paragraph",
  Radio = "radio",
  Checkbox = "checkbox",
  ButtonLink = "buttonLink",
  StatusTable = "statusTable",
  LengthOfStayRate = "lengthOfStay",
  ReadmissionRate = "readmissionRate",
  StatusAlert = "statusAlert",
  Divider = "divider",
  SubmissionParagraph = "submissionParagraph",
  ListInput = "listInput",
  AttachmentArea = "attachmentArea",
  InitiativesTable = "initiativesTable",
  TableCheckpoint = "tableCheckpoint",
  AccordionGroup = "accordionGroup",
  UseOfFundsTable = "useOfFundsTable",
  AttachmentTable = "attachmentTable",
  ActionTable = "actionTable",
}

export type PageElement =
  | HeaderTemplate
  | SubHeaderTemplate
  | TextboxTemplate
  | NumberFieldTemplate
  | TextAreaBoxTemplate
  | DateTemplate
  | DropdownTemplate
  | AccordionTemplate
  | ParagraphTemplate
  | RadioTemplate
  | CheckboxTemplate
  | ButtonLinkTemplate
  | StatusTableTemplate
  | StatusAlertTemplate
  | DividerTemplate
  | SubmissionParagraphTemplate
  | ListInputTemplate
  | InitiativesTableTemplate
  | TableCheckpointTemplate
  | AccordionGroupTemplate
  | UseOfFundsTableTemplate
  | AttachmentAreaTemplate
  | AttachmentTableTemplate
  | ActionTableTemplate;

export type HideCondition = {
  controllerElementId: string;
  answer: string;
};

export type ChoiceTemplate = {
  label: string;
  value: string;
  checked?: boolean;
  checkedChildren?: PageElement[];
};

export type AccordionTemplate = {
  type: ElementType.Accordion;
  id: string;
  label: string;
  value: string;
};

export type ButtonLinkTemplate = {
  type: ElementType.ButtonLink;
  id: string;
  label: string;
  to: PageId;
  style?: string;
};

export type DividerTemplate = {
  type: ElementType.Divider;
  id: string;
};

export type InitiativesTableTemplate = {
  id: string;
  type: ElementType.InitiativesTable;
};

export type StatusTableTemplate = {
  type: ElementType.StatusTable;
  id: string;
  to: PageId;
};

export type SubmissionParagraphTemplate = {
  type: ElementType.SubmissionParagraph;
  id: string;
};

export enum HeaderIcon {
  Check = "check",
}

interface DisplayElementTemplate {
  type: ElementType;
  id: string;
  text: string;
}

export interface HeaderTemplate extends DisplayElementTemplate {
  type: ElementType.Header;
  icon?: HeaderIcon;
}

export interface ParagraphTemplate extends DisplayElementTemplate {
  type: ElementType.Paragraph;
  title?: string;
  weight?: string;
}

export interface StatusAlertTemplate extends DisplayElementTemplate {
  type: ElementType.StatusAlert;
  title: string;
  status: AlertTypes;
}

export interface SubHeaderTemplate extends DisplayElementTemplate {
  type: ElementType.SubHeader;
  helperText?: string;
  hideCondition?: HideCondition;
}

interface InputElementTemplate {
  type: ElementType;
  id: string;
  label: string;
  helperText?: string;
  required: boolean;
  quarterly?: boolean;
  disabled?: boolean;
}

export interface CheckboxTemplate extends InputElementTemplate {
  type: ElementType.Checkbox;
  choices: ChoiceTemplate[];
  answer?: string[];
}

export interface DateTemplate extends InputElementTemplate {
  type: ElementType.Date;
  answer?: string;
}

export interface DropdownTemplate extends InputElementTemplate {
  type: ElementType.Dropdown;
  options: ChoiceTemplate[];
  answer?: string;
}

export interface ListInputTemplate extends InputElementTemplate {
  type: ElementType.ListInput;
  fieldLabel: string;
  buttonText: string;
  answer?: string[];
  validation?: string;
}

export interface NumberFieldTemplate extends InputElementTemplate {
  type: ElementType.NumberField;
  answer?: number;
  hideCondition?: never;
}

export interface RadioTemplate extends InputElementTemplate {
  type: ElementType.Radio;
  choices: ChoiceTemplate[];
  answer?: string;
  hideCondition?: HideCondition;
  clickAction?: string;
}

export interface TextAreaBoxTemplate extends InputElementTemplate {
  type: ElementType.TextAreaField;
  answer?: string;
  hideCondition?: HideCondition;
}

export interface TextboxTemplate extends InputElementTemplate {
  type: ElementType.Textbox;
  answer?: string;
  hideCondition?: HideCondition;
}

export interface TableCheckpointTemplate extends InputElementTemplate {
  type: ElementType.TableCheckpoint;
  stage: number;
  checkpoints: CheckpointShape[];
  answer?: CheckpointAnswerShape[];
}

export interface AttachmentAreaTemplate extends InputElementTemplate {
  type: ElementType.AttachmentArea;
  answer?: UploadListProp[];
}

export interface AccordionGroupTemplate {
  type: ElementType.AccordionGroup;
  id: string;
  accordions: AccordionGroupItem[];
  required: boolean;
  answer?: boolean[];
}

export type UseOfFundsTableItem = {
  id: string;
  budgetPeriod: string;
  spentFunds: string;
  description: string;
  initiative: string;
  useOfFunds: string;
  recipientName: string;
  recipientCategory: string;
};

export type UseOfFundsTableTemplate = {
  type: ElementType.UseOfFundsTable;
  id: string;
  dropDownOptions: {
    budgetPeriodOptions: { label: string; value: string }[];
    initiativeOptions: { label: string; value: string }[];
    useOfFundsOptions: { label: string; value: string }[];
    recipientCategoryOptions: { label: string; value: string }[];
  };
  answer?: UseOfFundsTableItem[];
};

export type AttachmentTableTemplate = {
  type: ElementType.AttachmentTable;
  id: string;
  answer?: {
    attachment: { id: string; name: string };
    initiatives: string[];
    stage: number;
    checkpoints: string;
    status: string;
    comments: { name: string; date: string }[];
  }[];
};
export interface ActionElement {
  id: string;
  type: ElementType;
  disabled?: boolean;
}

export interface ActionRowElement extends ActionElement {
  header: string;
}

export interface ActionModalElement extends ActionElement {
  editOnly?: boolean;
  children?: { label: string; value: string }[];
  required: boolean;
}

export type ActionAnswerShape = { id: string; value: string | number }[];

export interface ActionTableTemplate {
  type: ElementType.ActionTable;
  id: string;
  label: string;
  hintText: string;
  modal: {
    title: string;
    hintText?: string;
    elements: ActionModalElement[];
  };
  rows: ActionRowElement[];
  answer?: ActionAnswerShape[];
}
