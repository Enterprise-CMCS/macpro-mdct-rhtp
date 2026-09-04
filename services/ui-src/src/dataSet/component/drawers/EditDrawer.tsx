import { Drawer } from "components";
import { Stack, Text } from "@chakra-ui/react";
import { DataSetType } from "../forms/Dashboard";

export const EditDrawer = ({ modalDisclosure, onModalSubmit, file }: Props) => {
  if (!file) return;

  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onModalSubmit}
      content={{
        heading: "Edit file",
        subheading: undefined,
        solidButtonText: undefined,
        outlineButtonText: undefined,
      }}
    >
      <Stack gap="1rem">
        <Text>File: {file.filename}</Text>
        <Text>Uploaded by: {file.uploadedUsername}</Text>
        <Text>Upload date: {file.uploadedDate}</Text>
      </Stack>
    </Drawer>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onModalSubmit?: () => void;
  file: DataSetType;
}
