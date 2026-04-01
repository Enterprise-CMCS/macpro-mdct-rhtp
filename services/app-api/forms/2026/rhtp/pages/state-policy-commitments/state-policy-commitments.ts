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

// TODO build out multiple dropdown types once we know more
const commitmentStatusDropdown = (
  status: string = "Not yet started"
): DropdownTemplate => ({
  type: ElementType.Dropdown,
  id: "commitment-status",
  label: "Current Status",
  helperText: "This is the hint text",
  options: [
    { label: "Not yet started", value: "Not yet started" },
    { label: "In progress", value: "In progress" },
    { label: "Implemented", value: "Implemented" },
    {
      label: "Commitment abandoned",
      value: "Commitment abandoned",
    },
  ],
  required: true,
  answer: status,
});

const commitmentLinkListInput: ListInputTemplate = {
  type: ElementType.ListInput,
  id: "commitment-links",
  label: "Supporting Evidence: Links",
  helperText: "This is the hint text",
  fieldLabel: "Link",
  buttonText: "Add link",
  validation: "link",
  required: false,
};

const commitmentAttachmentArea: AttachmentAreaTemplate = {
  type: ElementType.AttachmentArea,
  id: "commitment-attachments",
  label: "Supporting Evidence: Attachments",
  helperText: "This is the hint text",
  required: false,
};

const commitmentComments: TextAreaBoxTemplate = {
  id: "commitment-comment",
  type: ElementType.TextAreaField,
  label: "Optional Comments/Notes",
  helperText: "This is the hint text",
  required: false,
};

const buildCommitments = (
  state: string,
  statePolicyCommitments: any = STATE_POLICY_COMMITMENTS
) => {
  if (!(state in statePolicyCommitments)) return [];
  const commitmentsForState = statePolicyCommitments[state];
  const commitments = [];
  for (const { label, status } of commitmentsForState) {
    commitments.push({
      label,
      children: [
        commitmentStatusDropdown(status),
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
      text: "Instructions go here that need to be seen at all times. Provide details and context to help the user complete this page.",
    },
    {
      type: ElementType.AccordionGroup,
      id: "state-policy-commitments-group",
      accordions: [...buildCommitments(state)],
      required: true,
    },
  ],
});
