import { ReportPages } from "@rhtp/shared";
import { generalInformation } from "./pages/general-information";
import { initiativeAttachments } from "./pages/initiative-attachments";
import { buildInitiativePages } from "./pages/initiatives/initiatives";
import { initiativesTable } from "./pages/initiatives-table";
import { reviewAndSubmit } from "./pages/review-and-submit";
import { buildStatePolicyCommitments } from "./pages/state-policy-commitments/state-policy-commitments";
import { sustainabilityAndHighlights } from "./pages/sustainability-and-highlights";
import { obligatedAndSpentFunds } from "./pages/obligated-and-spent-funds";

export const rhtpReportTemplate = (state: string): ReportPages => [
  {
    id: "root",
    childPageIds: [
      "general-information",
      "initiatives",
      "initiative-attachments",
      "state-policy-commitments",
      "obligated-and-spent-funds",
      "sustainability-and-highlights",
      "review-submit",
    ],
  },
  generalInformation,
  initiativesTable,
  initiativeAttachments,
  buildStatePolicyCommitments(state),
  obligatedAndSpentFunds,
  sustainabilityAndHighlights,
  reviewAndSubmit,
  ...buildInitiativePages(state),
];
