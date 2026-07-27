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
import {
  currentPageSelector,
  submittableMetricsSelector,
} from "utils/state/selectors";

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
  return console.error("Type ignored: " + type + ". Element id: " + id);
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

export const DevReportTools = () => {
  const { setAnswers, report } = useStore();
  const currentPage = useStore(currentPageSelector);
  const { autosave } = useContext(ReportAutosaveContext);
  const submittableMetrics = useStore(submittableMetricsSelector);

  const optionalPages = submittableMetrics?.sections
    .filter((section) => section?.displayStatus === "Optional")
    .map((page) => page?.section.id);

  const fillInitiative = () => {
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
  };

  const fillCurrentPageAndSave = (
    currentPage: ParentPageTemplate | FormPageTemplate
  ) => {
    if (!currentPage || !currentPage.elements) return;

    if (currentPage?.id === "initiatives") {
      fillInitiative();
    } else {
      setAnswers({
        ...currentPage,
        elements: fillPageElements(currentPage.elements),
      });
    }

    autosave();
  };

  return (
    <>
      <Text fontWeight="bold">{currentPage?.title} Tools</Text>
      {optionalPages?.includes(currentPage?.id) ? (
        <Text>No actions avaliable for this page.</Text>
      ) : (
        <>
          <Text>
            Clicking the Auto Fill button will fill only the required fields in{" "}
            {currentPage?.title} page and trigger autosave.
          </Text>
          <Button
            variant="primary"
            onClick={() => fillCurrentPageAndSave(currentPage!)}
          >
            Auto Fill
          </Button>
        </>
      )}
    </>
  );
};
