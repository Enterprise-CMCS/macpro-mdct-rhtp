import { Button, Checkbox, Divider, Stack, Text } from "@chakra-ui/react";
import {
  ActionTableTemplate,
  ElementType,
  FormPageTemplate,
  PageElement,
  PageStatus,
  ParentPageTemplate,
  UploadListProp,
} from "@rhtp/shared";
import { UploadArea } from "components/fields/UploadArea";
import { ReportAutosaveContext } from "components/report/ReportAutosaveProvider";
import { useContext, useState } from "react";
import { useStore } from "utils";
import {
  currentPageSelector,
  submittableMetricsSelector,
} from "utils/state/selectors";

export const DevReportTools = () => {
  const { setAnswers, report, lastSavedTime } = useStore();
  const currentPage = useStore(currentPageSelector);
  const { autosave } = useContext(ReportAutosaveContext);
  const submittableMetrics = useStore(submittableMetricsSelector);
  const [files, setFiles] = useState<UploadListProp[]>([]);

  const getFillabelInitiatives = () => {
    return report?.pages.filter(
      (page) =>
        "initiativeNumber" in page && page.status !== PageStatus.ABANDONED
    );
  };

  const [checkedInitiatives, setCheckedInitiatives] = useState<string[]>(
    getFillabelInitiatives()?.map((initiative) => initiative.id) ?? []
  );

  const optionalPages = submittableMetrics?.sections
    .filter((section) => section?.displayStatus === "Optional")
    .map((page) => page?.section.id);

  const getAnswerByType = (type: string, id?: string) => {
    switch (type) {
      case ElementType.NumberField:
        return "1234";
      case ElementType.Date:
        return "02/02/2026";
      case ElementType.Textbox:
        return id?.includes("email") ? "mock@email.com" : "mock text input";
      case ElementType.TextAreaField:
        return "mock text area field";
      case ElementType.ObligatedAndSpentFundsAttachment:
        return files.map((file) => ({ ...file, label: "Budget Period 1" }));
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
      else {
        const answer =
          "answer" in element &&
          element.answer != "" &&
          element.answer != undefined
            ? element.answer
            : undefined;

        return {
          ...element,
          answer: answer ?? getAnswerByType(element.type, element.id),
        };
      }
    });
  };

  const onChecked = (selection: string) => {
    let newSelection = [...checkedInitiatives];
    if (newSelection.includes(selection)) {
      setCheckedInitiatives(
        newSelection.filter((selected) => selected != selection)
      );
    } else {
      setCheckedInitiatives([...newSelection, selection]);
    }
  };

  const fillInitiative = () => {
    const initiatives = getFillabelInitiatives();
    if (!initiatives) return;
    const selectedInitiatives = initiatives.filter((initiative) =>
      checkedInitiatives.includes(initiative.id)
    );
    for (const page of selectedInitiatives) {
      const newElements = fillPageElements(page.elements!);
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
    currentPage: ParentPageTemplate | FormPageTemplate,
    triggerSave: boolean = true
  ) => {
    if (!currentPage || !currentPage.elements) return;

    if (currentPage?.id === "initiatives") {
      fillInitiative();
    } else {
      setAnswers(
        {
          ...currentPage,
          elements: fillPageElements(currentPage.elements),
        },
        currentPage.id
      );
    }
    if (triggerSave) {
      autosave();
    }
  };

  const OnUploadComplete = (files: UploadListProp[]) => {
    setFiles(files);
  };

  const fillReport = () => {
    const requiredPages = report?.pages.filter(
      (page) =>
        !optionalPages?.includes(page.id) &&
        "elements" in page &&
        !("initiativeNumber" in page)
    );

    if (requiredPages) {
      for (const page of requiredPages) {
        fillCurrentPageAndSave(page, false);
      }
      autosave();
    }
  };

  const renderById = (id: string) => {
    switch (id) {
      case "review-submit":
        return (
          <Stack sx={sx.container} gap="1.25rem">
            <Text>Quick fill all required pages in the report.</Text>
            <Text>
              <b>1.</b> First add a file here to be uploaded to Obligated and
              Spent funds
            </Text>
            <UploadArea
              answer={files}
              saveToReport={OnUploadComplete}
            ></UploadArea>
            <Divider></Divider>
            <Text>
              <b>2.</b> Click Fill Report button and wait for autosave to
              finish.
            </Text>
            <Text>
              <b>Last Saved:</b> {lastSavedTime}
            </Text>
            <Button
              variant="primary"
              onClick={() => fillReport()}
              disabled={files.length === 0}
              padding={"10px"}
            >
              Fill Report
            </Button>
          </Stack>
        );
      case "obligated-and-spent-funds":
        return (
          <Text>
            No quick actions avaliable for this page. You have to upload the
            file like the user would.
          </Text>
        );
      case "initiatives":
        return (
          <Stack sx={sx.container}>
            <Text>
              Clicking the Auto Fill button will fill all the required fields in
              the checked Initiatives. Abandon initiatives will be ignored.
            </Text>
            {getFillabelInitiatives()?.map((initiative) => (
              <Checkbox
                key={initiative.id}
                onChange={() => onChecked(initiative.id)}
                isChecked={checkedInitiatives.includes(initiative.id)}
                checked={checkedInitiatives.includes(initiative.id)}
                margin="0"
              >
                {initiative.title}
              </Checkbox>
            ))}
            <Button
              variant="primary"
              onClick={() => fillCurrentPageAndSave(currentPage!)}
              padding="10px"
              marginTop="0.75rem"
            >
              Auto Fill Page
            </Button>
          </Stack>
        );
    }
    return (
      <>
        <Text>
          Clicking the Auto Fill button will fill only the required fields in{" "}
          {currentPage?.title} page and trigger autosave.
        </Text>
        <Button
          variant="primary"
          onClick={() => fillCurrentPageAndSave(currentPage!)}
        >
          Auto Fill Page
        </Button>
      </>
    );
  };

  return (
    <>
      <Text fontWeight="bold">{currentPage?.title} Tools</Text>
      {optionalPages?.includes(currentPage?.id) ? (
        <Text>No actions avaliable for this page.</Text>
      ) : (
        renderById(currentPage?.id ?? "")
      )}
    </>
  );
};

const sx = {
  container: {
    ".chakra-checkbox__control": {
      border: "1px solid black",
    },
    ".chakra-heading": {
      margin: "0",
    },
  },
};
