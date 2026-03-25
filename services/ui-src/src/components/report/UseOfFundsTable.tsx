import {
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Link,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  Flex,
} from "@chakra-ui/react";
import { UseOfFundsTableTemplate, UseOfFundsTableItem } from "types";
import { PageElementProps } from "./Elements";
import { Fragment, useState, ChangeEvent, useEffect } from "react";
import addIcon from "assets/icons/add/icon_add_blue.svg";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import closeIcon from "assets/icons/close/icon_close_primary.svg";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { ErrorMessages } from "../../constants";
import { isValidCurrency } from "utils/validation/inputValidation";

export const UseOfFundsTableElement = (
  props: PageElementProps<UseOfFundsTableTemplate>
) => {
  const { element, updateElement } = props;
  const {
    budgetPeriodOptions,
    initiativeOptions,
    useOfFundsOptions,
    recipientCategoryOptions,
  } = element.dropDownOptions;

  const initialValues = {
    budgetPeriod: "",
    spentFunds: "",
    description: "",
    initiative: "",
    useOfFunds: "",
    recipientName: "",
    recipientCategory: "",
  };

  const [items, setItems] = useState<UseOfFundsTableItem[]>(
    structuredClone(element.answer) || []
  );

  const [formValues, setFormValues] = useState(initialValues);
  const [errorMessages, setErrorMessages] = useState(initialValues);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [selectedItemID, setSelectedItemID] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setErrorMessages(initialValues);
  }, [modalOpen]);

  const validateField = (name: string, value: string) => {
    if (!value) {
      return ErrorMessages.requiredResponse;
    }

    if (name === "spentFunds" && !isValidCurrency(value)) {
      return ErrorMessages.mustBeACurrency;
    }

    return "";
  };

  const handleChange = (
    evt: ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    const { name, value } = evt.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleDeleteClick = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    updateElement({ answer: updatedItems });
  };

  const onSubmit = () => {
    let errors = { ...initialValues };
    let hasError = false;
    for (const key of Object.keys(formValues) as Array<
      keyof typeof formValues
    >) {
      errors[key] = validateField(key, formValues[key]);
      if (errors[key]) hasError = true;
    }
    setErrorMessages(errors);
    if (hasError) return;

    let updatedItems;

    if (modalMode === "Add") {
      const newItem = { ...formValues, id: crypto.randomUUID() };
      updatedItems = [...items, newItem];
    } else if (modalMode === "Edit") {
      updatedItems = items.map((item) =>
        item.id === selectedItemID
          ? { ...formValues, id: selectedItemID }
          : item
      );
    }

    if (!updatedItems) return;

    setItems(updatedItems);
    updateElement({ answer: updatedItems });
    setModalOpen(false);
    setFormValues(initialValues);
  };

  const onAddClick = () => {
    setModalMode("Add");
    setFormValues(initialValues);
    setSelectedItemID("");
    setModalOpen(true);
  };

  const onEditClick = (item: any) => {
    setModalMode("Edit");
    setFormValues(item);
    setSelectedItemID(item.id);
    setModalOpen(true);
  };

  const rows = items.map((item, index) => {
    return (
      <Tr key={index}>
        <Td>
          <Text>{item.budgetPeriod}</Text>
        </Td>
        <Td>
          <Text>${item.spentFunds}</Text>
        </Td>
        <Td>
          <Text>{item.description}</Text>
        </Td>
        <Td>
          <Text>{item.initiative}</Text>
        </Td>
        <Td>
          <Text>{item.useOfFunds}</Text>
        </Td>
        <Td>
          <Text>
            {item.recipientName}; {item.recipientCategory}
          </Text>
        </Td>
        <Td>
          <Flex direction="row">
            <Button
              as={Link}
              variant={"transparent"}
              aria-label={`Edit ${item.id}`}
              onClick={() => {
                onEditClick(item);
              }}
            >
              Edit
            </Button>
            <Button
              variant="plain"
              aria-label={`Delete ${item.id}`}
              onClick={() => {
                handleDeleteClick(item.id);
              }}
            >
              <Image src={cancelIcon} alt={"Delete Item"} />
            </Button>
          </Flex>
        </Td>
      </Tr>
    );
  });

  return (
    <Fragment>
      <Button
        variant={"outline"}
        onClick={() => {
          onAddClick();
        }}
      >
        <Image src={addIcon} alt={"Add Item"} sx={sx.addIcon} />
        Add use of funds
      </Button>
      <Table variant="metric">
        <Thead>
          <Tr>
            <Th>Budget Period</Th>
            <Th>Spent Funds ($)</Th>
            <Th>Description</Th>
            <Th>Init #</Th>
            <Th>Use of Funds</Th>
            <Th>Recipient name and category</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalMode} Use of Funds</ModalHeader>
          <Button
            className="close"
            leftIcon={<Image src={closeIcon} alt="Close" />}
            variant="link"
            onClick={() => setModalOpen(false)}
          >
            Close
          </Button>
          <ModalBody>
            <Flex direction="column" gap="2rem">
              <Text>hint text</Text>
              <Dropdown
                label="Budget Period"
                name="budgetPeriod"
                onChange={handleChange}
                errorMessage={errorMessages.budgetPeriod}
                options={budgetPeriodOptions}
                value={formValues.budgetPeriod}
              />
              <TextField
                label="Spent Funds"
                name="spentFunds"
                onBlur={handleChange}
                onChange={handleChange}
                errorMessage={errorMessages.spentFunds}
                value={formValues.spentFunds}
                mask="currency"
                numeric={true}
              />
              <TextField
                label="Description"
                name="description"
                onBlur={handleChange}
                onChange={handleChange}
                errorMessage={errorMessages.description}
                value={formValues.description}
                multiline={true}
              />
              <Dropdown
                label="Initiative"
                name="initiative"
                onChange={handleChange}
                errorMessage={errorMessages.initiative}
                options={initiativeOptions}
                value={formValues.initiative}
              />
              <Dropdown
                label="Use of Funds"
                name="useOfFunds"
                onChange={handleChange}
                errorMessage={errorMessages.useOfFunds}
                options={useOfFundsOptions}
                value={formValues.useOfFunds}
              />
              <TextField
                label="Recipient Name"
                name="recipientName"
                onBlur={handleChange}
                onChange={handleChange}
                errorMessage={errorMessages.recipientName}
                value={formValues.recipientName}
              />
              <Dropdown
                label="Recipient Category"
                name="recipientCategory"
                onChange={handleChange}
                errorMessage={errorMessages.recipientCategory}
                options={recipientCategoryOptions}
                value={formValues.recipientCategory}
              />
            </Flex>
          </ModalBody>
          <ModalFooter gap="4">
            <Button colorScheme="blue" mr={3} onClick={() => onSubmit()}>
              Save
            </Button>
            <Button variant="link" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Fragment>
  );
};

// The pdf rendering of UseOfFundsTableElement component
export const UseOfFundsTableElementExport = (
  element: UseOfFundsTableTemplate
) => {
  console.log("element", element);
  return <div>empty div for now</div>;
};

const sx = {
  addIcon: {
    padding: "3px",
  },
};
