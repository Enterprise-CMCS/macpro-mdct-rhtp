import { ReportType, ReportBase } from "../../../types/reports";
import { generalInformation } from "./pages/general-information";
import { initiativeAttachments } from "./pages/initiative-attachments";
import { buildInitiativePages } from "./pages/initiatives/initiatives";
import { initiativesTable } from "./pages/initiatives-table";
import { reviewAndSubmit } from "./pages/review-and-submit";
import { buildStatePolicyCommitments } from "./pages/state-policy-commitments/state-policy-commitments";
import { sustainabilityAndHighlights } from "./pages/sustainability-and-highlights";
import { useOfFunds } from "./pages/use-of-funds";

export const rhtpReportTemplate = (state: string): ReportBase => ({
  type: ReportType.RHTP,
  year: 2026,
  pages: [
    {
      id: "root",
      childPageIds: [
        "general-information",
        "initiative-attachments",
        "initiatives",
        "state-policy-commitments",
        "use-of-funds",
        "sustainability-and-highlights",
        "review-submit",
      ],
    },
    generalInformation,
    initiativeAttachments,
    initiativesTable,
    buildStatePolicyCommitments(state),
    useOfFunds,
    sustainabilityAndHighlights,
    reviewAndSubmit,
    ...buildInitiativePages(state),
  ],
});
