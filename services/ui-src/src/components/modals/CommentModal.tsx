import { useEffect, useState } from "react";
import { TextField } from "@cmsgov/design-system";
import { Box, Text } from "@chakra-ui/react";
import { Modal } from "./Modal";
import { InitiativeAnswerProp, InitiativeComment, UploadListProp } from "types";
import { useStore } from "utils";

const PreviousComments = ({ comments }: { comments: InitiativeComment[] }) => {
  const timeSortedComments = comments.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box marginTop={"spacer2"}>
      <Text fontWeight={"bold"}>Previous Comments</Text>
      {timeSortedComments.map((comment, index) => (
        <TextField
          key={`previous-comment-${index}`}
          id={`previous-comment-${index}`}
          name={`previous-comment-${index}`}
          label={comment.name}
          hint={comment.date}
          value={comment.comment}
          disabled={true}
          multiline
        />
      ))}
    </Box>
  );
};

export const CommentModal = ({
  modalDisclosure,
  selectedFile,
  updateElement,
  allFiles,
}: Props) => {
  const { full_name } = useStore().user ?? {};
  const [displayValue, setDisplayValue] = useState("");
  const [pastComments, setPastComments] = useState<InitiativeComment[]>([]);
  const fileName = selectedFile?.name || "attachment";
  const selectedAttachmentIndex = allFiles.findIndex(
    (file) => file.attachment.fileId === selectedFile?.fileId
  );

  // clear comment text when modal closes
  useEffect(() => {
    if (!modalDisclosure.isOpen) {
      setDisplayValue("");
    }
    if (selectedAttachmentIndex !== -1) {
      setPastComments(allFiles[selectedAttachmentIndex].comments);
    }
  }, [modalDisclosure.isOpen]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    setDisplayValue(rawValue);
  };

  const onSubmit = () => {
    if (selectedAttachmentIndex === -1 || displayValue.trim() === "")
      return modalDisclosure.onClose();

    allFiles[selectedAttachmentIndex] = {
      ...allFiles[selectedAttachmentIndex],
      comments: [
        ...allFiles[selectedAttachmentIndex].comments,
        {
          name: full_name || "CMS user",
          date: new Date().toString(),
          comment: displayValue,
        },
      ],
    };

    updateElement({ answer: allFiles });
    modalDisclosure.onClose();
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onSubmit}
      content={{
        heading: `Add Comment to ${fileName}`,
        actionButtonText: "Save",
      }}
    >
      <TextField
        name={"attachment-comment"}
        label={"Comment"}
        onChange={onChange}
        value={displayValue}
        disabled={false}
        multiline
        rows={3}
      />
      {pastComments.length > 0 ? (
        <PreviousComments comments={pastComments} />
      ) : null}
    </Modal>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  selectedFile: UploadListProp;
  updateElement: Function;
  allFiles: InitiativeAnswerProp[];
}
