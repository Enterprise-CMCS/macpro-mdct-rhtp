import { ChangeEvent, useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { ChoiceList, TextField } from "@cmsgov/design-system";
import { Modal } from "./Modal";
import { ErrorMessages } from "../../constants";
import {
  createInitiative,
  updateInitiative,
} from "utils/api/requestMethods/initiatives";
import { getReport, useStore } from "utils";

const initialValues = {
  initiativeName: "",
  initiativeNumber: "",
  initiativeAbandon: "",
  initiativeAttestation: false,
};

export const AddEditInitiativeModal = ({
  modalDisclosure,
  selectedInitiative,
}: Props) => {
  const { report, updateReport } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [errorMessages, setErrorMessages] = useState(initialValues);

  useEffect(() => {
    if (selectedInitiative) {
      setFormValues({
        initiativeName: selectedInitiative.title,
        initiativeAbandon: "",
        initiativeNumber: "",
        initiativeAttestation: false,
      });
    } else {
      setFormValues(initialValues);
    }
  }, [selectedInitiative]);

  const onClose = () => {
    modalDisclosure.onClose();
    setSubmitting(false);
    setFormValues(initialValues);
    setErrorMessages(initialValues);
  };

  const validateField = (value: string | boolean) => {
    if (!value) {
      return ErrorMessages.requiredResponse;
    }
    return "";
  };

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    const newValue =
      name === "initiativeAttestation"
        ? !formValues.initiativeAttestation
        : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: validateField(newValue),
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
        (key === "initiativeNumber" || key === "initiativeAttestation")
      )
        continue;
      errors[key] = validateField(value);
      if (errors[key] !== "") hasError = true;
    }
    setErrorMessages(errors);
    if (hasError) return;

    setSubmitting(true);
    const {
      initiativeName,
      initiativeNumber,
      initiativeAttestation,
      initiativeAbandon,
    } = formValues;
    if (initiativeAttestation) {
      const newInitiative = {
        initiativeName,
        initiativeNumber,
        initiativeAttestation,
      };
      await createInitiative(report, newInitiative);
    } else if (selectedInitiative) {
      const updatedInitiative = {
        initiativeName,
        initiativeAbandon: initiativeAbandon === "No" ? false : true,
      };
      await updateInitiative(report, updatedInitiative, selectedInitiative.id);
    }

    const newReport = await getReport(report.type, report.state, report.id);
    updateReport(newReport);
    onClose();
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
        heading: "Add Initiative",
        actionButtonText: "Save",
        closeButtonText: "Cancel",
      }}
    >
      <Flex direction="column" gap="2rem">
        {selectedInitiative ? (
          <>
            <TextField
              label="Initiative Name"
              name="initiativeName"
              onChange={handleChange}
              errorMessage={errorMessages.initiativeName}
              value={formValues.initiativeName}
            />
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
            <ChoiceList
              label="Attestation"
              name="initiativeAttestation"
              type="checkbox"
              onChange={handleChange}
              errorMessage={errorMessages.initiativeAttestation}
              choices={[
                {
                  label: "I have been granted approval to add a new initiative",
                  value: "",
                  checked: formValues.initiativeAttestation,
                },
              ]}
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
  selectedInitiative: any;
}
