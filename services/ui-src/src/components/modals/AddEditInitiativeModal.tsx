import { ChangeEvent, useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import { ChoiceList, TextField } from "@cmsgov/design-system";
import { Modal } from "./Modal";
import { ErrorMessages } from "../../constants";

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
      [name]: !newValue ? ErrorMessages.requiredResponse : "",
    }));
  };

  // TODO
  const onSubmit = () => {
    modalDisclosure.onClose();
    setFormValues(initialValues);
    setErrorMessages(initialValues);
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onSubmit}
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
              numeric={true}
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
