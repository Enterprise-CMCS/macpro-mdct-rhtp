import {
  Accordion,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { AccordionItem } from "components/accordions/AccordionItem";
import { PageTemplate } from "components/layout/PageTemplate";
import { ResponsiveTable } from "components/tables/ResponsiveTable";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import { JSX, useEffect, useState } from "react";
import { Modal } from "components/modals/Modal";
import { TextField } from "@cmsgov/design-system";
import { MultiSelect } from "components/forms/Multiselect";
import { isEmail } from "utils/validation/inputValidation";
import {
  NotificationRecipientRecord,
  StateDropdownOptions,
} from "@rhtp/shared";
import {
  createNotificationRecipient,
  deleteNotificationRecipient,
  getNotificationRecipients,
} from "utils/api/requestMethods/notificationRecipients";

const DeleteRecipientModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  selectedRecipient,
}: DeleteRecipientModalProps) => {
  const [loading, setLoading] = useState(false);
  const { assignedStatesAndIds, email } = selectedRecipient;

  const onClose = () => {
    setLoading(false);
    modalDisclosure.onClose();
  };

  const onDelete = async () => {
    setLoading(true);
    for (const { state, id } of assignedStatesAndIds) {
      await deleteNotificationRecipient(state, id);
    }
    parentOnSubmit();
    onClose();
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      content={{
        heading: `Are you sure you want to delete ${email}?`,
        subheading:
          "Deleting this user from the notifications center will disable any future notifications from being sent or received to the email address listed above.",
        actionButtonText: "Delete",
      }}
      onConfirmHandler={onDelete}
      submitting={loading}
    />
  );
};

type DeleteRecipientModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  selectedRecipient: CollectedStateRecipientRecord;
};

const EditRecipientModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  selectedRecipient,
}: EditRecipientModalProps) => {
  const defaultValue: {
    email: string;
    states: string[];
  } = {
    email: selectedRecipient.email,
    states: selectedRecipient.assignedStates,
  };

  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setLoading(false);
    setDisplayValue(defaultValue);
    setErrorMessage(defaultErrorMessage);
    modalDisclosure.onClose();
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

  const onSubmit = async () => {
    let isValid = true;
    const errors = {
      ...defaultErrorMessage,
    };
    if (displayValue.states.length === 0) {
      errors.states = errorContent.states;
      isValid = false;
    }

    if (!isValid) {
      setErrorMessage(errors);
      return;
    }

    setLoading(true);
    // identify added and removed states
    const { assignedStatesAndIds, email, assignedStates } = selectedRecipient;
    const deletedStates = assignedStates.filter(
      (state) => !displayValue.states.includes(state)
    );
    const newStates = displayValue.states.filter(
      (state) => !assignedStates.includes(state)
    );
    for (const newState of newStates) {
      await createNotificationRecipient(newState, { email });
    }
    for (const deletedState of deletedStates) {
      const { id } =
        assignedStatesAndIds.find(({ state }) => state === deletedState) || {};
      if (id) await deleteNotificationRecipient(deletedState, id);
    }

    await parentOnSubmit();
    onClose();
  };

  return (
    <Modal
      modalDisclosure={{
        ...modalDisclosure,
        onClose: onClose,
      }}
      content={{
        heading: "Edit assigned states",
        actionButtonText: "Save",
      }}
      onConfirmHandler={onSubmit}
      submitting={loading}
    >
      <Flex sx={sx.modalInputs}>
        <TextField
          name="email"
          label="Email"
          value={displayValue.email}
          disabled={true}
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

type EditRecipientModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  selectedRecipient: CollectedStateRecipientRecord;
};

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

const NotificationRecipientModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
}: NotificationRecipientModalProps) => {
  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const [loading, setLoading] = useState(false);

  const onClose = () => {
    setLoading(false);
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

  const onSubmit = async () => {
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

    setLoading(true);
    for (const state of displayValue.states) {
      await createNotificationRecipient(state, { email: displayValue.email });
    }
    await parentOnSubmit();
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
      submitting={loading}
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

type NotificationRecipientModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
};

const headers = [{ label: "Email" }, { label: "States" }, { label: "Actions" }];

const accordionContent = {
  label: "Accordion heading",
  content: "More info coming soon",
};

type CollectedStateRecipientRecord = NotificationRecipientRecord & {
  assignedStatesAndIds: { state: string; id: string }[];
  assignedStates: string[];
};

export const NotificationsPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rows, setRows] = useState<(string | JSX.Element)[][]>([]);
  const [selectedRecipient, setSelectedRecipient] =
    useState<CollectedStateRecipientRecord>();
  const [loading, setLoading] = useState(false);

  const onEditModalOpen = (recipient: CollectedStateRecipientRecord) => {
    setSelectedRecipient(recipient);
    setEditModalOpen(true);
  };

  const onDeleteModalOpen = (recipient: CollectedStateRecipientRecord) => {
    setSelectedRecipient(recipient);
    setDeleteModalOpen(true);
  };

  const onModalClose = () => {
    setSelectedRecipient(undefined);
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const formatRows = async () => {
    setLoading(true);
    const allRecipients = await getNotificationRecipients();
    const formattedRows: (string | JSX.Element)[][] = [];

    const emailRecipientMap = new Map();
    allRecipients.map((recipient) => {
      const assignedStates =
        emailRecipientMap.get(recipient.email)?.assignedStates || [];
      const assignedStatesAndIds =
        emailRecipientMap.get(recipient.email)?.assignedStatesAndIds || [];
      emailRecipientMap.set(recipient.email, {
        ...recipient,
        assignedStates: [...assignedStates, recipient.state],
        assignedStatesAndIds: [
          ...assignedStatesAndIds,
          { state: recipient.state, id: recipient.id },
        ],
      });
    });

    emailRecipientMap.forEach((value, key) => {
      const email = key;
      const states = value.assignedStates.toSorted().join(", ");
      const columnActions = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => onEditModalOpen(value)}
            aria-label={`Edit recipient ${email}`}
          >
            Edit
          </Button>
          <Button
            variant="link"
            onClick={() => onDeleteModalOpen(value)}
            aria-label={`Delete recipient ${email}`}
          >
            Delete
          </Button>
        </HStack>
      );

      formattedRows.push([email, states, columnActions]);
    });
    setRows(formattedRows);
    setLoading(false);
  };

  useEffect(() => {
    formatRows();
  }, []);

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
          onClick={() => setAddModalOpen(true)}
          sx={sx.addEmailButton}
        >
          Add email
        </Button>
      </Box>
      {ResponsiveTable(headers, rows)}
      {rows.length === 0 &&
        (loading ? (
          <Box alignSelf={"center"}>
            <Spinner />
          </Box>
        ) : (
          <Text variant="tableEmpty">
            Click "Add email" to start adding assigned notification recipients.
          </Text>
        ))}
      <NotificationRecipientModal
        modalDisclosure={{
          isOpen: addModalOpen,
          onClose: onModalClose,
        }}
        onSubmit={formatRows}
      />
      {selectedRecipient && (
        <EditRecipientModal
          modalDisclosure={{
            isOpen: editModalOpen,
            onClose: onModalClose,
          }}
          onSubmit={formatRows}
          selectedRecipient={selectedRecipient}
        />
      )}
      {selectedRecipient && (
        <DeleteRecipientModal
          modalDisclosure={{
            isOpen: deleteModalOpen,
            onClose: onModalClose,
          }}
          onSubmit={formatRows}
          selectedRecipient={selectedRecipient}
        />
      )}
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
