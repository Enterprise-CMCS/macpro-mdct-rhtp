import { getReport as getReportFromDatabase } from "../../storage/reports";
import { ActionAnswerShape, PageElement, Report } from "@rhtp/shared";

const copyAnswer = (oldElements: PageElement[], newElements: PageElement[]) => {
  for (const oldElement of oldElements) {
    if (!("answer" in oldElement)) continue;

    const newElement = newElements.find(
      (newElement) => newElement.id === oldElement.id
    );
    if (newElement?.type === oldElement.type) {
      if (newElement.id === "metrics-table") {
        newElement.answer = copyMetricAnswers(
          oldElement.answer as ActionAnswerShape[]
        );
      } else {
        newElement.answer = oldElement.answer;
      }
    }
  }
};

const copyMetricAnswers = (oldAnswerRows: ActionAnswerShape[]) => {
  return oldAnswerRows.map((oldAnswerRow) => {
    const newAnswerRow = structuredClone(oldAnswerRow);
    const indexes = ["prevValue", "currValue"].map((key) =>
      oldAnswerRow.findIndex((row) => row.id === key)
    );
    newAnswerRow[indexes[0]].value = oldAnswerRow[indexes[1]].value;
    newAnswerRow[indexes[1]].value = "";
    return newAnswerRow;
  });
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
      let newPage = newPages.find((newPage) => newPage.id === oldPage.id);
      // ensure initiatives not in base template get copied
      if (!newPage && "initiativeNumber" in oldPage) {
        newPages.push(oldPage);
        newPage = oldPage;
      }

      const newElements = newPage?.elements;
      if (!newElements) continue;

      if (newPage && newPage.status !== oldPage.status) {
        newPage.status = oldPage.status;
      }

      copyAnswer(oldPage.elements, newElements);
    }
  }
};
