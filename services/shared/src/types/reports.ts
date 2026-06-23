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
  mockDate?: string;
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
  subType: RhtpSubType;
  subTypeKey: string;
  budgetPeriod: number;
  pages: ReportPages;
  copyFromReportId?: string;
}

export enum ReportStatus {
  NOT_STARTED = "Not started",
  IN_PROGRESS = "In progress",
  SUBMITTED = "Submitted",
  ACCEPTED = "Accepted",
}

export const CompletedReportStatuses = [
  ReportStatus.SUBMITTED,
  ReportStatus.ACCEPTED,
];

export const isCompleteStatus = (status: ReportStatus | undefined) => {
  return status && CompletedReportStatuses.includes(status);
};

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

export enum CommentType {
  REPORT = "report",
  ATTACHMENT = "attachment",
}

export type Comment = {
  contextId: string;
  created: number;
  id: string;
  author: string;
  authorEmail: string;
  isInternal: boolean;
  type: CommentType;
  parentReportId?: string;
  comment?: string;
  statusChange?: AttachmentStatus | ReportStatus;
};

export interface Report extends ReportOptions {
  id: string;
  type: ReportType;
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

export type ReportPage =
  | ParentPageTemplate
  | FormPageTemplate
  | InitiativePageTemplate
  | ReviewSubmitTemplate;

export type ReportPages = ReportPage[];

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
  StatusAlert = "statusAlert",
  Divider = "divider",
  SubmissionParagraph = "submissionParagraph",
  ListInput = "listInput",
  AttachmentArea = "attachmentArea",
  InitiativesTable = "initiativesTable",
  TableCheckpoint = "tableCheckpoint",
  AccordionGroup = "accordionGroup",
  UseOfFundsAttachment = "useOfFundsAttachment",
  ActionTable = "actionTable",
  AttachmentTable = "attachmentTable",
  SubmitForReview = "submitForReview",
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
  | UseOfFundsAttachmentTemplate
  | AttachmentAreaTemplate
  | AttachmentTableTemplate
  | ActionTableTemplate
  | SubmitForReviewTemplate;

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
  style?: string;
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
  mask?: MaskType;
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
  uploadedSubLabel: string;
  answer?: UploadListProp[];
}

export interface AccordionGroupTemplate {
  type: ElementType.AccordionGroup;
  id: string;
  accordions: AccordionGroupItem[];
  required: boolean;
  answer?: boolean[];
}

export type UseOfFundsAttachmentTemplate = {
  type: ElementType.UseOfFundsAttachment;
  id: string;
  answer?: UploadListProp[];
  required: boolean;
};

export enum AttachmentStatus {
  PENDING_REVIEW = "Pending Review", // State driven
  NEEDS_REVISION = "Needs Revision", // CMS driven
  LOCKED_FOR_SCORING = "Locked for Scoring", // CMS driven
  INFORMATIONAL = "Informational",
  ARCHIVED = "Archived",
}

export const FileStatusOptions = Object.values(AttachmentStatus).map(
  (status) => {
    return { label: status, value: status };
  }
);

export type InitiativeAnswerProp = {
  attachment: UploadListProp;
  initiatives: string[];
  stage?: string;
  checkpoint?: string;
  status: AttachmentStatus;
  canDelete: boolean;
};

export type AttachmentTableTemplate = {
  type: ElementType.AttachmentTable;
  id: string;
  answer?: InitiativeAnswerProp[];
};

export enum MaskType {
  CommaSeparated = "CommaSeparated",
}

export interface ActionElement {
  id: string;
  type: ElementType;
  disabled?: boolean;
  mask?: MaskType;
  hintText?: string;
}

export interface ActionRowElement extends ActionElement {
  header: string;
}

export interface ActionModalElement extends ActionElement {
  label: string;
  editOnly?: boolean;
  children?: { label: string; value: string }[];
  required: boolean;
  mask?: MaskType;
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
  quarterly?: boolean;
  disabled?: boolean;
  required: boolean;
}

export interface SubmitForReviewTemplate {
  type: ElementType.SubmitForReview;
  id: string;
}

export interface RhtpSubTypeData {
  [key: string]: {
    name: string;
    dateRangeString: string;
    openDate: number;
    startDate: number;
    endDate: number;
    nextReportSubType: string;
    type: RhtpSubType;
    budgetPeriod: number;
    reportTemplateBuilder?: (state: string) => ReportPages;
  };
}

