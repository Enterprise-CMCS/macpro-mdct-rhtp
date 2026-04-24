import { useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { Box, Text } from "@chakra-ui/react";
import { Modal } from "./Modal";
import {
  InitiativeAnswerProp,
  InitiativeComment,
  UploadListProp,
  AttachmentStatus,
} from "@rhtp/shared";
import { useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";

const PreviousComments = ({ comments }: { comments: InitiativeComment[] }) => {
  const timeSortedComments = comments.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box marginTop={"spacer2"}>
      <Text fontWeight={"bold"}>Previous Comments</Text>
      {timeSortedComments.map((comment, index) => (
        <Box marginTop={"spacer2"} key={`previous-comment-${index}`}>
          <TextField
            id={`previous-comment-${index}`}
            name={`previous-comment-${index}`}
            label={
              <>
                {comment.name}
                <br />
                {comment.statusChange && (
                  <span>Status changed to: {comment.statusChange}</span>
                )}
              </>
            }
            hint={comment.date}
            value={comment.comment}
            disabled={true}
            multiline
          />
        </Box>
      ))}
    </Box>
  );
};

export const CommentModal = ({
  modalDisclosure,
  selectedFile,
  updateElement,
  allFiles,
  disabled,
}: Props) => {
  const { full_name, userIsAdmin, userIsEndUser } = useStore().user ?? {};
  const [pastComments, setPastComments] = useState<InitiativeComment[]>([]);
  const adminCommentsEnabled = useFlags()?.adminCommentsEnabled;
  const userCanAddComment =
    userIsEndUser || (userIsAdmin && adminCommentsEnabled);
  const commentsDisabled = disabled ? true : !userCanAddComment;
  const commentsOptional = userIsAdmin;
  const fileName = selectedFile?.name || "attachment";
  const selectedAttachmentIndex = allFiles.findIndex(
    (file) => file.attachment.fileId === selectedFile?.fileId
  );

  const initialValues = {
    comment: "",
    status: allFiles[selectedAttachmentIndex]?.status || "",
  };

  const [displayValue, setDisplayValue] = useState(initialValues);

  const statusOptions = Object.values(AttachmentStatus).map((status) => {
    return { label: status, value: status };
  });

  useEffect(() => {
    setDisplayValue(initialValues);

    if (selectedAttachmentIndex !== -1) {
      setPastComments(allFiles[selectedAttachmentIndex].comments);
    }
  }, [modalDisclosure.isOpen]);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    const { name, value } = event.target;
    setDisplayValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = () => {
    if (selectedAttachmentIndex === -1 || commentsDisabled) {
      return modalDisclosure.onClose();
    }

    const didStatusChange =
      displayValue.status !== allFiles[selectedAttachmentIndex].status;
    const commentsEmpty = displayValue.comment.trim() === "";

    // Comments are optional for admins
    if ((!didStatusChange || !commentsOptional) && commentsEmpty) {
      return modalDisclosure.onClose();
    }

    allFiles[selectedAttachmentIndex] = {
      ...allFiles[selectedAttachmentIndex],
      ...(didStatusChange && {
        status: displayValue.status as AttachmentStatus,
      }),
      comments: [
        ...allFiles[selectedAttachmentIndex].comments,
        {
          name: full_name || "CMS user",
          date: new Date().toString(),
          comment: displayValue.comment,
          ...(didStatusChange && { statusChange: displayValue.status }),
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
      disableConfirm={commentsDisabled}
    >
      {userIsAdmin && (
        <Dropdown
          label="Status"
          name="status"
          onChange={onChange}
          options={statusOptions}
          value={displayValue.status}
          disabled={commentsDisabled}
        />
      )}
      <TextField
        name={"comment"}
        label={
          <>
            Comment
            {commentsOptional && (
              <span className="optionalText"> (optional)</span>
            )}
          </>
        }
        onChange={onChange}
        value={displayValue.comment}
        disabled={commentsDisabled}
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
  selectedFile: UploadListProp | undefined;
  updateElement: Function;
  allFiles: InitiativeAnswerProp[];
  disabled?: boolean;
}
