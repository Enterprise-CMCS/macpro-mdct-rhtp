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
import { ChoiceList, TextField } from "@cmsgov/design-system";
import { ErrorMessages } from "../../constants";
import { ExportRateTable } from "components/export/ExportedReportTable";

export const UseOfFundsTableElement = (
  props: PageElementProps<UseOfFundsTableTemplate>
) => {
  const { element, updateElement } = props;
  //   const { fieldLabels, modalInstructions, frequencyOptions } = element;

  const initialValues = {
    id: "",
    spentFunds: "",
    description: "",
    init: "",
    useOfFunds: "",
    recipientName: "",
    recipientCategory: "",
  };

  const initialItems = [
    {
      id: "1",
      spentFunds: "10000",
      description: "Description of how funds were spent",
      init: "1",
      useOfFunds: "Use of funds details",
      recipientName: "Recipient Name",
      recipientCategory: "Recipient Category",
    },
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

  const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
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
        <Td width="100%" padding="spacer2 !important">
          <Text>{item.id}</Text>
        </Td>
        <Td>
          <Button
            as={Link}
            variant={"outline"}
            aria-label={`Edit ${item.id}`}
            onClick={() => {
              onEditClick(item);
            }}
          >
            Edit
          </Button>
        </Td>
        <Td>
          <Button
            variant="plain"
            aria-label={`Delete ${item.id}`}
            onClick={() => {
              handleDeleteClick(item.id);
            }}
          >
            <Image src={cancelIcon} alt={"Delete Item"} />
          </Button>
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
      <Table variant="measure">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Spent Funds</Th>
            <Th>Description</Th>
            <Th>Init #</Th>
            <Th>Use of Funds</Th>
            <Th>Recipient Name</Th>
            <Th>Recipient Category</Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalMode} Use of FUnds</ModalHeader>
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
              <TextField
                label="Description"
                name="description"
                onBlur={handleChange}
                onChange={handleChange}
                errorMessage={errorMessages.description}
                value={formValues.description}
              />
              {/* <TextField
                label={fieldLabels.description}
                name="description"
                onBlur={handleChange}
                onChange={handleChange}
                multiline
                errorMessage={errorMessages.description}
                value={formValues.description}
              /> */}
              {/* <ChoiceList
                name={"recheck"}
                type={"radio"}
                errorMessage={errorMessages.recheck}
                label={fieldLabels.recheck}
                choices={[
                  {
                    label: "No",
                    value: "No",
                    checked: formValues.recheck === "No",
                  },
                  {
                    label: "Yes",
                    value: "Yes",
                    checked: formValues.recheck === "Yes",
                    checkedChildren: [
                      <Box key="radio-sub-page" sx={sx.children}>
                        <ChoiceList
                          name={"frequency"}
                          type={"radio"}
                          label={fieldLabels.frequency}
                          errorMessage={errorMessages.frequency}
                          choices={frequencyOptions.map((option) => {
                            return {
                              label: option.label,
                              value: option.value,
                              checked: formValues.frequency === option.value,
                            };
                          })}
                          onChange={handleChange}
                        />
                      </Box>,
                    ],
                  },
                ]}
                onChange={handleChange}
              /> */}
              {/* <ChoiceList
                name={"eligibilityUpdate"}
                type={"radio"}
                errorMessage={errorMessages.eligibilityUpdate}
                label={fieldLabels.eligibilityUpdate}
                choices={[
                  {
                    label: "No",
                    value: "No",
                    checked: formValues.eligibilityUpdate === "No",
                  },
                  {
                    label: "Yes",
                    value: "Yes",
                    checked: formValues.eligibilityUpdate === "Yes",
                  },
                ]}
                onChange={handleChange}
              /> */}
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
};
