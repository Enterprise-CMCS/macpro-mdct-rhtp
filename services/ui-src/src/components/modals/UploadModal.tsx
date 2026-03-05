import { Modal } from "components";
import { Upload } from "components/fields/Upload";
import { AttachmentAreaTemplate, UploadData } from "types";

export const UploadModal = ({
  modalDisclosure,
  year,
  state,
  answer,
  updatedElement,
}: Props) => {
  return (
    <Modal
      modalDisclosure={modalDisclosure}
      onConfirmHandler={() => modalDisclosure.onClose()}
      content={{
        heading: "Upload Attachments",
        subheading: undefined,
        actionButtonText: "Done",
        closeButtonText: undefined,
      }}
    >
      <Upload
        year={year}
        state={state}
        answer={answer}
        updatedElement={updatedElement}
      />
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  year: string;
  state: string;
  answer: UploadData[];
  updatedElement: (updatedElement: Partial<AttachmentAreaTemplate>) => void;
}
