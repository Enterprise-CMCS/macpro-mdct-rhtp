import { Heading, Text, Button, Stack, Box, Spinner } from "@chakra-ui/react";
import { PageTemplate } from "components";
import { ResponsiveTable } from "components/tables/ResponsiveTable";
import { TextField, ChoiceList } from "@cmsgov/design-system";
import {
  getDataSets,
  DataSetType,
  createDataSet,
  updateDataSet,
} from "dataSet/component/api/requestMethods/datasets";
import { JSX, useState, useEffect } from "react";
import { Modal } from "components/modals/Modal";

const headers = [
  { label: "Data Set Name" },
  { label: "Status" },
  { label: "Actions" },
];

type DataSetModalProps = {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onSubmit: Function;
  dataSet?: DataSetType;
  state: "Add" | "Edit";
};

const defaultDataSet = {
  name: "",
  status: undefined,
};

const DataSetModal = ({
  modalDisclosure,
  onSubmit: parentOnSubmit,
  dataSet,
  state,
}: DataSetModalProps) => {
  const errorContent = {
    name: "Must enter a valid data set name.",
    status: "Must select at least one state.",
  };
  const [displayValue, setDisplayValue] = useState(dataSet ?? defaultDataSet);
  const [errorMessage, setErrorMessage] = useState({ name: "", status: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayValue(dataSet ?? defaultDataSet);
  }, [dataSet]);

  const onClose = () => {
    setLoading(false);
    setDisplayValue(defaultDataSet);
    setErrorMessage({ name: "", status: "" });
    modalDisclosure.onClose();
  };

  const onBlur = (key: "name" | "status") => {
    if (!displayValue[key])
      setErrorMessage({ ...errorMessage, [key]: errorContent[key] });
    else setErrorMessage({ ...errorMessage, [key]: "" });
  };

  const onSubmit = async () => {
    const newErrors = { ...errorMessage };
    const values = Object.entries(displayValue);
    values.forEach((item) => {
      const key = item[0] as keyof typeof errorContent;
      newErrors[key] = !item[1] ? errorContent[key] : "";
    });
    setErrorMessage(newErrors);

    if (values.some((item) => item[1] === "" || item[1] === undefined)) return;

    setLoading(true);
    try {
      if (state === "Add") {
        await createDataSet(displayValue as any);
      } else if (state === "Edit") {
        await updateDataSet(displayValue as any);
      }
    } finally {
      setLoading(false);
      parentOnSubmit();
      modalDisclosure.onClose();
    }
  };

  return (
    <Modal
      modalDisclosure={{
        ...modalDisclosure,
        onClose: onClose,
      }}
      content={{
        heading: `${state} Data Set`,
        actionButtonText: `${state} Data Set`,
        closeButtonText: "Cancel",
      }}
      onConfirmHandler={onSubmit}
      submitting={loading}
    >
      <Stack gap="1.5rem">
        <TextField
          name="data-set-name"
          label="Data Set Name"
          hint="Enter the data set name shown to states in drop-down menus."
          value={displayValue.name}
          onChange={({ target }) => {
            setDisplayValue({
              ...displayValue,
              name: target.value,
            });
          }}
          onBlur={() => onBlur("name")}
          errorMessage={errorMessage.name}
        />
        <ChoiceList
          name={"data-set-status"}
          type={"radio"}
          label={"Status"}
          hint="Inactive data sets are hidden from state submission options but preserved in historic admin exports."
          choices={[
            {
              label: "Active (Visible to states)",
              value: 1,
              checked: displayValue.status,
            },
            {
              label: "Inactive (Hidden from states)",
              value: 0,
              checked: displayValue.status,
            },
          ]}
          onChange={({ target }) => {
            setDisplayValue({
              ...displayValue,
              status: target.value,
            });
          }}
          onBlur={() => onBlur("status")}
          errorMessage={errorMessage.status}
        />
      </Stack>
    </Modal>
  );
};

export const ManageDataSets = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState<(string | JSX.Element)[][]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<
    DataSetType | undefined
  >();
  const [modalState, setModalSet] = useState<"Add" | "Edit">("Add");
  const [loading, setLoading] = useState(false);

  const formatRows = async () => {
    setLoading(true);
    const allDataSets = await getDataSets();
    const formattedRows: (string | JSX.Element)[][] = [];

    allDataSets.forEach((dataSet) => {
      const name = dataSet.name;
      const status = dataSet.status;
      const columnActions = (
        <Button
          variant="outline"
          onClick={() => {
            setSelectedDataSet(dataSet);
            setModalSet("Edit");
            setModalOpen(true);
          }}
          aria-label={`Edit Data Set ${name}`}
        >
          Edit
        </Button>
      );

      formattedRows.push([name, status ? "Active" : "Inactive", columnActions]);
    });
    setRows(formattedRows);
    setLoading(false);
  };

  useEffect(() => {
    formatRows();
  }, []);

  return (
    <PageTemplate>
      <Stack gap="1.5rem">
        <Heading as="h1" id="AdminHeader" tabIndex={-1} variant="h1">
          Manage Data Sets
        </Heading>
        <Text sx={sx.subHeaderText}>
          Add, edit, or disable data set categories available to states during
          file submission.
        </Text>
        <Button
          onClick={() => {
            setSelectedDataSet(undefined);
            setModalOpen(true);
          }}
        >
          Add Data Set
        </Button>
      </Stack>
      {ResponsiveTable(headers, rows)}
      {rows.length === 0 &&
        (loading ? (
          <Box alignSelf={"center"}>
            <Spinner />
          </Box>
        ) : (
          <Text variant="tableEmpty">
            No data sets created yet. Click Add Data Set to create your first
            set.
          </Text>
        ))}
      <DataSetModal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        onSubmit={formatRows}
        state={modalState}
        dataSet={selectedDataSet}
      />
    </PageTemplate>
  );
};

const sx = {
  subHeaderText: {
    color: "gray_dark",
  },
};
