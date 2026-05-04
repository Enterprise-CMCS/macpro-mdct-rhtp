import { dropdownEmptyOption } from "@rhtp/shared";

export const stageList = [
  {
    id: "stage-0",
    stage: 0,
    label: "Planning",
    checkpoints: [
      {
        id: "planning-1",
        checkpointNumber: "0.1",
        label: "Establish governance",
        attachable: true,
      },
      {
        id: "planning-2",
        checkpointNumber: "0.2",
        label: "Submit project plan to CMS",
        attachable: true,
      },
    ],
  },
  {
    id: "stage-1",
    stage: 1,
    label: "Project Preparation",
    checkpoints: [
      {
        id: "project-prop-1",
        checkpointNumber: "1.1",
        label: "CMS approval of project plan",
        attachable: false,
      },
      {
        id: "project-prop-2",
        checkpointNumber: "1.2",
        label: "Launch initiative",
        attachable: true,
      },
    ],
  },
  {
    id: "stage-2",
    stage: 2,
    label: "Early Implementation",
    checkpoints: [
      {
        id: "early-implementation-1",
        checkpointNumber: "2.1",
        label: "Continue initiative activities",
        attachable: true,
      },
      {
        id: "early-implementation-2",
        checkpointNumber: "2.2",
        label: "Achieve at least one milestone",
        attachable: true,
      },
      {
        id: "early-implementation-3",
        checkpointNumber: "2.3",
        label: "Establish metric reporting methodology",
        attachable: true,
      },
      {
        id: "early-implementation-4",
        checkpointNumber: "2.4",
        label: "Submit updated project plan to CMS",
        attachable: true,
      },
    ],
  },
  {
    id: "stage-3",
    stage: 3,
    label: "Midway Implementation",
    checkpoints: [
      {
        id: "midway-imp-1",
        checkpointNumber: "3.1",
        label: "CMS approval of updated project plan",
        attachable: false,
      },
      {
        id: "midway-imp-2",
        checkpointNumber: "3.2",
        label: "Complete Q2 2028 milestones",
        attachable: true,
      },
      {
        id: "midway-imp-3",
        checkpointNumber: "3.3",
        label: "Report initial metric progress to CMS",
        attachable: true,
      },
    ],
  },
  {
    id: "stage-4",
    label: "Preparing for Completion",
    stage: 4,
    checkpoints: [
      {
        id: "project-for-complete-1",
        checkpointNumber: "4.1",
        label: "Share final deliverables plan with CMS",
        attachable: true,
      },
      {
        id: "project-for-complete-2",
        checkpointNumber: "4.2",
        label: "CMS approval of final deliverables plan",
        attachable: false,
      },
      {
        id: "project-for-complete-3",
        checkpointNumber: "4.3",
        label: "Complete post-program planning",
        attachable: true,
      },
    ],
  },
  {
    id: "stage-5",
    stage: 5,
    label: "Full Implementation",
    checkpoints: [
      {
        id: "full-implementation-1",
        checkpointNumber: "5.1",
        label: "Submit final deliverables for CMS",
        attachable: true,
      },
      {
        id: "full-implementation-2",
        checkpointNumber: "5.2",
        label: "Complete all 2030 milestones",
        attachable: true,
      },
      {
        id: "full-implementation-3",
        checkpointNumber: "5.3",
        label: "Report updated metric progress to CMS",
        attachable: true,
      },
    ],
  },
];

export const checkpointList = stageList.flatMap((list) => list.checkpoints);
export const checkpointAttachableOptions = checkpointList.reduce(
  (previous: any[], { id, checkpointNumber, label, attachable }) => {
    if (attachable) {
      const option = {
        label: `${checkpointNumber} ${label}`,
        value: id,
      };
      previous.push(option);
    }
    return previous;
  },
  [dropdownEmptyOption]
);

export const getStageIdByCheckpointId = (checkpoint: string) =>
  stageList.find((stage) =>
    stage.checkpoints.find(({ id }) => id === checkpoint)
  )?.id;
