import {
  Flex,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from "@chakra-ui/react";
import { Label } from "@cmsgov/design-system";
import { ActionModal } from "components/modals/ActionModal";
import { PageElementProps } from "components/report/Elements";
import { JSX, useState } from "react";
import {
  ActionTableTemplate,
  ActionRowElement,
  ActionAnswerShape,
  ElementType,
} from "types";
import { buildElement } from "utils/state/reportLogic/tableBuilder";

/** This function is meant to handle how the table rows disabled is set, this may expand to encompass more than the Status column */
const isRowDisabled = (rows: ActionRowElement[], answer: ActionAnswerShape) => {
  //check to see if status is a row in the table
  if (rows.some((row) => row.id === "status")) {
    const value = answer.find((field) => field.id === "status")?.value;
    if (value === "Abandon") return true;
  }
  return false;
};

const buildRows = (
  rows: ActionRowElement[],
  answer: ActionAnswerShape[],
  onChange: (value: string, index: number, id: string) => void,
  onEdit: (index: number) => void
) => {
  const formattedRows: JSX.Element[][] = [];
  answer.forEach((columnAnswer, columnAnswerIndex) => {
    const rowElement: JSX.Element[] = [];
    const disabled = isRowDisabled(rows, columnAnswer);

    rows.map((column) => {
      const element = columnAnswer.find((item) => item.id === column.id);
      const formattedCol = { ...column, disabled: disabled || column.disabled };
      const value =
        column.type === ElementType.Paragraph
          ? element?.value
          : buildElement(formattedCol, element?.value!, (value) =>
              onChange(value, columnAnswerIndex, column.id)
            );
      rowElement.push(<Td>{value}</Td>);
    });
    rowElement.push(
      <Td>
        <Button
          variant="link"
          onClick={() => onEdit(columnAnswerIndex)}
          disabled={disabled}
        >
          Edit/Abandon
        </Button>
      </Td>
    );
    formattedRows.push(rowElement);
  });

  return formattedRows;
};

/** Handles formatting for unique column ids like no for # column */
const formatUniqueKeys = (
  data: ActionAnswerShape,
  answer: ActionAnswerShape[]
) => {
  //if there's a no column, auto generate the next row number in the table
  if (data.some((column) => column.id === "no")) {
    const foundIndex = data.findIndex((column) => column.id === "no");
    data[foundIndex] = {
      id: "no",
      value: (answer.length + 1).toString(),
    };
  }
  return data;
};

export const ActionTable = (props: PageElementProps<ActionTableTemplate>) => {
  const { label, hintText, modal, rows, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

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

  const onChange = (value: string, index: number, id: string) => {
    const newAnswer = [...(answer ?? [])];
    var rowIndex = newAnswer[index].findIndex((answer) => answer.id === id);
    newAnswer[index][rowIndex].value = value;
    props.updateElement({ answer: newAnswer });
  };

  /* Modal functions */
  const onModalEdit = (index: number) => {
    if (!answer) return;
    setModalData({ data: answer[index], index });
    setModalOpen(true);
  };

  const formattedRows = buildRows(rows, answer ?? [], onChange, onModalEdit);

  const onSave = (data: ActionAnswerShape) => {
    if (modalData.index === undefined) {
      //special case code for certain column headers
      data = formatUniqueKeys(data, answer ?? []);
      props.updateElement({ answer: [...(answer ?? []), data] });
    } else {
      const newAnswer = [...answer!];
      newAnswer[modalData.index] = data;
      props.updateElement({ answer: newAnswer });
    }
  };

  return (
    <Flex gap="1.25rem" flexDirection="column" width="100%">
      <Label>{label}</Label>
      <Text>{hintText}</Text>
      <Button
        aria-label={`add ${label}`}
        variant="outline"
        alignSelf="flex-start"
        onClick={() => {
          setModalOpen(true);
          setModalData({ data: initial, index: undefined });
        }}
      >
        Add {label.toLowerCase()}
      </Button>
      <Table variant="metric">
        <Thead>
          <Tr>
            {rows.map((row) => (
              <Th>{row.header}</Th>
            ))}
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {formattedRows.map((row: any) => (
            <Tr>{row}</Tr>
          ))}
        </Tbody>
      </Table>
      <ActionModal
        rows={rows}
        modal={modal}
        form={modalData}
        onSave={onSave}
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
      ></ActionModal>
    </Flex>
  );
};
