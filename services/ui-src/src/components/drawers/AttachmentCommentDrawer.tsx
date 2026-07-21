import { useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
  ChoiceList,
} from "@cmsgov/design-system";
import {
  Divider,
  Heading,
  Text,
  Spinner,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Image,
  Flex,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import {
  InitiativeAnswerProp,
  UploadListProp,
  AttachmentStatus,
  UserRoles,
  FileStatusOptions,
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
import closeIcon from "assets/icons/close/icon_close_primary.svg";
import { PreviousComments } from "./PreviousComments";

export const AttachmentCommentDrawer = ({
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
    isCompleteStatus(report?.status) || !userCanAddComment;
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
    commentType: userIsAdmin ? "" : "external",
  };

  const noErrorState = {
    comment: "",
    status: "",
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

      const didStatusChange =
        displayValue.status !== allFiles[selectedAttachmentIndex].status;
      const commentsEmpty = displayValue.comment.trim() === "";
      if (commentsEmpty && !commentsOptional) {
        setErrorMessages({
          ...errorMessages,
          comment: "A comment is required.",
        });
        return;
      }

      // Comments are optional for admins
      if ((!didStatusChange || !commentsOptional) && commentsEmpty) {
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
          ...(didStatusChange && { statusChange: displayValue.status }),
        }
      );

      allFiles[selectedAttachmentIndex] = {
        ...allFiles[selectedAttachmentIndex],
        ...(didStatusChange && {
          status: displayValue.status as AttachmentStatus,
        }),
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

  const userSpecificSubheading = userIsAdmin
    ? "Use the fields below to manage the attachment status and leave comments for the state."
    : "Use the fields below to manage the attachment status and leave comments for your CMS Project Officer.";

  return (
    <Drawer
      isOpen={modalDisclosure.isOpen}
      onClose={modalDisclosure.onClose}
      placement="right"
    >
      <DrawerOverlay />
      <DrawerContent maxWidth={"576px"}>
        <Flex sx={sx.drawerCloseContainer}>
          <Button
            leftIcon={<Image src={closeIcon} alt="Close" />}
            variant="link"
            onClick={modalDisclosure.onClose}
            fontWeight="bold"
          >
            Close
          </Button>
        </Flex>
        <DrawerHeader>
          <Flex direction="column" gap="spacer3">
            <Heading as="h1" sx={sx.drawerHeaderText}>
              Add comment to attachment
            </Heading>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <Flex direction="column" gap="spacer4" marginBottom="spacer4">
            <Text sx={sx.drawerSubheading}>
              {userSpecificSubheading} Certain statuses restrict the ability to
              modify or remove files:
            </Text>
            <UnorderedList sx={sx.drawerSubheading}>
              <ListItem>
                <b>Needs Revision, Informational, Archived:</b> The attachment
                will no longer be able to be deleted.
              </ListItem>
              <ListItem>
                <b>Locked for Scoring:</b> The attachment is locked and cannot
                be edited or deleted.
              </ListItem>
            </UnorderedList>
            <Text fontSize="body_lg" fontWeight="body_lg">
              <b>Attachment:</b> {fileName}
            </Text>
            {errorMessages.overall && (
              <Text fontSize="body_md" color="red">
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
            <PreviousComments
              comments={pastComments}
              userIsAdmin={userIsAdmin!}
            />
          ) : null}
        </DrawerBody>
        <DrawerFooter>
          <Button onClick={modalDisclosure.onClose}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
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