// included in this file to prevent cyclical declaration between constants and types
export const RhtpSubTypeMap: RhtpSubTypeData = {
  A1: {
    name: "Annual Report 1",
    dateRangeString: "12/29/2025-7/31/2026",
    openDate: 1766984400000, //using start date for now, actual date TBD
    startDate: 1766984400000,
    endDate: 1785470400000,
    nextReportSubType: "Q1",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 1,
  },
  Q1: {
    name: "Quarterly Report 1",
    dateRangeString: "8/1/2026-10/30/2026",
    openDate: 1790740800000, //9.30.2026
    startDate: 1785556800000,
    endDate: 1793332800000,
    nextReportSubType: "Q2",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 1,
  },
  Q2: {
    name: "Quarterly Report 2",
    dateRangeString: "10/31/2026-1/30/2027",
    openDate: 1798520400000, //12.29.2026
    startDate: 1793419200000,
    endDate: 1801285200000,
    nextReportSubType: "Q3",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 2,
  },
  Q3: {
    name: "Quarterly Report 3",
    dateRangeString: "1/31/2027-4/30/2027",
    openDate: 1806552000000, //4.1.2027
    startDate: 1801371600000,
    endDate: 1809057600000,
    nextReportSubType: "A2",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 2,
  },
  A2: {
    name: "Annual Report 2",
    dateRangeString: "8/1/2026-7/31/2027",
    openDate: 1814328000000, //6.30.2027
    startDate: 1785556800000,
    endDate: 1817006400000,
    nextReportSubType: "Q4",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 2,
  },
  Q4: {
    name: "Quarterly Report 4",
    dateRangeString: "8/1/2027-10/30/2027",
    openDate: 1822276800000, //9.30.2027
    startDate: 1817092800000,
    endDate: 1824868800000,
    nextReportSubType: "Q5",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 2,
  },
  Q5: {
    name: "Quarterly Report 5",
    dateRangeString: "10/31/2027-1/30/2028",
    openDate: 1830056400000, //  12.29.2027
    startDate: 1824955200000,
    endDate: 1832821200000,
    nextReportSubType: "Q6",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 3,
  },
  Q6: {
    name: "Quarterly Report 6",
    dateRangeString: "1/31/2028-4/30/2028",
    openDate: 1837915200000, //3.29.2028
    startDate: 1832907600000,
    endDate: 1840680000000,
    nextReportSubType: "A3",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 3,
  },
  A3: {
    name: "Annual Report 3",
    dateRangeString: "8/1/2027-7/31/2028",
    openDate: 1845950400000, //6.30.2028
    startDate: 1817092800000,
    endDate: 1848628800000,
    nextReportSubType: "Q7",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 3,
  },
  Q7: {
    name: "Quarterly Report 7",
    dateRangeString: "8/1/2028-10/30/2028",
    openDate: 1853899200000, //9.30.2028
    startDate: 1848715200000,
    endDate: 1856491200000,
    nextReportSubType: "Q8",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 3,
  },
  Q8: {
    name: "Quarterly Report 8",
    dateRangeString: "10/31/2028-1/30/2029",
    openDate: 1861678800000, //12.29.2028
    startDate: 1856577600000,
    endDate: 1864443600000,
    nextReportSubType: "Q9",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 4,
  },
  Q9: {
    name: "Quarterly Report 9",
    dateRangeString: "1/31/2029-4/30/2029",
    openDate: 1869710400000, //4.1.2029
    startDate: 1864530000000,
    endDate: 1872216000000,
    nextReportSubType: "A4",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 4,
  },
  A4: {
    name: "Annual Report 4",
    dateRangeString: "8/1/2028-7/31/2029",
    openDate: 1877486400000, //6.30.2029
    startDate: 1848715200000,
    endDate: 1880164800000,
    nextReportSubType: "Q10",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 4,
  },
  Q10: {
    name: "Quarterly Report 10",
    dateRangeString: "8/1/2029-10/30/2029",
    openDate: 1885435200000, //9.30.2029
    startDate: 1880251200000,
    endDate: 1888027200000,
    nextReportSubType: "Q11",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 4,
  },
  Q11: {
    name: "Quarterly Report 11",
    dateRangeString: "10/31/2029-1/30/2030",
    openDate: 1893214800000, //12.29.2029
    startDate: 1888113600000,
    endDate: 1895979600000,
    nextReportSubType: "Q12",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 5,
  },
  Q12: {
    name: "Quarterly Report 12",
    dateRangeString: "1/31/2030-4/30/2030",
    openDate: 1901246400000, //4.1.2030
    startDate: 1896066000000,
    endDate: 1903752000000,
    nextReportSubType: "A5",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 5,
  },
  A5: {
    name: "Annual Report 5",
    dateRangeString: "8/1/2029-7/31/2030",
    openDate: 1909022400000, //6.30.2030
    startDate: 1880251200000,
    endDate: 1911700800000,
    nextReportSubType: "Q13",
    type: RhtpSubType.ANNUAL,
    budgetPeriod: 5,
  },
  Q13: {
    name: "Quarterly Report 13",
    dateRangeString: "8/1/2030-10/30/2030",
    openDate: 1916971200000, //9.30.2030
    startDate: 1911787200000,
    endDate: 1919563200000,
    nextReportSubType: "FINAL",
    type: RhtpSubType.QUARTERLY,
    budgetPeriod: 5,
  },
  FINAL: {
    name: "Final Report",
    dateRangeString: "12/29/2025-10/30/2030",
    openDate: 1956286800000, //12.29.2031
    startDate: 1766984400000,
    endDate: 1919563200000,
    nextReportSubType: "",
    type: RhtpSubType.FINAL,
    budgetPeriod: 5,
  },
};
