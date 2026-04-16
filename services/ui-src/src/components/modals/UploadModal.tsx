import { Stack } from "@chakra-ui/react";
import { Modal } from "components";
import { Upload } from "components/fields/Upload";
import { JSX } from "react";
import { ReportType, UploadListProp } from "types";

export const UploadModal = ({
  modalDisclosure,
  id,
  reportType,
  hint,
  state,
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
          id={id}
          state={state}
          answer={answer}
          saveToReport={saveToReport}
          deleteFromReport={deleteFromReport}
          uploadAreaHidden={uploadAreaHidden}
          reportType={reportType}
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
  reportType: ReportType;
  hint?: string;
  state: string;
  answer: UploadListProp[];
  selections?: JSX.Element;
  modalHeading?: string;
  onModalSubmit?: () => void;
  actionButtonText?: string;
  saveToReport: (uploads: UploadListProp[]) => void;
  deleteFromReport: (file: UploadListProp) => void;
  uploadAreaHidden?: boolean;
}
