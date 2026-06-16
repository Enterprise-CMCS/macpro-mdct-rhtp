import {
  Accordion,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import { AccordionItem } from "components/accordions/AccordionItem";
import { PageTemplate } from "components/layout/PageTemplate";
import {
  ResponsiveTable,
  TableRowType,
} from "components/tables/ResponsiveTable";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import { useState } from "react";
import { Modal } from "components/modals/Modal";
import { TextField } from "@cmsgov/design-system";
import { MultiSelect } from "components/forms/Multiselect";
import { isEmail } from "utils/validation/inputValidation";
import { StateDropdownOptions } from "@rhtp/shared";

const defaultValue: {
  email: string;
  states: string[];
} = {
  email: "",
  states: [],
};
const defaultErrorMessage: {
  email: string;
  states: string;
} = {
  email: "",
  states: "",
};
const errorContent = {
  email: "Must enter a valid email.",
  states: "Must select at least one state.",
};

const AddEmailModal = ({ modalDisclosure }: AddEmailModalProps) => {
  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);

  const onClose = () => {
    setDisplayValue(defaultValue);
    setErrorMessage(defaultErrorMessage);
    modalDisclosure.onClose();
  };

  const onEmailBlur = () => {
    let emailError = "";
    if (displayValue.email === "" || !isEmail(displayValue.email)) {
      emailError = errorContent.email;
    }
    setErrorMessage({
      ...errorMessage,
      email: emailError,
    });
  };

  const onStateSelectionChange = (selected: string[]) => {
    setDisplayValue({
      ...displayValue,
      states: selected,
    });
    let statesError = "";
    if (selected.length === 0) {
      statesError = errorContent.states;
    }
    setErrorMessage({
      ...errorMessage,
      states: statesError,
    });
  };

  const onSubmit = () => {
    let isValid = true;
    const errors = {
      ...defaultErrorMessage,
    };
    if (displayValue.email === "" || !isEmail(displayValue.email)) {
      errors.email = errorContent.email;
      isValid = false;
    }
    if (displayValue.states.length === 0) {
      errors.states = errorContent.states;
      isValid = false;
    }

    if (!isValid) {
      setErrorMessage(errors);
      return;
    }

    // TODO: create endpoints and submit values
    onClose();
  };

  return (
    <Modal
      modalDisclosure={{
        ...modalDisclosure,
        onClose: onClose,
      }}
      content={{
        heading: "Add Email",
        actionButtonText: "Save",
      }}
      onConfirmHandler={onSubmit}
    >
      <Flex sx={sx.modalInputs}>
        <TextField
          name="email"
          label="Email"
          value={displayValue.email}
          onChange={({ target }) => {
            setDisplayValue({
              ...displayValue,
              email: target.value,
            });
          }}
          onBlur={onEmailBlur}
          errorMessage={errorMessage.email}
        />
        <MultiSelect
          label="States"
          placeholder=""
          countLabel="States"
          options={StateDropdownOptions}
          values={displayValue.states}
          onChange={(selected) => onStateSelectionChange(selected)}
          errorMessage={errorMessage.states}
        />
      </Flex>
    </Modal>
  );
};

type AddEmailModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
};

const headers = [{ label: "Email" }, { label: "States" }, { label: "Actions" }];

const accordionContent = {
  label: "Accordion heading",
  content: "More info coming soon",
};

export const NotificationsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const rows: TableRowType[][] = [];

  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" id="AdminHeader" tabIndex={-1} sx={sx.headerText}>
          Notifications Settings
        </Heading>
        <Text sx={sx.subHeaderText}>
          Instructions go here that need to be seen at all times. Provide
          details and context to help the user complete this page.
        </Text>
        <Accordion allowToggle={true} defaultIndex={[-1]} sx={sx.accordion}>
          <AccordionItem label={accordionContent.label}>
            {accordionContent.content}
          </AccordionItem>
        </Accordion>
        <Button
          variant="outline"
          leftIcon={<Image src={addPrimary} alt="Add icon" />}
          onClick={() => setModalOpen(true)}
          sx={sx.addEmailButton}
        >
          Add email
        </Button>
      </Box>
      {ResponsiveTable(headers, rows)}
      {rows.length === 0 && (
        <Text variant="tableEmpty">
          Click "Add email" to start adding assigned notification recipients.
        </Text>
      )}
      <AddEmailModal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => setModalOpen(false),
        }}
      />
    </PageTemplate>
  );
};

const sx = {
  headerText: {
    marginBottom: "spacer2",
    fontSize: "heading_3xl",
    fontWeight: "heading_3xl",
  },
  subHeaderText: {
    color: "gray_dark",
  },
  accordion: {
    marginY: "spacer2",
  },
  addEmailButton: {
    marginTop: "spacer3",
    height: "2.25rem",
    width: "10.25rem",
  },
  modalInputs: {
    gap: "1rem",
    flexDirection: "column",
  },
};
