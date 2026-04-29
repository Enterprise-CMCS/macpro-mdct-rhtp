import {
  AttachmentAreaTemplate,
  DropdownTemplate,
  ElementType,
  FormPageTemplate,
  ListInputTemplate,
  PageType,
  TextAreaBoxTemplate,
} from "@rhtp/shared";
import STATE_POLICY_COMMITMENTS from "./data/commitments.json";
import { getDropdownOptions } from "./constants";

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

const commitmentLinkListInput: ListInputTemplate = {
  type: ElementType.ListInput,
  id: "commitment-links",
  label: "Supporting Evidence: Links",
  helperText: "Add links to any supporting evidence materials posted online.",
  fieldLabel: "Link",
  buttonText: "Add link",
  validation: "link",
  required: false,
};

const commitmentAttachmentArea: AttachmentAreaTemplate = {
  type: ElementType.AttachmentArea,
  id: "commitment-attachments",
  label: "Supporting Evidence: Attachments",
  helperText: "Upload files to submit as supporting evidence",
  uploadedSubLabel:
    "These files have been attached to the state policy commitment above.",
  required: false,
};

const commitmentComments: TextAreaBoxTemplate = {
  id: "commitment-comment",
  type: ElementType.TextAreaField,
  label: "Notes and comments",
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
      children: [
        commitmentStatusDropdown(label, status),
        commitmentLinkListInput,
        commitmentAttachmentArea,
        commitmentComments,
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
      text: "The commitments listed here are based on those your state submitted to CMS. Expand each one to update its status, evidence, and comments.",
    },
    {
      type: ElementType.AccordionGroup,
      id: "state-policy-commitments-group",
      accordions: [...buildCommitments(state)],
      required: true,
    },
  ],
});
