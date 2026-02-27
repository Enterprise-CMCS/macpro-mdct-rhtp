import { Modal } from "components";
import { Upload } from "components/fields/Upload";

export const UploadModal = ({ modalDisclosure, id, year, state }: Props) => {
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
      <Upload year={year} state={state} id={id} />
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  id: string;
  year: string;
  state: string;
}
