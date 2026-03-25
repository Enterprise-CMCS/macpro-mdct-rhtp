import {
  PageStatus,
  PageType,
  Report,
  UpdateInitiativeOptions,
} from "../../../types/reports";
import {
  initiativeHeader,
  initiativeInstructions,
  initiativeInstructionsAccordion,
  initiativeNarrative,
  initiativeNumberOfPeopleServed,
  returnToInitiativesDashboard,
} from "../../../forms/2026/elements";
import {
  checkpointsTables,
  metricTable,
} from "../../../forms/2026/rhtp/rhtpElements";
import { Initiatives } from "../../constants";

// TODO - better array typing and parsing once we have initiatives by state
export const buildInitiativePages = (
  report: Report,
  initiatives: any[] = Initiatives
) => {
  for (const { id, name, initiativeNumber } of initiatives) {
    report.pages.push({
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
        metricTable,
        ...checkpointsTables,
      ],
    });
  }
};

export const updateInitiativeStatus = (
  report: Report,
  body: UpdateInitiativeOptions,
  initiativeId: string
) => {
  const { initiativeAbandon } = body;
  const initiativeIndex = report.pages.findIndex(
    (page) => page.id === initiativeId
  );
  if (report.pages[initiativeIndex].type !== PageType.Standard) return;

  if (initiativeAbandon) {
    report.pages[initiativeIndex].status = PageStatus.ABANDONED;
  }
};
