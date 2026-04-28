import { AttachmentAreaTemplate, UploadListProp } from "@rhtp/shared";
import { PageElementProps } from "components/report/Elements";
import { Button, Stack, Image } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";
import { useStore } from "utils";
import { downloadFile, uploadListRender, removeFile } from "utils/other/upload";
import { Hint, Label } from "@cmsgov/design-system";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { disabled } = props;
  const { label, helperText, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
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

  const onRemove = (exfile: UploadListProp) => {
    const newFiles = files.filter((file) => file.fileId != exfile.fileId);
    updateElement({ answer: newFiles });
    removeFile(reportType, state, id, exfile);
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
          onRemove,
          downloadFile,
          disabled
        )}
      <Button
        width="fit-content"
        onClick={() => setModalOpen(true)}
        variant="outline"
        leftIcon={<Image src={disabled ? addGray : addIconPrimary} />}
        disabled={disabled}
      >
        Add attachment
      </Button>
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        answer={files}
        saveToReport={saveToReport}
        deleteFromReport={onRemove}
      />
    </Stack>
  );
};
