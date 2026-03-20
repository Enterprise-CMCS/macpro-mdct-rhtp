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
import { Modal } from "components/modals/Modal";
import { PageElementProps } from "components/report/Elements";
import { useState } from "react";
import { ActionTableTemplate, ActionRowElement } from "types";
import { buildElement } from "utils/state/reportLogic/tableBuilder";

enum ModalMode {
  ADD = "add",
  EDIT = "edit",
  CLOSED = "closed",
}

type ModalObject = {
  mode: ModalMode;
  data: any;
  index?: number;
};

//look into making it type generate and use the row id as consts
const buildRows = (
  rows: ActionRowElement[],
  answer: any[],
  onChange: (value: string, index: number, id: string) => void,
  onEdit: (index: number) => void
) => {
  const filledRows: any = [];
  answer.forEach((item, rowIndex) => {
    const rowElement: any = [];
    rows.map((row, _colIndex) => {
      const value = row.type
        ? buildElement(item[row.id], row.type, (value) =>
            onChange(value, rowIndex, row.id)
          )
        : item[row.id];
      rowElement.push(<Td>{value}</Td>);
    });
    rowElement.push(
      <Td>
        <Button variant="link" onClick={() => onEdit(rowIndex)}>
          Edit/Abandon
        </Button>
      </Td>
    );
    filledRows.push(rowElement);
  });
  return filledRows;
};

export const ActionTable = (props: PageElementProps<ActionTableTemplate>) => {
  const { label, hintText, modal, rows, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const initial = {
    status: "",
    metric: "",
    prevValue: "",
    currValue: "",
    date: "",
  };

  const [modalObject, setModalObject] = useState<ModalObject>({
    mode: ModalMode.CLOSED,
    data: initial,
  });

  const onChange = (value: string, index: number, id: string) => {
    const newAnswer = [...(answer ?? [])];
    const selected: any = newAnswer[index];
    selected[id] = value;
    props.updateElement({ answer: newAnswer });
  };

  const onModalEdit = (index: number) => {
    if (!answer) return;

    setModalObject({
      mode: ModalMode.EDIT,
      data: answer[index],
      index: index,
    });
    setModalOpen(true);
  };

  const formattedRows = buildRows(rows, answer ?? [], onChange, onModalEdit);

  const onModalChange = (value: string, id: string) => {
    const newDefault: any = { ...modalObject.data, [id]: value };
    setModalObject({ ...modalObject, data: newDefault });
  };

  const onModalSave = () => {
    const newAnswer = [...(answer ?? [])];

    switch (modalObject.mode) {
      case ModalMode.ADD:
        newAnswer.push({ no: newAnswer.length, ...modalObject.data });
        break;
      case ModalMode.EDIT:
        if (modalObject.index) newAnswer[modalObject.index] = modalObject.data;
        break;
    }

    props.updateElement({ answer: newAnswer });
    setModalOpen(false);
  };

  const fieldLabel = (id: string) => {
    return rows.find((row) => row.id == id)?.header ?? "";
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
          setModalObject({ mode: ModalMode.ADD, data: initial });
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
      <Modal
        data-testid="action-modal"
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => {
            setModalOpen(false);
            setModalObject({ mode: ModalMode.CLOSED, data: initial });
          },
        }}
        children={
          <Flex flexDir="column" gap="1.5rem">
            {modal.elements.map((element) =>
              buildElement(
                modalObject.data[element.id],
                element.type,
                (value) => onModalChange(value, element.id),
                fieldLabel(element.id),
                element.children
              )
            )}
          </Flex>
        }
        onConfirmHandler={onModalSave}
        content={{
          heading:
            modalObject.mode === ModalMode.EDIT
              ? `Edit ${modal.title}`
              : `Add ${modal.title}`,
          actionButtonText: "Save",
          closeButtonText: "Close",
        }}
      ></Modal>
    </Flex>
  );
};
