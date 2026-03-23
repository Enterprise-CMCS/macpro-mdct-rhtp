import { ReportType, ReportBase } from "../../../types/reports";
import { generalInformation } from "./pages/generalInformation";
import { initiativesTable } from "./pages/initiativesTable";
import { reviewAndSubmit } from "./pages/reviewAndSubmit";
import { statePolicyCommitments } from "./pages/statePolicyCommitments";
import { sustainabilityAndHighlights } from "./pages/sustainabilityAndHighlights";
import { useOfFunds } from "./pages/useOfFunds";

// TODO build out list by state
export enum Initiatives {
  "initiative-1" = "Initiative 1",
}

export const rhtpReportTemplate: ReportBase = {
  type: ReportType.RHTP,
  year: 2026,
  pages: [
    {
      id: "root",
      childPageIds: [
        "general-information",
        "initiatives",
        "state-policy-commitments",
        "use-of-funds",
        "sustainability-and-highlights",
        "review-submit",
      ],
    },
    generalInformation,
    initiativesTable,
    statePolicyCommitments,
    useOfFunds,
    sustainabilityAndHighlights,
    reviewAndSubmit,
  ],
};
