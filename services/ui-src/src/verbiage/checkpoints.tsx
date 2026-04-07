export const checkpointsList = [
  {
    id: "checkpoint-0",
    stage: 0,
    label: "Planning",
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
  },
  {
    id: "checkpoint-1",
    stage: 1,
    label: "Project Preparation",
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
  },
  {
    id: "checkpoint-2",
    stage: 2,
    label: "Early Implementation",
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
  },
  {
    id: "checkpoint-3",
    stage: 3,
    label: "Midway Implementation",
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
  },
  {
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
  },
  {
    id: "checkpoint-5",
    stage: 5,
    label: "Full Implementation",
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
  },
];