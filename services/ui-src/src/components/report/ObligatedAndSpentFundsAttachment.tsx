import { Box, Button, Heading, Image, Stack, Text } from "@chakra-ui/react";
import {
  AlertTypes,
  UploadListProp,
  ObligatedAndSpentFundsAttachmentTemplate,
  dropdownEmptyOption,
} from "@rhtp/shared";
import { PageElementProps } from "./Elements";
import { Fragment, useState } from "react";
import addIcon from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import { bytesToKiloBytes, useStore } from "utils";
import { UploadDrawer } from "components/drawers/UploadDrawer";
import { Dropdown as CmsdsDropdownField } from "@cmsgov/design-system";
import {
  uploadListRender,
  downloadFile,
  removeFile,
} from "utils/other/fileUtils";
import { Modal } from "components/modals/Modal";
import { Alert } from "components/alerts/Alert";
import { budgetPeriodOptions, notAnsweredText } from "../../constants";

export const ObligatedAndSpentFundsAttachmentElement = (
  props: PageElementProps<ObligatedAndSpentFundsAttachmentTemplate>
) => {
  const { disabled, element, updateElement } = props;
  const { report } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const { id, state, type: reportType } = report!;
  const { answer, label } = element;
  const files = answer ?? [];
  const [selectedFile, setSelectedFile] = useState<UploadListProp>();

  const budgetPeriodDropdownOptions = [
    dropdownEmptyOption,
    ...budgetPeriodOptions,
  ];
  const [budgetPeriod, setBudgetPeriod] = useState<string>("");

  const saveToReport = (newFiles: UploadListProp[]) => {
    const selectedBudget = budgetPeriodDropdownOptions.find(
      (opt) => opt.value == budgetPeriod
    );
    const modifiedFiles = newFiles.map((file) => ({
      ...file,
      label: selectedBudget?.label,
    }));
    updateElement({ answer: [...files, ...modifiedFiles] });
  };

  const onDeleteModalOpen = (file: UploadListProp) => {
    setDeleteModalOpen(true);
    setSelectedFile(file);
  };

  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  const onRemove = () => {
    if (!selectedFile) return;
    const newFiles = files.filter((file) => file.fileId != selectedFile.fileId);
    updateElement({ answer: newFiles });
    removeFile(reportType, state, id, selectedFile);
    onDeleteModalClose();
  };

  const handleBudgetPeriodChange = (evt: { target: { value: string } }) => {
    setBudgetPeriod(evt.target.value);
  };

  const getNotification = () => {
    const selectedBudget = budgetPeriodDropdownOptions.find(
      (opt) => opt.value == budgetPeriod
    );
    const instruction =
      budgetPeriod === "All" || !budgetPeriod
        ? {
            type: AlertTypes.WARNING,
            text: "Select a budget period to enable upload.",
          }
        : {
            type: AlertTypes.INFO,
            text: `Attaching to: ${selectedBudget?.label}`,
          };

    return {
      instruction: instruction,
      success: `${selectedBudget?.label}`,
    };
  };

  return (
    <Fragment>
      <Button
        variant={"outline"}
        onClick={() => {
          setModalOpen(true);
        }}
        disabled={disabled}
        leftIcon={<Image src={disabled ? addGray : addIcon} />}
      >
        Add Obligated and Spent Funds
      </Button>
      <UploadDrawer
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
            setBudgetPeriod("");
          },
        }}
        selections={
          <CmsdsDropdownField
            name="budgetPeriodFilter"
            label="Filter by Budget Period"
            value={budgetPeriod}
            onChange={handleBudgetPeriodChange}
            options={budgetPeriodDropdownOptions}
          />
        }
        modalHeading={"Add Obligated and Spent Funds"}
        answer={files}
        saveToReport={saveToReport}
        deleteFromReport={onRemove}
        notification={getNotification()}
      ></UploadDrawer>
      {files.length > 0 && (
        <Heading as="h2" fontWeight="bold" marginBottom="-0.5rem">
          {label}
        </Heading>
      )}
      {uploadListRender(
        reportType,
        state,
        id,
        files,
        onDeleteModalOpen,
        downloadFile,
        disabled
      )}

      <Modal
        modalDisclosure={{
          isOpen: deleteModalOpen,
          onClose: onDeleteModalClose,
        }}
        onConfirmHandler={onRemove}
        content={{
          heading: "Delete Obligated and Spent Funds",
          actionButtonText: "Delete",
        }}
        disableConfirm={disabled}
      >
        <Alert status={AlertTypes.WARNING} title="Warning">
          Deleting this attachment will remove it from the Obligated and Spent
          Funds page.
        </Alert>
        <Box mt={"spacer3"} mb={"spacer_half"}>
          <Text sx={sx.uploadedLabel}>File</Text>
        </Box>
        {uploadListRender(
          reportType,
          state,
          id,
          selectedFile ? [selectedFile] : [],
          undefined,
          downloadFile
        )}
      </Modal>
    </Fragment>
  );
};

// The pdf rendering of ObligatedAndSpentFundsAttachmentElement component
export const ObligatedAndSpentFundsAttachmentElementExport = (
  element: ObligatedAndSpentFundsAttachmentTemplate
) => {
  if (element.answer && element.answer.length > 0) {
    const label = element.answer[0].label;
    const name = element.answer[0].name;
    const size = element.answer[0].size;
    return (
      <Stack>
        <Box fontWeight="bold">{label}</Box>
        <Box>{name}</Box>
        <Box color="gray">{bytesToKiloBytes(size)} KB</Box>
      </Stack>
    );
  } else {
    return notAnsweredText;
  }
};

const sx = {
  uploadedLabel: {
    marginBottom: ".50rem",
    fontWeight: "600",
  },
};
