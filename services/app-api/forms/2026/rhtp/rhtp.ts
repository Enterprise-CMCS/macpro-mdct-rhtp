import { ReportPages } from "@rhtp/shared";
import { buildGeneralInformationPage } from "./pages/general-information/general-information";
import { initiativeAttachments } from "./pages/initiative-attachments";
import { buildInitiativePages } from "./pages/initiatives/initiatives";
import { initiativesTable } from "./pages/initiatives-table";
import { reviewAndSubmit } from "./pages/review-and-submit";
import { buildStatePolicyCommitments } from "./pages/state-policy-commitments/state-policy-commitments";
import { buildSustainabilityAndHighlightsPage } from "./pages/sustainability-and-highlights/sustainability-and-highlights";
import { obligatedAndSpentFunds } from "./pages/obligated-and-spent-funds";

export const rhtpReportTemplate = async (
  state: string
): Promise<ReportPages> => [
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
  await buildGeneralInformationPage(state),
  initiativesTable,
  initiativeAttachments,
  await buildStatePolicyCommitments(state),
  obligatedAndSpentFunds,
  await buildSustainabilityAndHighlightsPage(state),
  reviewAndSubmit,
  ...(await buildInitiativePages(state)),
];
