import { AttachmentAreaTemplate, UploadListProp } from "@rhtp/shared";
import { PageElementProps } from "components/report/Elements";
import { Button, Stack, Image } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { useParams } from "react-router";
import { useStore } from "utils";
import { downloadFile, uploadListRender, removeFile } from "utils/other/upload";
import { Hint, Label } from "@cmsgov/design-system";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { label, helperText, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const { state } = useParams();
  const { report } = useStore();
  const { id, type } = report!;

  const updateElement = props.updateElement;
  const files = answer ?? [];

  if (!state || !id || !type) {
    console.error("Can't retrieve uploads with missing state, id or type");
    return;
  }

  const onModalClose = () => {
    setModalOpen(false);
  };

  const onRemove = (exfile: UploadListProp) => {
    const newFiles = files.filter((file) => file.fileId != exfile.fileId);
    updateElement({ answer: newFiles });
    removeFile(exfile, type, id, state);
  };

  const saveToReport = (newFiles: UploadListProp[]) => {
    updateElement({ answer: [...files, ...newFiles] });
  };

  return (
    <Stack gap="0">
      <Label fieldId={id}>{label}</Label>
      {helperText && <Hint id={id}>{helperText}</Hint>}
      {uploadListRender(id, type, files, state, onRemove, downloadFile)}
      <Button
        width="fit-content"
        onClick={() => setModalOpen(true)}
        variant="outline"
        leftIcon={<Image src={addIconPrimary} />}
      >
        Add attachment
      </Button>
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        state={state}
        answer={files}
        saveToReport={saveToReport}
        deleteFromReport={onRemove}
        id={id}
        reportType={type}
      />
    </Stack>
  );
};
