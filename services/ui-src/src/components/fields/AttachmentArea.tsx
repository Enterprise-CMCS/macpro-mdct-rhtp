import {
  AlertTypes,
  AttachmentAreaTemplate,
  UploadListProp,
} from "@rhtp/shared";
import { PageElementProps } from "components/report/Elements";
import { Button, Stack, Image, Box } from "@chakra-ui/react";
import { UploadDrawer } from "components/drawers/UploadDrawer";
import { useState } from "react";
import { bytesToKiloBytes, optionalTag, useStore } from "utils";
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
import { notAnsweredText } from "../../constants";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { disabled } = props;
  const {
    helperText,
    answer,
    subLabel,
    disabled: elementDisabled,
  } = props.element;
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

  const isDisabled = () => {
    return disabled || elementDisabled;
  };

  return (
    <Stack gap="0">
      <Label fieldId={id}>{optionalTag(props.element)}</Label>
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
          isDisabled()
        )}
      <Button
        mt="spacer2"
        width="fit-content"
        onClick={() => setModalOpen(true)}
        variant="outline"
        leftIcon={<Image src={isDisabled() ? addGray : addIconPrimary} />}
        disabled={isDisabled()}
      >
        Upload Attachments
      </Button>
      <UploadDrawer
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        hint={subLabel}
        answer={files}
        saveToReport={saveToReport}
        deleteFromReport={onRemove}
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

export const AttachmentAreaExport = (element: AttachmentAreaTemplate) => {
  if (element.answer && element.answer.length > 0) {
    const name = element.answer[0].name;
    const size = element.answer[0].size;
    return (
      <Stack>
        <Box>{name}</Box>
        <Box color="gray">{bytesToKiloBytes(size)} KB</Box>
      </Stack>
    );
  } else {
    return notAnsweredText;
  }
};
