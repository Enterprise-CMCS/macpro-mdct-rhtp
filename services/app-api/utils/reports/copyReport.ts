import { getReport as getReportFromDatabase } from "../../storage/reports";
import { PageElement, Report } from "../../types/reports";

const copyAnswer = (oldElements: PageElement[], newElements: PageElement[]) => {
  for (const oldElement of oldElements) {
    if (!("answer" in oldElement)) continue;

    const newElement = newElements.find(
      (newElement) => newElement.id === oldElement.id
    );
    if (newElement?.type === oldElement.type) {
      newElement.answer = oldElement.answer;
    }
  }
};

export const copyReport = async (newReport: Report) => {
  const { copyFromReportId, pages: newPages, state, type } = newReport;
  const reportToCopy = await getReportFromDatabase(
    type,
    state,
    copyFromReportId!
  );
  if (!reportToCopy) return;

  for (const oldPage of reportToCopy.pages) {
    if (oldPage.elements) {
      const newPage = newPages.find((newPage) => newPage.id === oldPage.id);
      // ensure initiatives not in base template get copied
      if (!newPage && "initiativeNumber" in oldPage) {
        newReport.pages.push(oldPage);
        continue;
      }

      const newElements = newPage?.elements;
      if (!newElements) continue;

      if ("status" in oldPage && newPage.status !== oldPage.status) {
        newPage.status = oldPage.status;
      }

      copyAnswer(oldPage.elements, newElements);
    }
  }
};
