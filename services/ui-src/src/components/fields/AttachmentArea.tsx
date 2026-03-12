import { AttachmentAreaTemplate, UploadListProp } from "types";
import { PageElementProps } from "components/report/Elements";
import { Text, Button, Stack, Heading, Image } from "@chakra-ui/react";
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

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { id, label, helperText, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  const updateElement = props.updateElement;

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  const onModalClose = () => {
    setModalOpen(false);
  };

  const onRemove = () => {
    retrieveUploadedFiles(year, state, id).then((response) => {
      saveToReport(response);
    });
  };

  const saveToReport = (uploads: UploadListProp[]) => {
    updateElement({ answer: uploads });
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h5">{label}</Heading>
      {helperText && <Text>{helperText}</Text>}
      {answer &&
        answer.length > 0 &&
        uploadListRender(answer, year, state, onRemove, downloadFile)}
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
        answer={answer ?? []}
        saveToReport={saveToReport}
        id={id}
      />
    </Stack>
  );
};
