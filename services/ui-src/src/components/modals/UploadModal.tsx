import { Modal } from "components";
import { Upload } from "components/fields/Upload";

export const UploadModal = ({ modalDisclosure }: Props) => {
  return (
    <Modal
      data-testid="upload-modal"
      modalDisclosure={modalDisclosure}
      onConfirmHandler={() => modalDisclosure.onClose()}
      content={{
        heading: "Upload Attachments",
        subheading: undefined,
        actionButtonText: "Done",
        closeButtonText: undefined,
      }}
    >
      <Upload />
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
}
