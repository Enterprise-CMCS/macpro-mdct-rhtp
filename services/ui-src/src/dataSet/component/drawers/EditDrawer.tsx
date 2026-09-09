import { Drawer } from "components";
import { Stack, Text } from "@chakra-ui/react";
import { JSX } from "react";

export const EditDrawer = ({
  modalDisclosure,
  onModalSubmit,
  file,
  selections,
  submitting,
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
      submitting={submitting}
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
  file: { filename: string; uploadedUsername: string; uploadedDate: string };
  selections?: JSX.Element;
  disabled?: boolean;
  submitting?: boolean;
}
