import { useEffect, useState, SubmitEvent } from "react";
import { Modal } from "components/modals/Modal";
import {
  buildElement,
  getErrorMessage,
} from "utils/state/reportLogic/tableBuilder";
import { Flex } from "@chakra-ui/react";
import {
  ActionAnswerShape,
  ActionModalElement,
  ActionRowElement,
} from "@rhtp/shared";
import { ErrorMessages } from "../../constants";

export const ActionModal = ({
  rows,
  modal,
  form,
  modalDisclosure,
  onSave,
}: Props) => {
  const isEdit = form.index !== undefined;
  const renderElements = !isEdit
    ? modal.elements.filter((element) => !element.editOnly)
    : modal.elements;

  const [errorMessages, setErrorMessages] = useState<string[]>(
    renderElements.map(() => "")
  );

  const [formData, setFormData] = useState<ActionAnswerShape>(form.data);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    setFormData(form.data);
  }, [form.data]);

  useEffect(() => {
    setErrorMessages(renderElements.map(() => ""));
  }, [modalDisclosure.isOpen]);

  /* general functions */
  const fieldLabel = (id: string) => {
    return rows.find((row) => row.id == id)?.header ?? "";
  };

  const onModalChange = (value: string[], id: string, index: number) => {
    const newData = [...formData];
    const columnIndex = newData.findIndex((item) => item.id === id);
    newData[columnIndex].value = value[0];
    setFormData(newData);

    const element = renderElements[index];
    const newErrorMessages = [...errorMessages];
    newErrorMessages[index] = getErrorMessage(
      element.type,
      element.required,
      value
    );
    setErrorMessages(newErrorMessages);
  };

  const onModalClose = () => {
    modalDisclosure.onClose();
  };

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();

    const activeKeys = renderElements.map((element) => element.id);
    const values = form.data
      .filter((item) => activeKeys.includes(item.id))
      .map((item) => item.value);

    const errors = values.map((value, index) =>
      !value && renderElements[index].required
        ? ErrorMessages.requiredResponse
        : errorMessages[index]
    );
    setErrorMessages(errors);
    if (errors.some((error) => error != "")) return;

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
        closeButtonText: "Close",
      }}
      disableConfirm={submitting}
    >
      <form id="actionModal" onSubmit={onSubmit}>
        <Flex flexDir="column" gap="1.5rem">
          {renderElements.map((element, index) =>
            buildElement(
              element,
              formData.find((data) => data.id === element.id)?.value!,
              (value) => onModalChange(value, element.id, index),
              fieldLabel(element.id),
              errorMessages[index]
            )
          )}
        </Flex>
      </form>
    </Modal>
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
