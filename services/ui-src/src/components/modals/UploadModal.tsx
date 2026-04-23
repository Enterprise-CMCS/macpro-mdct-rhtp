import { Stack } from "@chakra-ui/react";
import { Modal } from "components";
import { Upload } from "components/fields/Upload";
import { JSX } from "react";
import { UploadListProp } from "@rhtp/shared";

export const UploadModal = ({
  modalDisclosure,
  hint,
  selections,
  answer,
  saveToReport,
  deleteFromReport,
  modalHeading = "Upload attachments",
  onModalSubmit = modalDisclosure.onClose,
  actionButtonText = "Done",
  uploadAreaHidden = false,
}: Props) => {
  return (
    <Modal
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
        <Upload
          answer={answer}
          saveToReport={saveToReport}
          deleteFromReport={deleteFromReport}
          uploadAreaHidden={uploadAreaHidden}
        />
      </Stack>
    </Modal>
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
}
