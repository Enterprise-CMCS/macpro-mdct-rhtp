import { useEffect, useState, SubmitEvent } from "react";
import { Modal } from "components/modals/Modal";
import {
  buildElement,
  getErrorMessage,
} from "utils/state/reportLogic/tableBuilder";
import { Flex } from "@chakra-ui/react";
import { ActionAnswerShape, ActionModalElement } from "@rhtp/shared";
import { ErrorMessages } from "../../constants";

export const ActionModal = ({
  modal,
  form,
  modalDisclosure,
  onSave,
  errorMessages,
  setErrorMessages,
  disabled,
}: Props) => {
  const isEdit = form.index !== undefined;
  const renderElements = !isEdit
    ? modal.elements.filter((element) => !element.editOnly)
    : modal.elements;

  const [formData, setFormData] = useState<ActionAnswerShape>(form.data);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setFormData(form.data);
  }, [form.data]);

  const onModalChange = (value: string[], id: string, index: number) => {
    const newData = [...formData];
    const columnIndex = newData.findIndex((item) => item.id === id);
    newData[columnIndex].value = value[0];
    setFormData(newData);

    const element = renderElements[index];
    const newErrorMessages = new Map([
      ...errorMessages,
      [id, getErrorMessage(element.type, element.required, value)],
    ]);
    setErrorMessages(newErrorMessages);
  };

  const onModalClose = () => {
    modalDisclosure.onClose();
  };

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    const submittedErrors = renderElements.map((element) => {
      const value = formData.find((item) => item.id === element.id)?.value;
      return [
        element.id,
        !value && element.required
          ? ErrorMessages.requiredResponse
          : (errorMessages.get(element.id) ?? ""),
      ] as [string, string];
    });
    const newErrorMessages = new Map([...errorMessages, ...submittedErrors]);
    setErrorMessages(newErrorMessages);
    if (submittedErrors.some(([, error]) => error != "")) return;

    setSubmitting(true);
    onSave(formData);
    setSubmitting(false);
    onModalClose();
  };

  return (
    <Modal
      formId="actionModal"
      modalDisclosure={{
        isOpen: modalDisclosure.isOpen,
        onClose: onModalClose,
      }}
      content={{
        heading: isEdit ? `Edit ${modal.title}` : `Add ${modal.title}`,
        actionButtonText: "Save",
        closeButtonText: "Cancel",
      }}
      disableConfirm={submitting || disabled}
    >
      <form id="actionModal" onSubmit={onSubmit}>
        <Flex flexDir="column" gap="1.5rem">
          {renderElements.map((element, index) =>
            buildElement(
              {
                ...element,
                disabled: element.disabled || disabled,
              },
              formData.find((data) => data.id === element.id)?.value!,
              (value) => onModalChange(value, element.id, index),
              element.label,
              errorMessages.get(element.id)
            )
          )}
        </Flex>
      </form>
    </Modal>
  );
};

interface Props {
  modal: {
    title: string;
    hintText?: string;
    elements: ActionModalElement[];
  };
  form: { data: ActionAnswerShape; index: number | undefined };
  onSave: (data: ActionAnswerShape) => void;
  errorMessages: Map<string, string>;
  setErrorMessages: (errorMessages: Map<string, string>) => void;
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  disabled?: boolean;
}
