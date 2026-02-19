import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import { Box, Button } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>,
) => {
  const { label } = props.element;

  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const onModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Box>
      {label}
      <Button onClick={() => setModalOpen(!isModalOpen)}>Add attachment</Button>
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
      ></UploadModal>
    </Box>
  );
};
