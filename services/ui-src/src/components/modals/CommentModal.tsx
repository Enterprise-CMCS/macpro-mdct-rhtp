import { useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { Box, Divider, Heading, Text } from "@chakra-ui/react";
import { Modal } from "./Modal";
import {
  InitiativeAnswerProp,
  InitiativeComment,
  UploadListProp,
  AttachmentStatus,
  ReportStatus,
} from "@rhtp/shared";
import { useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";

const PreviousComments = ({ comments }: { comments: InitiativeComment[] }) => {
  const timeSortedComments = comments.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box marginTop={"spacer2"}>
      <Heading as={"h3"} fontWeight={"bold"}>
        Comments
      </Heading>
      {timeSortedComments.map((comment, index) => (
        <Box marginTop={"spacer2"} key={`previous-comment-${index}`}>
          <Text fontWeight={"heading_md"}>{comment.name}</Text>
          {comment.statusChange && (
            <Text fontWeight={"heading_md"}>
              Status changed to: {comment.statusChange}
            </Text>
          )}
          <Text fontSize={"body_sm"} color={"gray_dark"}>
            {comment.date}
          </Text>
          {comment.comment !== "" && (
            <TextField
              id={`previous-comment-${index}`}
              name={`previous-comment-${index}`}
              label={""}
              value={comment.comment}
              disabled={true}
              multiline
            />
          )}
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
}: Props) => {
  const { full_name, userIsAdmin, userIsEndUser } = useStore().user ?? {};
  const { report } = useStore();
  const [pastComments, setPastComments] = useState<InitiativeComment[]>([]);
  const adminCommentsEnabled = useFlags()?.adminCommentsEnabled;
  const userCanAddComment =
    userIsEndUser || (userIsAdmin && adminCommentsEnabled);
  const commentsDisabled =
    report?.status === ReportStatus.SUBMITTED || !userCanAddComment;
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

  const modalHeading =
    pastComments.length === 0
      ? `Add Comment to ${fileName}`
      : `Comments for ${fileName}`;
  const modalSubHeading = userIsAdmin
    ? "Use the fields below to manage the attachment status and leave comments for the state."
    : "Leave a comment for your CMS Project Officer below";

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onSubmit}
      content={{
        heading: modalHeading,
        subheading: modalSubHeading,
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
      <Divider marginTop={"spacer3"} borderColor={"black"} />
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
}
