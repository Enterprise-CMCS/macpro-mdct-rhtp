import {
  AlertTypes,
  AttachmentAreaTemplate,
  UploadListProp,
} from "@rhtp/shared";
import { PageElementProps } from "components/report/Elements";
import { Button, Stack, Image, Text, Box } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";
import { useStore } from "utils";
import {
  downloadFile,
  uploadListRender,
  removeFile,
} from "utils/other/fileUtils";
import { Hint, Label } from "@cmsgov/design-system";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import { Modal } from "components/modals/Modal";
import { Alert } from "components/alerts/Alert";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { disabled } = props;
  const { label, helperText, answer, uploadedSubLabel } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<UploadListProp>();
  const { report } = useStore();
  const { id, state, type: reportType } = report!;

  const updateElement = props.updateElement;
  const files = answer ?? [];

  if (!state || !id || !reportType) {
    console.error("Can't retrieve uploads with missing state, id or type");
    return;
  }

  const onModalClose = () => {
    setModalOpen(false);
  };

  const onDeleteModalOpen = (file: UploadListProp) => {
    setDeleteModalOpen(true);
    setSelectedFile(file);
  };

  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
    setSelectedFile(undefined);
  };

  const onRemove = () => {
    if (!selectedFile) return;
    const newFiles = files.filter((file) => file.fileId != selectedFile.fileId);
    updateElement({ answer: newFiles });
    removeFile(reportType, state, id, selectedFile);
    onDeleteModalClose();
  };

  const saveToReport = (newFiles: UploadListProp[]) => {
    updateElement({ answer: [...files, ...newFiles] });
  };

  return (
    <Stack gap="0">
      <Label fieldId={id}>{label}</Label>
      {helperText && <Hint id={id}>{helperText}</Hint>}
      {files.length > 0 &&
        uploadListRender(
          reportType,
          state,
          id,
          files,
          onDeleteModalOpen,
          downloadFile,
          false,
          disabled
        )}
      <Button
        width="fit-content"
        onClick={() => setModalOpen(true)}
        variant="outline"
        leftIcon={<Image src={disabled ? addGray : addIconPrimary} />}
        disabled={disabled}
      >
        Upload Attachments
      </Button>
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        answer={files}
        saveToReport={saveToReport}
        deleteFromReport={onRemove}
        uploadedSubLabel={uploadedSubLabel}
      />
      {/** delete file modal */}
      <Modal
        modalDisclosure={{
          isOpen: deleteModalOpen,
          onClose: onDeleteModalClose,
        }}
        onConfirmHandler={onRemove}
        content={{
          heading: "Delete Attachment",
          actionButtonText: "Delete",
        }}
      >
        <Alert status={AlertTypes.WARNING} title="Warning">
          Deleting this attachment will remove it from the state policy
          commitment
        </Alert>
        <Box mt={"spacer3"} mb={"spacer_half"}>
          <Text sx={sx.uploadedLabel}>File</Text>
          <Text sx={sx.uploadedSubLabel}>{uploadedSubLabel}</Text>
        </Box>
        {uploadListRender(
          reportType,
          state,
          id,
          selectedFile ? [selectedFile] : [],
          onRemove,
          downloadFile,
          true // hide remove icon in delete modal
        )}
      </Modal>
    </Stack>
  );
};

const sx = {
  uploadedLabel: {
    marginBottom: ".50rem",
    fontWeight: "600",
  },
  uploadedSubLabel: {
    fontSize: "body_sm",
    fontWeight: "body_sm",
    color: "gray_dark",
  },
};
