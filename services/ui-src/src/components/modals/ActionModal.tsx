import { Modal } from "components/modals/Modal";
import {
  buildElement,
  getErrorMessage,
} from "utils/state/reportLogic/tableBuilder";
import { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { ActionAnswerShape, ActionModalElement, ActionRowElement } from "types";

export const ActionModal = ({ rows, modal, edit, modalDisclosure }: Props) => {
  const initial = rows.map((row) => ({ id: row.id, value: "" }));
  const [errorMessages, setErrorMessages] = useState<string[]>(
    modal.elements.map(() => "")
  );
  const data = edit ?? initial;

  console.log(data);

  /* general functions */
  const fieldLabel = (id: string) => {
    return rows.find((row) => row.id == id)?.header ?? "";
  };

  const onModalChange = (value: string, id: string, index: number) => {
    const newData = [...data];
    const columnIndex = newData.findIndex((item) => item.id === id);
    if (columnIndex === -1) return;

    newData[columnIndex].value = value;

    const element = modal.elements[index];
    const newErrorMessages = [...errorMessages];
    newErrorMessages[index] = getErrorMessage(element.validation, value);
    setErrorMessages(newErrorMessages);
  };

  const onModalClose = () => {
    modalDisclosure.onClose();
    setErrorMessages(modal.elements.map(() => ""));
  };

  const onModalSave = () => {
    // const newAnswer = [...(answer ?? [])];
    // switch (modalObject.mode) {
    //   case ModalMode.ADD:
    //     newAnswer.push();
    //     break;
    //   case ModalMode.EDIT:
    //     if (modalObject.index) newAnswer[modalObject.index] = modalObject.data;
    //     break;
    // }
    onModalClose();
  };

  return (
    <Modal
      data-testid="action-modal"
      modalDisclosure={{
        isOpen: modalDisclosure.isOpen,
        onClose: onModalClose,
      }}
      children={
        <Flex flexDir="column" gap="1.5rem">
          {modal.elements.map((element, index) =>
            buildElement(
              element,
              data.find((data) => data.id === element.id)?.value!,
              (value) => onModalChange(value, element.id, index),
              fieldLabel(element.id),
              errorMessages[index]
            )
          )}
        </Flex>
      }
      onConfirmHandler={onModalSave}
      content={{
        heading: edit ? `Edit ${modal.title}` : `Add ${modal.title}`,
        actionButtonText: "Save",
        closeButtonText: "Close",
      }}
    ></Modal>
  );
};

interface Props {
  rows: ActionRowElement[];
  modal: {
    title: string;
    hintText?: string;
    elements: ActionModalElement[];
  };
  edit: ActionAnswerShape | undefined;
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
}
