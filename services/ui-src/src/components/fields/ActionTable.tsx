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

//look into making it type generate and use the row id as consts
const buildRows = (
  rows: ActionRowElement[],
  answer: ActionAnswerShape[],
  onChange: (value: string, index: number, id: string) => void,
  onEdit: (index: number) => void
) => {
  const formattedRows: JSX.Element[][] = [];
  answer.forEach((answerRow, answerRowIndex) => {
    const rowElement: JSX.Element[] = [];
    rows.map((row) => {
      const element = answerRow.find((item) => item.id === row.id);

      const value =
        row.type === ElementType.Paragraph
          ? element?.value
          : buildElement(row, element?.value!, (value) =>
              onChange(value, answerRowIndex, row.id)
            );
      rowElement.push(<Td>{value}</Td>);
    });
    rowElement.push(
      <Td>
        <Button variant="link" onClick={() => onEdit(answerRowIndex)}>
          Edit/Abandon
        </Button>
      </Td>
    );
    formattedRows.push(rowElement);
  });

  return formattedRows;
};

export const ActionTable = (props: PageElementProps<ActionTableTemplate>) => {
  const { label, hintText, modal, rows, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const initial = rows.map((row) => ({ id: row.id, value: "" }));
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
