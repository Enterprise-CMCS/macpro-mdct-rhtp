import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import { Button, Stack, Image } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { useParams } from "react-router-dom";
import { useStore } from "utils";
import {
  downloadFile,
  retrieveUploadedFiles,
  uploadListRender,
} from "utils/other/upload";
import { Hint, Label } from "@cmsgov/design-system";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { id, label, helperText, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  const updateElement = props.updateElement;
  const files = answer ?? [];

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  const onModalClose = () => {
    setModalOpen(false);
  };

  const saveToReport = () => {
    retrieveUploadedFiles(year, state, id).then((response) => {
      updateElement({ answer: response });
    });
  };

  return (
    <Stack gap="0">
      <Label fieldId={id}>{label}</Label>
      {helperText && <Hint id={id}>{helperText}</Hint>}
      {uploadListRender(files, year, state, saveToReport, downloadFile)}
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
        year={year}
        answer={files}
        saveToReport={saveToReport}
        id={id}
      />
    </Stack>
  );
};
