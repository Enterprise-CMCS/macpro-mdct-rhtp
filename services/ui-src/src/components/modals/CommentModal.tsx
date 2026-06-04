import { useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
} from "@cmsgov/design-system";
import { Box, Divider, Heading, Text, Spinner } from "@chakra-ui/react";
import { Modal } from "./Modal";
import {
  InitiativeAnswerProp,
  UploadListProp,
  AttachmentStatus,
  ReportStatus,
  UserRoles,
  FileStatusOptions,
  CommentType,
  Comment,
} from "@rhtp/shared";
import { useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";
import {
  createComment,
  getComments,
} from "utils/api/requestMethods/commentMethods";

const PreviousComments = ({ comments }: { comments: Comment[] }) => {
  return (
    <Box marginTop={"spacer2"}>
      <Heading as={"h3"} fontWeight={"bold"}>
        Comments
      </Heading>
      {comments.map((comment, index) => (
        <Box marginTop={"spacer2"} key={`previous-comment-${index}`}>
          <Text fontWeight={"heading_md"}>{comment.author}</Text>
          {comment.statusChange && (
            <Text fontWeight={"heading_md"}>
              Status changed to: {comment.statusChange}
            </Text>
          )}
          <Text fontSize={"body_sm"} color={"gray_dark"}>
            {new Date(comment.created).toLocaleString()}
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
  const { userIsAdmin, userIsEndUser, userRole } = useStore().user ?? {};
  const isStateUser = userRole === UserRoles.STATE_USER;
  const { report } = useStore();
  const [pastComments, setPastComments] = useState<Comment[]>([]);
  const [statusOptions, setStatusOptions] =
    useState<DropdownOption[]>(FileStatusOptions);
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
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
  const fileStatus = allFiles[selectedAttachmentIndex]?.status || "";
  const statusDisabled =
    commentsDisabled ||
    (isStateUser && fileStatus === AttachmentStatus.LOCKED_FOR_SCORING);

  const initialValues = {
    comment: "",
    status: fileStatus,
  };

  const noErrorState = {
    comment: "",
    status: "",
    overall: "",
  };

  const [displayValue, setDisplayValue] = useState(initialValues);
  const [errorMessages, setErrorMessages] = useState(noErrorState);

  useEffect(() => {
    setErrorMessages(noErrorState);
    setDisplayValue(initialValues);

    let statusOptions = structuredClone(FileStatusOptions);
    // state users cannot change status to Locked For Scoring or Needs Revision, but those options should still show up if it's the existing status
    if (isStateUser) {
      statusOptions = statusOptions.filter(
        (status) =>
          (status.value !== AttachmentStatus.LOCKED_FOR_SCORING &&
            status.value !== AttachmentStatus.NEEDS_REVISION) ||
          status.value === fileStatus
      );
    }
    setStatusOptions(statusOptions);

    const fetchComments = async () => {
      setCommentsLoading(true);
      setPastComments([]);
      try {
        const comments = await getComments(
          allFiles[selectedAttachmentIndex].attachment.fileId
        );
        setPastComments(comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setErrorMessages({
          ...errorMessages,
          overall:
            "There was an error fetching comments for this attachment. Please try again.",
        });
      } finally {
        setCommentsLoading(false);
      }
    };

    if (selectedAttachmentIndex !== -1) {
      fetchComments();
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

  const onSubmit = async () => {
    setCommentSubmitting(true);

    if (selectedAttachmentIndex === -1 || commentsDisabled) {
      setCommentSubmitting(false);
      return modalDisclosure.onClose();
    }

    const didStatusChange =
      displayValue.status !== allFiles[selectedAttachmentIndex].status;
    const commentsEmpty = displayValue.comment.trim() === "";
    if (commentsEmpty && !commentsOptional) {
      setErrorMessages({
        ...errorMessages,
        comment: "A comment is required.",
      });
      setCommentSubmitting(false);
      return;
    }

    // Comments are optional for admins
    if ((!didStatusChange || !commentsOptional) && commentsEmpty) {
      setCommentSubmitting(false);
      return modalDisclosure.onClose();
    }

    try {
      await createComment(allFiles[selectedAttachmentIndex].attachment.fileId, {
        comment: displayValue.comment,
        type: CommentType.ATTACHMENT,
        parentReportId: report?.id,
        ...(didStatusChange && { statusChange: displayValue.status }),
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrorMessages({
        ...errorMessages,
        overall:
          "There was an error submitting your comment. Please try again.",
      });
      setCommentSubmitting(false);
      return;
    }

    if (didStatusChange) {
      allFiles[selectedAttachmentIndex] = {
        ...allFiles[selectedAttachmentIndex],
        ...(didStatusChange && {
          status: displayValue.status as AttachmentStatus,
        }),
      };
      updateElement({ answer: allFiles });
    }

    setCommentSubmitting(false);
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
      submitting={commentSubmitting}
    >
      {errorMessages.overall && (
        <Text fontSize="body_md" color="red" marginBottom={"spacer2"}>
          {errorMessages.overall}
        </Text>
      )}
      <Dropdown
        label="Status"
        name="status"
        onChange={onChange}
        options={statusOptions}
        value={displayValue.status}
        disabled={statusDisabled}
        errorMessage={errorMessages.status}
      />
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
        errorMessage={errorMessages.comment}
      />
      <Divider marginTop={"spacer3"} borderColor={"black"} />
      {commentsLoading ? <Spinner size="md" /> : null}
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
