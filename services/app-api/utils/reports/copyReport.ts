import { getReport as getReportFromDatabase } from "../../storage/reports";
import { PageElement, Report } from "../../types/reports";

const copyAnswer = (oldElements: PageElement[], newElements: PageElement[]) => {
  for (const oldElement of oldElements) {
    if (!("answer" in oldElement)) return;

    const newElement = newElements.find(
      (newElement) => newElement.id === oldElement.id
    );
    if (newElement?.type === oldElement.type) {
      newElement.answer = oldElement.answer;
    }
  }
};

export const copyReport = async (newReport: Report, copyFromId: string) => {
  const { pages: newPages, state, type } = newReport;
  const reportToCopy = await getReportFromDatabase(type, state, copyFromId);
  if (!reportToCopy) return;

  for (const oldPage of reportToCopy.pages) {
    if (oldPage.elements) {
      const newPage = newPages.find((newPage) => newPage.id === oldPage.id);
      const newElements = newPage?.elements;
      if (!newElements) return;
      copyAnswer(oldPage.elements, newElements);
    }
  }
};
