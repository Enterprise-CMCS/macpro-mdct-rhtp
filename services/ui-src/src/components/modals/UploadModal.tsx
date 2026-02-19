import { Modal } from "components";
import { Upload } from "components/fields/Upload";
import { useStore } from "utils";

export const UploadModal = ({ modalDisclosure }: Props) => {
  const { report } = useStore();
  const year = report?.year.toString() ?? "";

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
      <Upload year={year} />
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
}
