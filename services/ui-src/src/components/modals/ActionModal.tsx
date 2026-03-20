import { Modal } from "components/modals/Modal";
import {
  buildElement,
  getErrorMessage,
} from "utils/state/reportLogic/tableBuilder";
import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { ActionAnswerShape, ActionModalElement, ActionRowElement } from "types";

export const ActionModal = ({
  rows,
  modal,
  form,
  modalDisclosure,
  onSave,
}: Props) => {
  const [errorMessages, setErrorMessages] = useState<string[]>(
    modal.elements.map(() => "")
  );
  const [formData, setFormData] = useState<ActionAnswerShape>(form.data);
  useEffect(() => {
    setFormData(form.data);
  }, [form.data]);

  /* general functions */
  const fieldLabel = (id: string) => {
    return rows.find((row) => row.id == id)?.header ?? "";
  };

  const onModalChange = (value: string, id: string, index: number) => {
    const newData = [...formData];
    const columnIndex = newData.findIndex((item) => item.id === id);
    newData[columnIndex].value = value;
    setFormData(newData);

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
    onSave(formData);
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
              formData.find((data) => data.id === element.id)?.value!,
              (value) => onModalChange(value, element.id, index),
              fieldLabel(element.id),
              errorMessages[index]
            )
          )}
        </Flex>
      }
      onConfirmHandler={onModalSave}
      content={{
        heading:
          form.index !== undefined
            ? `Edit ${modal.title}`
            : `Add ${modal.title}`,
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
  form: { data: ActionAnswerShape; index: number | undefined };
  onSave: (data: ActionAnswerShape) => void;
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
}
