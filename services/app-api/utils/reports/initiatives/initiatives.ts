import {
  PageStatus,
  PageType,
  Report,
  UpdateInitiativeOptions,
} from "@rhtp/shared";

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
