import { getReport as getReportFromDatabase } from "../../storage/reports";
import {
  ActionAnswerShape,
  PageElement,
  Report,
  RhtpSubType,
  AccordionGroupItem,
  AccordionGroupTemplate,
} from "@rhtp/shared";

const copyStatePolicyCommitments = (
  oldAccordions: AccordionGroupItem[],
  newAccordions: AccordionGroupItem[]
) => {
  for (const oldAccordionItem of oldAccordions) {
    for (const oldChildItem of oldAccordionItem.elements) {
      if ("answer" in oldChildItem) {
        const newAccordionItem = newAccordions.find(
          (newAccordionItem) =>
            newAccordionItem.label === oldAccordionItem.label
        );

        const newChildItem = newAccordionItem?.elements.find(
          (newChildItem) => newChildItem.id === oldChildItem.id
        ) as PageElement;
        if (oldChildItem?.type === newChildItem.type) {
          newChildItem.answer = structuredClone(oldChildItem.answer);
        }
      }
    }
  }
};

const copyAnswer = (
  oldElements: PageElement[],
  newElements: PageElement[],
  newSubType: RhtpSubType
) => {
  for (const oldElement of oldElements) {
    // Copying over State Policy Commitments
    if ("accordions" in oldElement) {
      const newElement = newElements.find(
        (newElement) => newElement.id === oldElement.id
      ) as AccordionGroupTemplate;
      copyStatePolicyCommitments(oldElement.accordions, newElement.accordions);
    }
    if (!("answer" in oldElement)) continue;

    const newElement = newElements.find(
      (newElement) => newElement.id === oldElement.id
    );
    if (newElement?.type === oldElement.type) {
      //special copy of metrics table when it's a new annual report
      if (
        newElement.id === "metrics-table" &&
        newSubType === RhtpSubType.ANNUAL
      ) {
        newElement.answer = copyMetricAnswers(
          oldElement.answer as ActionAnswerShape[]
        );
      } else if (newElement.id === "use-of-funds-attachment") {
        newElement.answer = [];
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
  const { copyFromReportId, pages: newPages, state, type, subType } = newReport;
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

      copyAnswer(oldPage.elements, newElements, subType);
    }
  }
};
