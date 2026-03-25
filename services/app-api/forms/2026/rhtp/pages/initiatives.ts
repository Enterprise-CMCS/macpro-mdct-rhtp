import {
  AccordionTemplate,
  ButtonLinkTemplate,
  ElementType,
  HeaderTemplate,
  NumberFieldTemplate,
  PageElement,
  PageType,
  ParagraphTemplate,
  TextAreaBoxTemplate,
} from "@rhtp/shared";

// TODO build out list by state
export const INITIATIVES = [
  {
    id: "416c4eab-7658-4f5d-a559-a8ef616f86df",
    name: "First Initiative",
    initiativeNumber: "123",
  },
  {
    id: "47129b18-a036-46ae-9e24-ecf3ed666bc5",
    name: "Second Initiative",
    initiativeNumber: "456",
  },
];

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

const initiativeNarrative: TextAreaBoxTemplate = {
  type: ElementType.TextAreaField,
  id: "initiative-narrative",
  label: "Narrative",
  required: true,
};

const initiativeNumberOfPeopleServed: NumberFieldTemplate = {
  type: ElementType.NumberField,
  id: "initiative-number-of-people-served",
  label: "Number of people served",
  required: true,
};

const checkpointsTables: PageElement[] = [
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-0",
    label: "Planning",
    stage: 0,
    checkpoints: [
      {
        id: "planning-1",
        label: "Establish governance",
        attachable: true,
      },
      {
        id: "planning-2",
        label: "Submit project plan to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-1",
    label: "Project Preparation",
    stage: 1,
    checkpoints: [
      {
        id: "project-prop-1",
        label: "CMS approval of project plan",
        attachable: false,
      },
      {
        id: "project-prop-2",
        label: "Launch initiative",
        attachable: true,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-2",
    label: "Early Implementation",
    stage: 2,
    checkpoints: [
      {
        id: "early-implementation-1",
        label: "Continue initiative",
        attachable: true,
      },
      {
        id: "early-implementation-2",
        label: "Achieve at least one milestone",
        attachable: true,
      },
      {
        id: "early-implementation-3",
        label: "Establish metric reporting methodology",
        attachable: true,
      },
      {
        id: "early-implementation-4",
        label: "Submit updated project plan to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-3",
    label: "Midway Implementation",
    stage: 3,
    checkpoints: [
      {
        id: "midway-imp-1",
        label: "CMS approval of updated project plan",
        attachable: false,
      },
      {
        id: "midway-imp-2",
        label: "Complete Q2 2028 milestones",
        attachable: true,
      },
      {
        id: "midway-imp-3",
        label: "Report initial metric progress to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-4",
    label: "Project for Completion",
    stage: 4,
    checkpoints: [
      {
        id: "project-for-complete-1",
        label: "Share final deliverables plan with CMS",
        attachable: false,
      },
      {
        id: "project-for-complete-2",
        label: "CMS approval of final deliverables plan",
        attachable: false,
      },
      {
        id: "project-for-complete-3",
        label: "Complete post-program planning",
        attachable: true,
      },
    ],
    required: true,
  },
  {
    type: ElementType.TableCheckpoint,
    id: "checkpoint-5",
    label: "Full Implementation",
    stage: 5,
    checkpoints: [
      {
        id: "full-implementation-1",
        label: "Submit final deliverables for CMS",
        attachable: false,
      },
      {
        id: "full-implementation-2",
        label: "Complete all 2030 milestones",
        attachable: true,
      },
      {
        id: "full-implementation-3",
        label: "Report updated metric progress to CMS",
        attachable: false,
      },
    ],
    required: true,
  },
];

// TODO - better array typing and parsing once we have initiatives by state
export const buildInitiativePages = (initiatives: any[] = INITIATIVES) => {
  const initiativePages = [];
  for (const { id, name, initiativeNumber } of initiatives) {
    initiativePages.push({
      id,
      title: name,
      initiativeNumber,
      type: PageType.Standard,
      sidebar: false,
      elements: [
        returnToInitiativesDashboard,
        initiativeHeader(name),
        initiativeInstructions,
        initiativeInstructionsAccordion,
        initiativeNarrative,
        initiativeNumberOfPeopleServed,
        ...checkpointsTables,
      ],
    });
  }
  return initiativePages;
};
