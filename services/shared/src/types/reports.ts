// Shared types between frontend and backend
import { StateNames } from "../utils/constants";

export type StateAbbr = keyof typeof StateNames;

export const isStateAbbr = (abbr: string | undefined): abbr is StateAbbr => {
  return Object.keys(StateNames).includes(abbr as keyof typeof StateNames);
};

export enum ReportType {
  RHTP = "RHTP",
}

export enum RhtpSubType {
  ANNUAL = "ANNUAL",
  QUARTERLY = "QUARTERLY",
  FINAL = "FINAL",
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
  subType: RhtpSubType;
  subTypeKey: string;
  budgetPeriod: number;
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
  created: number;
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
  ActionTable = "actionTable",
  AttachmentTable = "attachmentTable",
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

export interface TableCheckpointTemplate {
  type: ElementType.TableCheckpoint;
  id: string;
  required: boolean;
  answer?: { id: string; checked: boolean }[];
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
    useOfFundsOptions: { label: string; value: string }[];
    recipientCategoryOptions: { label: string; value: string }[];
  };
  answer?: UseOfFundsTableItem[];
};

export type InitiativeComment = {
  name: string;
  date: string;
  comment?: string;
  statusChange?: string;
};

export enum AttachmentStatus {
  PENDING_REVIEW = "Pending Review", // State driven
  NEEDS_REVISION = "Needs Revision", // CMS driven
  LOCKED_FOR_SCORING = "Locked for Scoring", // CMS driven
  INFORMATIONAL = "Informational", // CMS driven
}

export type InitiativeAnswerProp = {
  attachment: UploadListProp;
  initiatives: string[];
  stage?: string;
  checkpoints?: string;
  status: AttachmentStatus;
  comments: InitiativeComment[];
};

export type AttachmentTableTemplate = {
  type: ElementType.AttachmentTable;
  id: string;
  answer?: InitiativeAnswerProp[];
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
  pluralLabel?: string;
  hintText: string;
  modal: {
    title: string;
    hintText?: string;
    elements: ActionModalElement[];
  };
  rows: ActionRowElement[];
  answer?: ActionAnswerShape[];
}
