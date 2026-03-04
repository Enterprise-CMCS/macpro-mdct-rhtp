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
  Box,
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
import { ExportRateTable } from "components/export/ExportedReportTable";

export const UseOfFundsTableElement = (
  props: PageElementProps<UseOfFundsTableTemplate>
) => {
  const { element, updateElement } = props;
  //   const { fieldLabels, modalInstructions, frequencyOptions } = element;

  const initialValues = {
    id: "",
    budgetPeriod: "",
    spentFunds: "",
    description: "",
    initiative: "",
    useOfFunds: "",
    recipientName: "",
    recipientCategory: "",
  };

  const initialItems = [
    {
      id: "1",
      budgetPeriod: "Budget Period 1",
      spentFunds: "10000",
      description: "Description of how funds were spent",
      initiative: "1",
      useOfFunds: "Use of funds details",
      recipientName: "Recipient Name",
      recipientCategory: "Recipient Category",
    },
    {
      id: "2",
      budgetPeriod: "Budget Period 2",
      spentFunds: "10000",
      description: "Description of how funds were spent",
      initiative: "1",
      useOfFunds: "Use of funds details",
      recipientName: "Recipient Name",
      recipientCategory: "Recipient Category",
    },
  ];

  const budgetPeriodOptions = [
    { label: "- Select an option -", value: "" },
    { label: "Budget Period 1", value: "Budget Period 1" },
    { label: "Budget Period 2", value: "Budget Period 2" },
    { label: "Budget Period 3", value: "Budget Period 3" },
    { label: "Budget Period 4", value: "Budget Period 4" },
  ];

  const initiativeOptions = [
    { label: "- Select an option -", value: "" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
  ];

  const useOfFundsOptions = [
    { label: "- Select an option -", value: "" },
    {
      label: "Prevention and chronic disease",
      value: "Prevention and chronic disease",
    },
    { label: "Provider payments", value: "Provider payments" },
    { label: "Consumer tech solutions", value: "Consumer tech solutions" },
    {
      label: "Training and technical assistance",
      value: "Training and technical assistance",
    },
    { label: "Workforce", value: "Workforce" },
    { label: "IT advances", value: "IT advances" },
    {
      label: "Appropriate care availability",
      value: "Appropriate care availability",
    },
    { label: "Behavioral health", value: "Behavioral health" },
    { label: "Innovative care", value: "Innovative care" },
    {
      label: "Capital expenditures and infrastructure",
      value: "Capital expenditures and infrastructure",
    },
    { label: "Fostering collaboration", value: "Fostering collaboration" },
  ];

  const recipientCategoryOptions = [
    { label: "- Select an option -", value: "" },
    { label: "State agency", value: "State agency" },
    { label: "Local government", value: "Local government" },
    { label: "Rural provider", value: "Rural provider" },
    { label: "EMS provider", value: "EMS provider" },
    {
      label: "Community-based organization",
      value: "Community-based organization",
    },
    {
      label: "University-affiliated health care organization",
      value: "University-affiliated health care organization",
    },
    {
      label: "Non-profit health care organization",
      value: "Non-profit health care organization",
    },
    {
      label: "Other non-profit organization",
      value: "Other non-profit organization",
    },
    {
      label: "Other health care organization",
      value: "Other health care organization",
    },
    { label: "Contractor", value: "Contractor" },
    { label: "Other", value: "Other" },
  ];

  const [items, setItems] = useState(initialItems);

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
      updatedItems = [...items, formValues];
    } else if (modalMode === "Edit") {
      updatedItems = items.map((item) =>
        item.id === selectedItemID ? formValues : item
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
      <Table sx={sx.table}>
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
  // const { fieldLabels } = element;
  // const exportElements = element.answer?.map((eligibility) => {
  //   const label = eligibility.title;
  //   const rows = [
  //     {
  //       indicator: fieldLabels.description,
  //       response: eligibility.description,
  //     },
  //     {
  //       indicator: fieldLabels.recheck,
  //       response: eligibility.recheck,
  //     },
  //     {
  //       indicator: fieldLabels.frequency,
  //       response: eligibility.frequency,
  //     },
  //     {
  //       indicator: fieldLabels.eligibilityUpdate,
  //       response: eligibility.eligibilityUpdate,
  //     },
  //   ];
  //   return { label, rows };
  // });

  // if (!exportElements) return <></>;
  // return <>{ExportRateTable(exportElements)}</>;
  return <div>empty div for now</div>;
};

const sx = {
  addIcon: {
    padding: "3px",
  },
  children: {
    padding: "0 22px",
    border: "4px #0071BC solid",
    borderWidth: "0 0 0 4px",
    margin: "0 14px",
    "input:not(.ds-c-choice)": {
      width: "240px",
    },
    textarea: {
      maxWidth: "440px",
    },
  },
  table: {
    marginBottom: "spacer5",
    tbody: {
      "tr:nth-of-type(even)": {
        td: {
          backgroundColor: "gray_lightest_highlight",
        },
      },
      td: {
        border: "none",
        paddingBottom: "spacer1",
        paddingInlineEnd: "spacer2",
        paddingInlineStart: "spacer2",
        paddingTop: "spacer1",
      },
      label: {
        margin: 0,
      },
    },
    tfoot: {
      td: {
        backgroundColor: "gray_lighter",
        border: "none",
        fontWeight: "bold",
        paddingInlineEnd: "spacer2",
        paddingInlineStart: "spacer2",
      },
    },
    thead: {
      th: {
        backgroundColor: "primary_darkest",
        color: "white",
        fontSize: "lg",
        letterSpacing: "normal",
        lineHeight: "normal",
        paddingBottom: "spacer1",
        paddingInlineEnd: "spacer2",
        paddingInlineStart: "spacer2",
        paddingTop: "spacer1",
        textTransform: "none",
      },
    },
  },
};
