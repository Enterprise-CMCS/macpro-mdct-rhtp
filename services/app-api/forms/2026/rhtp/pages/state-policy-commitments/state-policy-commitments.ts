import {
  AttachmentAreaTemplate,
  DropdownTemplate,
  ElementType,
  FormPageTemplate,
  ListInputTemplate,
  PageType,
  ParagraphTemplate,
  TextAreaBoxTemplate,
  UserRoles,
} from "@rhtp/shared";
import STATE_POLICY_COMMITMENTS from "./data/commitments.json";
import { cmsEvaluationStatusDefault, getDropdownOptions } from "./constants";

const commitmentStatusDropdown = (
  label: string,
  status: string = "Not yet started"
): DropdownTemplate => ({
  type: ElementType.Dropdown,
  id: "commitment-status",
  label: "Current Status",
  options: getDropdownOptions(label),
  required: true,
  answer: status,
});

const commitmentAttachmentArea = (label: string): AttachmentAreaTemplate => ({
  type: ElementType.AttachmentArea,
  id: "commitment-attachments",
  label: "Attachments",
  helperText: "Upload state legislation.",
  subLabel: {
    upload: `<b>State Policy Commitment:</b> ${label}`,
    uploaded:
      "These files have been attached to the state policy commitment above.",
  },
  required: false,
});
const cmsStatusEvaluation = (label: string): DropdownTemplate => {
  const dropdownOptions = [
    cmsEvaluationStatusDefault,
    ...getDropdownOptions(label),
  ];

  return {
    type: ElementType.Dropdown,
    id: "cms-status-evaluation",
    label: "CMS Status Evaluation",
    options: dropdownOptions,
    required: true,
    answer: cmsEvaluationStatusDefault.value,
    editByRole: [UserRoles.ADMIN, UserRoles.PROJECT_OFFICER],
  };
};

const commitmentLinkListInput: ListInputTemplate = {
  type: ElementType.ListInput,
  id: "commitment-links",
  label: "Links",
  helperText: "Add URL to exact policy.",
  fieldLabel: "Link",
  buttonText: "Add link",
  validation: "link",
  required: false,
};

const commitmentSupportParagraph: ParagraphTemplate = {
  type: ElementType.Paragraph,
  id: "commitment-support-paragraph",
  title: "Supporting Evidence",
  text: "States should only submit legislation links and attachments as acceptable evidence for their State policy commitments. CMS will not accept press releases or promotional links/attachments as substantial evidence.",
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
  statePolicyCommitments: {
    [key: string]: { label: string; status: string }[];
  } = STATE_POLICY_COMMITMENTS
) => {
  if (!(state in statePolicyCommitments)) return [];
  const commitmentsForState = statePolicyCommitments[state];
  const commitments = [];
  for (const { label, status } of commitmentsForState) {
    commitments.push({
      label,
      elements: [
        commitmentStatusDropdown(label, status),
        cmsStatusEvaluation(label),
        commitmentSupportParagraph,
        commitmentLinkListInput,
        commitmentAttachmentArea(label),
        commitmentNotes,
      ],
    });
  }
  return commitments;
};

export const buildStatePolicyCommitments = (
  state: string
): FormPageTemplate => ({
  id: "state-policy-commitments",
  title: "State Policy Commitments",
  type: PageType.Standard,
  sidebar: true,
  elements: [
    {
      type: ElementType.Header,
      id: "state-policy-commitments-header",
      text: "State Policy Commitments",
    },
    {
      type: ElementType.Paragraph,
      id: "initiatives-instructions",
      text: "The commitments listed here are based on those identified in a State's approved application. Expand each one to update its status, evidence, and comments.",
    },
    {
      type: ElementType.AccordionGroup,
      id: "state-policy-commitments-group",
      accordions: [...buildCommitments(state)],
      required: true,
    },
  ],
});
