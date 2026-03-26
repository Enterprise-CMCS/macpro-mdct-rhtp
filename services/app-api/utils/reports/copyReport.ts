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
  const newAnswers: ActionAnswerShape[] = [];
  for (const oldAnswerRow of oldAnswerRows) {
    const newAnswerRow = structuredClone(oldAnswerRow);
    const prevValueIndex = oldAnswerRow.findIndex(
      (answer: { id: string; value: string | number }) =>
        answer.id === "prevValue"
    );
    const currValueIndex = oldAnswerRow.findIndex(
      (answer: { id: string; value: string | number }) =>
        answer.id === "currValue"
    );
    newAnswerRow[prevValueIndex].value = oldAnswerRow[currValueIndex].value;
    newAnswerRow[currValueIndex].value = "";
    newAnswers.push(newAnswerRow);
  }
  return newAnswers;
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
