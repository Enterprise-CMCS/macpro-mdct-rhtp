import { Drawer } from "components";
import { Stack, Text } from "@chakra-ui/react";
import { DataSetType } from "../forms/Dashboard";
import { JSX } from "react";

export const EditDrawer = ({
  modalDisclosure,
  onModalSubmit,
  file,
  selections,
}: Props) => {
  if (!file) return;

  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={() => {
        if (onModalSubmit) onModalSubmit();
      }}
      content={{
        heading: "Edit file",
        subheading: undefined,
        solidButtonText: "Edit",
      }}
    >
      <Stack gap="1rem">
        <Text>File: {file.filename}</Text>
        <Text>Uploaded by: {file.uploadedUsername}</Text>
        <Text>Upload date: {file.uploadedDate}</Text>
        {selections ?? ""}
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
  selections?: JSX.Element;
}
