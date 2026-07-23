import { useEffect, useState } from "react";
import {
  TextField,
  DropdownChangeObject,
  ChoiceList,
} from "@cmsgov/design-system";
import { Divider, Text, Spinner, Button, Flex } from "@chakra-ui/react";
import {
  InitiativeAnswerProp,
  UploadListProp,
  CommentType,
  Comment,
  isCompleteStatus,
} from "@rhtp/shared";
import { useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";
import {
  createComment,
  getComments,
} from "utils/api/requestMethods/commentMethods";
import { PreviousComments } from "./PreviousComments";
import { Drawer } from "./Drawer";

export const AttachmentCommentDrawer = ({
  modalDisclosure,
  selectedFile,
  updateElement,
  allFiles,
}: Props) => {
  const { userIsAdmin, userIsEndUser } = useStore().user ?? {};
  const { report } = useStore();
  const [pastComments, setPastComments] = useState<Comment[]>([]);
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const adminCommentsEnabled = useFlags()?.adminCommentsEnabled;
  const userCanAddComment =
    userIsEndUser || (userIsAdmin && adminCommentsEnabled);
  const commentsDisabled =
    isCompleteStatus(report?.status) || !userCanAddComment;
  const fileName = selectedFile?.name || "attachment";
  const selectedAttachmentIndex = allFiles.findIndex(
    (file) => file.attachment.fileId === selectedFile?.fileId
  );

  const initialValues = {
    comment: "",
    commentType: userIsAdmin ? "" : "external",
  };

  const noErrorState = {
    comment: "",
    overall: "",
    commentType: "",
  };

  const [displayValue, setDisplayValue] = useState(initialValues);
  const [errorMessages, setErrorMessages] = useState(noErrorState);

  const fetchComments = async () => {
    setCommentsLoading(true);
    setPastComments([]);
    try {
      const comments = await getComments(
        allFiles[selectedAttachmentIndex].attachment.fileId,
        report?.state || ""
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

  useEffect(() => {
    setErrorMessages(noErrorState);
    setDisplayValue(initialValues);

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
    if (value) {
      setErrorMessages({
        ...errorMessages,
        [name]: "",
      });
    }
  };

  const onSubmit = async () => {
    setCommentSubmitting(true);
    setErrorMessages(noErrorState);

    try {
      if (selectedAttachmentIndex === -1 || commentsDisabled) {
        setCommentSubmitting(false);
        return;
      }

      if (displayValue.commentType === "" && userIsAdmin) {
        setErrorMessages({
          ...errorMessages,
          commentType: "Please select a comment type.",
        });
        return;
      }

      const commentsEmpty = displayValue.comment.trim() === "";
      if (commentsEmpty) {
        setErrorMessages({
          ...errorMessages,
          comment: "A comment is required.",
        });
        return;
      }

      // Comments are optional for admins
      if (commentsEmpty) {
        setErrorMessages({
          ...errorMessages,
          overall: "Must modify Status or provide a Comment to submit.",
        });
        return;
      }

      await createComment(
        allFiles[selectedAttachmentIndex].attachment.fileId,
        report?.state || "",
        {
          comment: displayValue.comment,
          type: CommentType.ATTACHMENT,
          parentReportId: report?.id,
          isInternal: displayValue.commentType === "internal",
        }
      );

      allFiles[selectedAttachmentIndex] = {
        ...allFiles[selectedAttachmentIndex],
        canDelete: false, // if a comment is added, the file can no longer be deleted
      };
      updateElement({ answer: allFiles });
      fetchComments();
      setDisplayValue((prev) => ({
        ...prev,
        comment: "",
      }));
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrorMessages({
        ...errorMessages,
        overall:
          "There was an error submitting your comment. Please try again.",
      });
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={modalDisclosure.onClose}
      content={{
        heading: "Add comment to attachment",
        solidButtonText: "Close",
      }}
    >
      <Flex direction="column" gap="spacer4" marginBottom="spacer4">
        {!userIsAdmin && (
          <Text sx={sx.drawerSubheading}>
            Use the field below to leave comments for your CMS Project Officer.
          </Text>
        )}
        <Text fontSize="body_lg" fontWeight="body_lg">
          <b>Attachment:</b> {fileName}
        </Text>
        {errorMessages.overall && (
          <Text fontSize="body_md" color="red">
            {errorMessages.overall}
          </Text>
        )}
        {userIsAdmin && (
          <ChoiceList
            label="External or Internal Comment"
            hint="Choose whether this comment is hidden from the state or shared."
            name="commentType"
            type="radio"
            onChange={onChange}
            errorMessage={errorMessages.commentType}
            choices={[
              {
                label: "External (Shared with States)",
                value: "external",
              },
              { label: "Internal (CMS Only)", value: "internal" },
            ]}
          />
        )}
        <TextField
          name={"comment"}
          label={"Comment"}
          onChange={onChange}
          value={displayValue.comment}
          disabled={commentsDisabled}
          multiline
          rows={3}
          errorMessage={errorMessages.comment}
        />
      </Flex>
      <Button
        onClick={onSubmit}
        isDisabled={commentsDisabled}
        isLoading={commentSubmitting}
        variant="outline"
      >
        Add comment
      </Button>
      <Divider marginTop={"spacer3"} borderColor={"black"} />
      {commentsLoading ? (
        <Flex gap="spacer2" alignItems="center" marginTop="spacer4">
          <Spinner size="md" />
          <Text>Comments loading...</Text>
        </Flex>
      ) : null}
      {pastComments.length > 0 ? (
        <PreviousComments comments={pastComments} userIsAdmin={userIsAdmin!} />
      ) : null}
    </Drawer>
  );
};

const sx = {
  drawerHeaderText: {
    fontSize: "heading_2xl",
    fontWeight: "heading_2xl",
  },
  drawerCloseContainer: {
    position: "absolute",
    right: "spacer4",
    top: "spacer2",
  },
  drawerSubheading: {
    fontSize: "body_md",
    fontWeight: "normal",
  },
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
