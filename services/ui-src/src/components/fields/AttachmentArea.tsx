import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import {
  Text,
  Button,
  Stack,
  Heading,
  Image,
  List,
  ListItem,
  VStack,
} from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>,
) => {
  const { label, helperText, id } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  const onModalClose = () => {
    setModalOpen(false);
    //reload uploads when
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h5">{label}</Heading>
      {helperText && <Text>{helperText}</Text>}
      <List variant="upload">
        <ListItem>
          <VStack>
            <Button variant="link">File</Button>
            <span>0 KB</span>
          </VStack>
          <Button>x</Button>
        </ListItem>
      </List>
      <Button
        onClick={() => setModalOpen(!isModalOpen)}
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
        id={id}
      ></UploadModal>
    </Stack>
  );
};
