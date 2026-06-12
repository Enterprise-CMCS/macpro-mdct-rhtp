import { Flex, Button, Image } from "@chakra-ui/react";
import { Hint, Label } from "@cmsgov/design-system";
import { ActionModal } from "components/modals/ActionModal";
import { PageElementProps } from "components/report/Elements";
import { JSX, useState } from "react";
import {
  ActionTableTemplate,
  ActionRowElement,
  ActionAnswerShape,
  ElementType,
  isCompleteStatus,
} from "@rhtp/shared";
import { useStore } from "utils";
import { buildElement } from "utils/state/reportLogic/tableBuilder";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import { unmaskByType } from "utils/validation/inputValidation";
import { ResponsiveTable } from "components/tables/ResponsiveTable";

/** This function is meant to handle how the table rows disabled is set, this may expand to encompass more than the Status column */
const isRowDisabled = (rows: ActionRowElement[], answer: ActionAnswerShape) => {
  //check to see if status is a row in the table
  if (rows.some((row) => row.id === "status")) {
    const value = answer.find((field) => field.id === "status")?.value;
    if (value === "Abandoned") return true;
  }
  return false;
};

const buildRows = (
  rows: ActionRowElement[],
  answer: ActionAnswerShape[],
  onChange: (value: string[], index: number, id: string) => void,
  onEdit: (index: number) => void,
  formDisabled?: boolean,
  canChangeStatus: boolean = false
) => {
  const formattedRows: (JSX.Element | string | number)[][] = [];
  answer.forEach((answerRow, answerRowIndex) => {
    const rowElement: (JSX.Element | string | number)[] = [];
    const disabled = isRowDisabled(rows, answerRow) || formDisabled;
    rows.map((column) => {
      //autogenerate next # column
      if (column.id === "no") {
        rowElement.push(answerRowIndex + 1);
      } else {
        const element = answerRow.find((item) => item.id === column.id);
        const formattedCol = {
          ...column,
          disabled: disabled || column.disabled,
        };
        const value = buildElement(formattedCol, element?.value!, (value) =>
          onChange(value, answerRowIndex, column.id)
        );
        rowElement.push(value || "--");
      }
    });
    if (canChangeStatus) {
      rowElement.push(
        <Button variant="link" onClick={() => onEdit(answerRowIndex)}>
          Edit/Abandon
        </Button>
      );
    }
    formattedRows.push(rowElement);
  });

  return formattedRows;
};

const adjustElement = (element: ActionTableTemplate) => {
  const newElement = structuredClone(element);
  //if prevValue has no values in any row, it will hide the whole column
  if (element.rows.some((row) => row.id === "prevValue")) {
    const countFilledPrevValue = element.answer
      ?.flat()
      .filter(
        (answer) => answer.id === "prevValue" && answer.value != ""
      ).length;

    if (countFilledPrevValue != undefined && countFilledPrevValue === 0) {
      newElement.rows = newElement.rows.filter((row) => row.id !== "prevValue");
    }
  }

  return newElement;
};

export const ActionTable = (props: PageElementProps<ActionTableTemplate>) => {
  const { disabled, element } = props;
  const { id, label, hintText, modal, rows, answer } = adjustElement(element);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { userIsAdmin: canAddOrChangeStatus } = useStore().user ?? {};
  const { report } = useStore();
  const actionsDisabled = isCompleteStatus(report?.status);
  const pluralLabel = `${label}s`;

  const dropdownIds = modal.elements
    .filter((element) => element.type === ElementType.Dropdown)
    .map((element) => element.id);

  //building the default values that will be used in the add modal
  const initial = rows.map((row) => {
    const defaultValue = { id: row.id, value: "" };
    //if the field is a dropdown, we want to set it to the first child option
    if (dropdownIds.includes(row.id)) {
      const index = modal.elements.findIndex((init) => init.id == row.id);
      defaultValue.value = modal.elements[index].children![0].value;
    }
    return defaultValue;
  });

  const [modalData, setModalData] = useState<{
    data: ActionAnswerShape;
    index: number | undefined;
  }>({ data: initial, index: undefined });

  const formatAnswers = (
    data: ActionAnswerShape,
    answerType: "modal" | "row"
  ) => {
    return data.map((item) => {
      let element;
      if (answerType === "modal") {
        element = modal.elements.find((element) => element.id === item.id);
      } else if (answerType === "row") {
        element = rows.find((element) => element.id === item.id);
      }
      if (element?.mask) {
        return {
          ...item,
          value: unmaskByType(element.mask, item.value),
        };
      }
      return item;
    });
  };

  const onChange = (value: string[], index: number, id: string) => {
    const newAnswer = [...(answer ?? [])];
    const rowIndex = newAnswer[index].findIndex((answer) => answer.id === id);
    const formattedValue = formatAnswers(
      [{ id: id, value: value[0] }],
      "row"
    )[0].value;
    newAnswer[index][rowIndex].value = formattedValue;
    props.updateElement({ answer: newAnswer });
  };

  /* Modal functions */
  const onModalEdit = (index: number) => {
    if (!answer) return;
    setModalData({ data: structuredClone(answer[index]), index });
    setModalOpen(true);
  };

  const formattedRows = buildRows(
    rows,
    answer ?? [],
    onChange,
    onModalEdit,
    disabled || element.disabled,
    canAddOrChangeStatus
  );

  const onSave = (data: ActionAnswerShape) => {
    const newData = formatAnswers(data, "modal");
    if (modalData.index === undefined) {
      props.updateElement({ answer: [...(answer ?? []), newData] });
    } else {
      const newAnswer = [...answer!];
      newAnswer[modalData.index] = newData;
      props.updateElement({ answer: newAnswer });
    }
  };

  const headers = rows.map((row) => ({ label: row.header }));
  if (canAddOrChangeStatus) headers.push({ label: "Actions" });

  return (
    <Flex gap="1.25rem" flexDirection="column" width="100%">
      <Label>{pluralLabel}</Label>
      <Hint id={id}>{hintText}</Hint>
      {canAddOrChangeStatus ? (
        <Button
          aria-label={`add ${label}`}
          variant="outline"
          alignSelf="flex-start"
          leftIcon={
            <Image
              src={actionsDisabled ? addGray : addPrimary}
              alt="Add icon"
            />
          }
          onClick={() => {
            setModalOpen(true);
            setModalData({ data: initial, index: undefined });
          }}
          disabled={actionsDisabled}
        >
          Add {label}
        </Button>
      ) : null}
      {ResponsiveTable(headers, formattedRows, "metric")}
      <ActionModal
        modal={modal}
        form={modalData}
        onSave={onSave}
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        disabled={actionsDisabled}
      />
    </Flex>
  );
};
