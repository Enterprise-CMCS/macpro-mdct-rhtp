import { Stack } from "@chakra-ui/react";
import { Modal } from "components";
import { Upload } from "components/fields/Upload";
import { JSX } from "react";
import { UploadListProp } from "types";

export const UploadModal = ({
  modalDisclosure,
  id,
  hint,
  year,
  state,
  selections,
  answer,
  saveToReport,
  modalHeading = "Upload attachments",
  onModalSubmit = modalDisclosure.onClose,
  actionButtonText = "Done",
  deleteFromReport,
}: Props) => {
  const saveToModal = (uploads: UploadListProp[]) => {
    saveToReport(uploads);
  };

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
          id={id}
          year={year}
          state={state}
          answer={answer}
          saveToReport={saveToModal}
          deleteFromReport={deleteFromReport}
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
  id: string;
  hint?: string;
  year: string;
  state: string;
  answer: UploadListProp[];
  selections?: JSX.Element;
  dropdowns?: { label: string; options: { label: string; value: string }[] }[];
  modalHeading?: string;
  onModalSubmit?: () => void;
  actionButtonText?: string;
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport?: (file: UploadListProp) => void;
}
