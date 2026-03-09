import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import { Text, Button, Stack, Heading, Image, Spinner } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { useParams } from "react-router-dom";
import { useStore } from "utils";
import { downloadFile, uploadListRender } from "utils/other/upload";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { label, helperText, answer } = props.element;
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
    //get upload list again when modal is closed
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h5">{label}</Heading>
      {helperText && <Text>{helperText}</Text>}
      {uploadListRender(answer ?? [], year, state, updateElement, downloadFile)}
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
        updateElement={updateElement}
      />
    </Stack>
  );
};
