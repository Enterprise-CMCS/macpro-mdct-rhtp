import {
  AlertTypes,
  AttachmentAreaTemplate,
  DropdownTemplate,
  ElementType,
  FormPageTemplate,
  ListInputTemplate,
  PageType,
  ParagraphTemplate,
  TextAreaBoxTemplate,
} from "@rhtp/shared";
import {
  cmsEvaluationStatusDefault,
  cmsCommitmentFulfilled,
  getDropdownOptions,
} from "./constants";
import { getJsonFromS3 } from "../../../../../libs/s3-json-lib";

const COMMITMENTS_KEY = "import/commitments.json";

type StatePolicyCommitmentsData = {
  [key: string]: { label: string; status: string; link: string }[];
};

const commitmentStatusDropdown = (
  label: string,
  status: string = "Not yet started"
): DropdownTemplate => ({
  type: ElementType.Dropdown,
  id: "commitment-status",
  label: "Current Status",
  options: getDropdownOptions(label),
  required: false,
  answer: status,
});

const commitmentAttachmentArea = (label: string): AttachmentAreaTemplate => ({
  type: ElementType.AttachmentArea,
  id: "commitment-attachments",
  label: "Attachments",
  subLabel: `<b>State Policy Commitment:</b> ${label}`,
  message: label,
  helperText: "Upload state legislation.",
  required: false,
});
const cmsStatusEvaluation = (label: string): DropdownTemplate => {
  const dropdownOptions = [
    cmsEvaluationStatusDefault,
    ...getDropdownOptions(label),
    cmsCommitmentFulfilled,
  ];

  return {
    type: ElementType.Dropdown,
    id: "cms-status-evaluation",
    label: "CMS Status Evaluation",
    options: dropdownOptions,
    required: false,
    answer: cmsEvaluationStatusDefault.value,
    onlyCmsAdminCanEdit: true,
    cmsAdminCanEditInSubmitted: true,
  };
};

const commitmentLinkListInput = (link?: string): ListInputTemplate => ({
  type: ElementType.ListInput,
  id: "commitment-links",
  label: "Links",
  helperText: "Add URL to exact policy.",
  fieldLabel: "Link",
  buttonText: "Add link",
  validation: "link",
  required: false,
  answer: link ? [link] : [],
});

const commitmentSupportParagraph: ParagraphTemplate = {
  type: ElementType.Paragraph,
  id: "commitment-support-paragraph",
  title: "Supporting Evidence",
  text: "States should only submit legislation links and attachments as acceptable evidence for their State policy action commitments. CMS will not accept press releases or promotional links/attachments as substantial evidence.",
  style: "hint",
};

const commitmentNotes: TextAreaBoxTemplate = {
  id: "commitment-notes",
  type: ElementType.TextAreaField,
  label: "Notes",
  helperText:
    "Include any additional information about this policy commitment that you would like CMS to be aware of.",
  required: false,
};

const buildCommitments = (
  state: string,
  statePolicyCommitments: StatePolicyCommitmentsData
) => {
  if (!(state in statePolicyCommitments)) return [];
  const commitmentsForState = statePolicyCommitments[state];
  const commitments = [];
  for (const { label, status, link } of commitmentsForState) {
    commitments.push({
      label,
      elements: [
        commitmentStatusDropdown(label, status),
        cmsStatusEvaluation(label),
        commitmentSupportParagraph,
        commitmentLinkListInput(link),
        commitmentAttachmentArea(label),
        commitmentNotes,
      ],
    });
  }
  return commitments;
};

const buildPage = (
  state: string,
  statePolicyCommitments: StatePolicyCommitmentsData
): FormPageTemplate => ({
  id: "state-policy-commitments",
  title: "State Policy Action Commitments",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "state-policy-commitments-header",
      text: "State Policy Action Commitments",
    },
    {
      type: ElementType.Paragraph,
      id: "initiatives-instructions",
      text: "The commitments listed here are based on those identified in a State's approved application. Expand each one to update its status, evidence, and comments.",
    },
    {
      type: ElementType.AccordionGroup,
      id: "state-policy-commitments-group",
      accordions: [...buildCommitments(state, statePolicyCommitments)],
      required: false,
    },
    {
      type: ElementType.StatusAlert,
      id: "state-policy-empty-alert",
      status: AlertTypes.INFO,
      title: "No State Policy Action Commitments Found",
      text: "No state policy action commitments are on file for your state. If you believe this is an error, please contact your CMS Project Officer.",
      for: "state-policy-commitments-group",
    },
  ],
});

// fetches from S3 when no data is given; pass data explicitly (e.g. in tests) to skip the S3 call
export const buildStatePolicyCommitments = (
  state: string,
  statePolicyCommitments?: StatePolicyCommitmentsData
): FormPageTemplate | Promise<FormPageTemplate> => {
  if (statePolicyCommitments) return buildPage(state, statePolicyCommitments);
  return getJsonFromS3<StatePolicyCommitmentsData>(COMMITMENTS_KEY).then(
    (fetched) => buildPage(state, fetched ?? {})
  );
};
