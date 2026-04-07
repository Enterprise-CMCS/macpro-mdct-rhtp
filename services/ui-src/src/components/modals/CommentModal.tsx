import { TextField } from "@cmsgov/design-system";
import { Modal } from "./Modal";

export const CommentModal = ({ modalDisclosure }: Props) => (
  <Modal
    modalDisclosure={modalDisclosure}
    onConfirmHandler={() => modalDisclosure.onClose()}
    content={{
      heading: "Add Comment to {attachment}",
      actionButtonText: "Save",
    }}
  >
    <TextField
      name={"attachment-comment"}
      label={"Comment"}
      onChange={() => {}}
      onBlur={() => {}}
      value={""}
      errorMessage={""}
      disabled={false}
      multiline
      rows={3}
    />
  </Modal>
);

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
}
