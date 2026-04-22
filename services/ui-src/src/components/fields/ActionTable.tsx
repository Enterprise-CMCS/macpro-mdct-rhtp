import {
  Flex,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Hint, Label } from "@cmsgov/design-system";
import { ActionModal } from "components/modals/ActionModal";
import { PageElementProps } from "components/report/Elements";
import { JSX, useState } from "react";
import {
  ActionTableTemplate,
  ActionRowElement,
  ActionAnswerShape,
  ElementType,
} from "types";
import { useStore } from "utils";
import { buildElement } from "utils/state/reportLogic/tableBuilder";

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
  canChangeStatus: boolean = false
) => {
  const formattedRows: JSX.Element[][] = [];
  answer.forEach((answerRow, answerRowIndex) => {
    const rowElement: JSX.Element[] = [];
    const disabled = isRowDisabled(rows, answerRow);
    rows.map((column, columnIndex) => {
      //autogenerate next # column
      if (column.id === "no") {
        rowElement.push(<Td key={column.id}>{answerRowIndex + 1}</Td>);
      } else {
        const element = answerRow.find((item) => item.id === column.id);
        const formattedCol = {
          ...column,
          disabled: disabled || column.disabled,
        };
        const value = buildElement(formattedCol, element?.value!, (value) =>
          onChange(value, answerRowIndex, column.id)
        );
        rowElement.push(<Td key={`action-column-${columnIndex}`}>{value}</Td>);
      }
    });
    rowElement.push(
      <Td key={`row.element.${answerRowIndex}`}>
        <Button
          variant="link"
          onClick={() => onEdit(answerRowIndex)}
          disabled={!canChangeStatus}
        >
          Edit/Abandon
        </Button>
      </Td>
    );
    formattedRows.push(rowElement);
  });

  return formattedRows;
};

export const ActionTable = (props: PageElementProps<ActionTableTemplate>) => {
  const { id, label, hintText, modal, rows, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { userIsAdmin: canAddOrChangeStatus } = useStore().user ?? {};

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

  const onChange = (value: string[], index: number, id: string) => {
    const newAnswer = [...(answer ?? [])];
    const rowIndex = newAnswer[index].findIndex((answer) => answer.id === id);
    newAnswer[index][rowIndex].value = value[0];
    props.updateElement({ answer: newAnswer });
  };

  /* Modal functions */
  const onModalEdit = (index: number) => {
    if (!answer) return;
    setModalData({ data: answer[index], index });
    setModalOpen(true);
  };

  const formattedRows = buildRows(
    rows,
    answer ?? [],
    onChange,
    onModalEdit,
    canAddOrChangeStatus
  );

  const onSave = (data: ActionAnswerShape) => {
    if (modalData.index === undefined) {
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
      <Hint id={id}>{hintText}</Hint>
      <Button
        aria-label={`add ${label}`}
        variant="outline"
        alignSelf="flex-start"
        onClick={() => {
          setModalOpen(true);
          setModalData({ data: initial, index: undefined });
        }}
        disabled={!canAddOrChangeStatus}
      >
        Add {label.toLowerCase()}
      </Button>
      <Table variant="metric">
        <Thead>
          <Tr>
            {rows.map((row) => (
              <Th key={row.header}>{row.header}</Th>
            ))}
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {formattedRows.map((row, rowIndex) => (
            <Tr key={`action-row-${rowIndex}`}>{row}</Tr>
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
