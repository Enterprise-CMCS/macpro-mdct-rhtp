import { Button, Link, Image, Flex } from "@chakra-ui/react";
import {
  UseOfFundsTableTemplate,
  UseOfFundsTableItem,
  dropdownEmptyOption,
  MaskType,
} from "@rhtp/shared";
import { PageElementProps } from "./Elements";
import { Fragment, useState, ChangeEvent, useEffect } from "react";
import addIcon from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { ErrorMessages } from "../../constants";
import {
  isValidCurrency,
  unmaskByType,
} from "utils/validation/inputValidation";
import { useStore } from "utils";
import { Modal } from "components/modals/Modal";
import { ResponsiveTable } from "components/tables/ResponsiveTable";

export const UseOfFundsTableElement = (
  props: PageElementProps<UseOfFundsTableTemplate>
) => {
  const { disabled, element, updateElement } = props;
  const { budgetPeriodOptions, useOfFundsOptions, recipientCategoryOptions } =
    element.dropDownOptions;
  const { report } = useStore();

  // Initiative options are dynamic and are generated based on the initiatives added previously in the form
  const initiatives = report?.pages.filter(
    (page) => "initiativeNumber" in page
  );
  const initiativeOptions = [
    dropdownEmptyOption,
    ...(initiatives ?? []).map((initiative) => ({
      label: `${initiative.initiativeNumber}: ${initiative.title}`,
      value: initiative.initiativeNumber,
    })),
  ];

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

  const formatAnswer = (items: UseOfFundsTableItem[]) => {
    return items.map((item) => {
      return {
        ...item,
        spentFunds: unmaskByType(MaskType.CommaSeparated, item.spentFunds),
      };
    });
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
    const newAnswer = formatAnswer(updatedItems);
    updateElement({ answer: newAnswer });
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

  const rows = items.map((item) => {
    const columnActions = (
      <Flex direction="row">
        <Button
          as={disabled ? Button : Link}
          variant={disabled ? "link" : "transparent"}
          aria-label={`Edit ${item.id}`}
          onClick={() => {
            onEditClick(item);
          }}
          disabled={disabled}
        >
          Edit
        </Button>
        <Button
          variant="plain"
          aria-label={`Delete ${item.id}`}
          onClick={() => {
            handleDeleteClick(item.id);
          }}
          disabled={disabled}
        >
          <Image src={cancelIcon} alt={"Delete Item"} minW="1.5rem" />
        </Button>
      </Flex>
    );

    return [
      item.budgetPeriod,
      item.spentFunds,
      item.description,
      item.initiative,
      item.useOfFunds,
      item.recipientName,
      item.recipientCategory,
      columnActions,
    ];
  });

  return (
    <Fragment>
      <Button
        variant={"outline"}
        onClick={() => {
          onAddClick();
        }}
        disabled={disabled}
        leftIcon={<Image src={disabled ? addGray : addIcon} />}
      >
        Add use of funds
      </Button>
      {rows.length > 0 &&
        ResponsiveTable(
          [
            { label: "Period" },
            { label: "$ Spent" },
            { label: "Description" },
            { label: "Init #" },
            { label: "Use" },
            { label: "Recipient" },
            { label: "Category" },
            { label: "Actions" },
          ],
          rows,
          "metric"
        )}

      <Modal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => setModalOpen(false),
        }}
        content={{
          heading: `${modalMode} Use of Funds`,
          actionButtonText: "Save",
          closeButtonText: "Cancel",
        }}
        onConfirmHandler={onSubmit}
      >
        <Flex direction="column" gap="2rem" marginTop="1.5rem">
          <Dropdown
            label="Budget period"
            name="budgetPeriod"
            onChange={handleChange}
            errorMessage={errorMessages.budgetPeriod}
            options={budgetPeriodOptions}
            value={formValues.budgetPeriod}
          />
          <TextField
            label="Spent funds"
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
            label="Use of funds"
            name="useOfFunds"
            onChange={handleChange}
            errorMessage={errorMessages.useOfFunds}
            options={useOfFundsOptions}
            value={formValues.useOfFunds}
          />
          <TextField
            label="Recipient name"
            name="recipientName"
            onBlur={handleChange}
            onChange={handleChange}
            errorMessage={errorMessages.recipientName}
            value={formValues.recipientName}
          />
          <Dropdown
            label="Recipient category"
            name="recipientCategory"
            onChange={handleChange}
            errorMessage={errorMessages.recipientCategory}
            options={recipientCategoryOptions}
            value={formValues.recipientCategory}
          />
        </Flex>
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
