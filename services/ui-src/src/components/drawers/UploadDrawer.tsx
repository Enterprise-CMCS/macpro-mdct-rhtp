import { Stack } from "@chakra-ui/react";
import { UploadArea } from "components/fields/UploadArea";
import { JSX } from "react";
import { AlertTypes, UploadListProp } from "@rhtp/shared";
import { Drawer } from "components";

export const UploadDrawer = ({
  modalDisclosure,
  hint,
  selections,
  answer,
  saveToReport,
  deleteFromReport,
  modalHeading = "Upload Attachments",
  onModalSubmit = modalDisclosure.onClose,
  actionButtonText = "Done",
  uploadAreaHidden = false,
  multiple = true,
  disabled,
  notification,
}: Props) => {
  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onModalSubmit}
      content={{
        heading: modalHeading,
        subheading: hint,
        solidButtonText: actionButtonText,
      }}
    >
      <Stack gap="1.5rem">
        {selections ?? ""}
        <UploadArea
          answer={answer}
          saveToReport={saveToReport}
          deleteFromReport={deleteFromReport}
          uploadAreaHidden={uploadAreaHidden}
          multiple={multiple}
          disabled={disabled}
          notification={notification}
        />
      </Stack>
    </Drawer>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  hint?: string;
  answer: UploadListProp[];
  selections?: JSX.Element;
  modalHeading?: string;
  onModalSubmit?: () => void;
  actionButtonText?: string;
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport: (file: UploadListProp) => void;
  uploadAreaHidden?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  notification?: {
    instruction?: { type: AlertTypes; text: string };
    success?: string;
  };
}
