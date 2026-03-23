import { ChangeEvent, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { ChoiceList, TextField } from "@cmsgov/design-system";
import { Modal } from "./Modal";
import { ErrorMessages } from "../../constants";
import {
  createInitiative,
  updateInitiative,
} from "utils/api/requestMethods/initiatives";
import { getReport, useStore } from "utils";
import {
  CreateInitiativeOptions,
  InitiativePageTemplate,
  UpdateInitiativeOptions,
} from "types";

const initialValues = {
  initiativeName: "",
  initiativeNumber: "",
  initiativeAbandon: "",
};

export const AddEditInitiativeModal = ({
  modalDisclosure,
  selectedInitiative,
}: Props) => {
  const { report, updateReport } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [errorMessages, setErrorMessages] = useState(initialValues);

  const onClose = () => {
    modalDisclosure.onClose();
    setSubmitting(false);
    setFormValues(initialValues);
    setErrorMessages(initialValues);
  };

  const validateField = (value: string) => {
    if (!value) {
      return ErrorMessages.requiredResponse;
    }
    return "";
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: validateField(value),
    }));
  };

  const onSubmit = async () => {
    if (!report) return;
    const errors: any = structuredClone(initialValues);
    let hasError = false;
    for (const [key, value] of Object.entries(formValues)) {
      if (!selectedInitiative && key === "initiativeAbandon") continue;
      if (
        selectedInitiative &&
        (key === "initiativeNumber" || key === "initiativeName")
      )
        continue;
      errors[key] = validateField(value);
      if (errors[key] !== "") hasError = true;
    }
    setErrorMessages(errors);
    if (hasError) return;

    setSubmitting(true);
    const { initiativeName, initiativeNumber, initiativeAbandon } = formValues;
    if (initiativeName && initiativeNumber) {
      const newInitiative: CreateInitiativeOptions = {
        initiativeName,
        initiativeNumber,
      };
      await createInitiative(report, newInitiative);
    } else if (selectedInitiative) {
      const updatedInitiative: UpdateInitiativeOptions = {
        initiativeAbandon: initiativeAbandon === "No" ? false : true,
      };
      await updateInitiative(report, updatedInitiative, selectedInitiative.id);
    }

    const newReport = await getReport(report.type, report.state, report.id);
    updateReport(newReport);
    onClose();
  };

  const getHeaderText = () => {
    if (selectedInitiative) {
      const { initiativeNumber, title } = selectedInitiative;
      return `Edit ${initiativeNumber}: ${title}`;
    } else {
      return "Add Initiative";
    }
  };

  return (
    <Modal
      modalDisclosure={{
        isOpen: modalDisclosure.isOpen,
        onClose,
      }}
      onConfirmHandler={onSubmit}
      submitting={submitting}
      content={{
        heading: getHeaderText(),
        actionButtonText: "Save",
        closeButtonText: "Cancel",
      }}
    >
      <Flex direction="column" gap="2rem">
        {selectedInitiative ? (
          <>
            <ChoiceList
              label="Abandon initiative?"
              name="initiativeAbandon"
              type="radio"
              onChange={handleChange}
              errorMessage={errorMessages.initiativeAbandon}
              choices={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" },
              ]}
            />
          </>
        ) : (
          <>
            <TextField
              label="Initiative Number"
              name="initiativeNumber"
              onChange={handleChange}
              errorMessage={errorMessages.initiativeNumber}
              value={formValues.initiativeNumber}
            />
            <TextField
              label="Initiative Name"
              name="initiativeName"
              onChange={handleChange}
              errorMessage={errorMessages.initiativeName}
              value={formValues.initiativeName}
            />
          </>
        )}
      </Flex>
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  selectedInitiative: InitiativePageTemplate | undefined;
}
