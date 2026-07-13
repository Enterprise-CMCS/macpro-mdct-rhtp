import { Stack } from "@chakra-ui/react";
import { UploadArea } from "components/fields/UploadArea";
import { JSX } from "react";
import { UploadListProp } from "@rhtp/shared";
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
  subLabel,
  multiple = true,
}: Props) => {
  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onModalSubmit}
      content={{
        heading: modalHeading,
        subheading: hint,
        actionButtonText: actionButtonText,
        closeButtonText: undefined,
      }}
    >
      <Stack gap="1.5rem">
        {selections ?? ""}
        <UploadArea
          answer={answer}
          saveToReport={saveToReport}
          deleteFromReport={deleteFromReport}
          uploadAreaHidden={uploadAreaHidden}
          subLabel={subLabel}
          multiple={multiple}
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
  subLabel: { upload?: string; uploaded?: string };
  multiple?: boolean;
}
