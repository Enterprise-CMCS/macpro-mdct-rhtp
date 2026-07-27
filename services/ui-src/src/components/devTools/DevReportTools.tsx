import { Button, Text } from "@chakra-ui/react";
import {
  ActionTableTemplate,
  FormPageTemplate,
  PageElement,
  ParentPageTemplate,
} from "@rhtp/shared";
import { ReportAutosaveContext } from "components/report/ReportAutosaveProvider";
import { useContext } from "react";
import { useStore } from "utils";
import { currentPageSelector } from "utils/state/selectors";

const getAnswerByType = (type: string, id?: string) => {
  switch (type) {
    case "numberField":
      return "1234";
    case "date":
      return "02/02/2026";
    case "textbox":
      return id?.includes("email") ? "mock@email.com" : "mock text input";
    case "textAreaField":
      return "mock text area field";
    case "useOfFundsAttachment":
      //To Do: Not sure if I can just inject a file from code, seems like a bad idea
      return [];
  }
  return console.error("can't find type " + type + ", " + id);
};

const fillActionTable = (element: ActionTableTemplate) => {
  const { answer, rows } = element;
  const getMockAnswer = (col: { id: string; value: string }) => {
    //we only want elements that aren't filled out
    if (!col.value || col.value === "") {
      const typeInfo = rows.find((row) => row.id === col.id);
      if (typeInfo && !typeInfo.disabled) {
        return { ...col, value: getAnswerByType(typeInfo.type, typeInfo.id) };
      }
    }
    return col;
  };

  return answer?.map((row) =>
    row.map((col) => getMockAnswer(col as { id: string; value: string }))
  );
};

export const DevReportTools = () => {
  const { setAnswers, report } = useStore();
  const currentPage = useStore(currentPageSelector);
  const { autosave } = useContext(ReportAutosaveContext);

  const fillInitiative = () => {
    if (currentPage?.id === "initiatives") {
      const initiatives = report?.pages.filter(
        (page) => "initiativeNumber" in page
      );
      if (!initiatives) return;
      for (const page of initiatives) {
        const newElements = fillPageElements(page.elements);
        setAnswers(
          {
            ...page,
            elements: newElements,
          },
          page.id
        );
      }
      autosave();
    }
  };

  const fillPageElements = (elements: PageElement[]) => {
    return elements?.map((element) => {
      if (!("required" in element) || !element.required) {
        return element;
      }
      if (element.type === "actionTable")
        return { ...element, answer: fillActionTable(element) };
      else
        return {
          ...element,
          answer: getAnswerByType(element.type, element.id),
        };
    });
  };

  const fillCurrentPageAndSave = (
    currentPage: ParentPageTemplate | FormPageTemplate
  ) => {
    if (!currentPage || !currentPage.elements) return;

    setAnswers({
      ...currentPage,
      elements: fillPageElements(currentPage.elements),
    });
    autosave();
  };

  return (
    <>
      <Text fontWeight="bold">Report Tools</Text>
      <Button
        variant="primary"
        onClick={() => fillCurrentPageAndSave(currentPage!)}
      >
        Fill Page
      </Button>
      <Button variant="primary" onClick={() => fillInitiative()}>
        Fill Initiative Page
      </Button>
    </>
  );
};
