import { Fragment, useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
} from "@cmsgov/design-system";
import {
  Box,
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
import { Modal } from "./Modal";
import {
  InitiativeAnswerProp,
  UploadListProp,
  AttachmentStatus,
  ReportStatus,
  UserRoles,
  FileStatusOptions,
  Report,
  ReportType,
  CommentType,
  Comment,
  isCompleteStatus,
} from "@rhtp/shared";
import { acceptReport, releaseReport, useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";
import {
  createComment,
  getComments,
} from "utils/api/requestMethods/commentMethods";
import closeIcon from "assets/icons/close/icon_close_primary.svg";

const AdminReportStatusOptions = [
  ReportStatus.SUBMITTED,
  ReportStatus.ACCEPTED,
  "Unlock",
];

export const ReportCommentDrawer = ({
  modalDisclosure,
  selectedReport,
  reloadReports,
}: ReportCommentProps) => {
  const { name, status } = selectedReport;
  const { userIsAdmin } = useStore().user ?? {};
  // Can only modify dropdown if report is submitted and is admin user
  const disabled = status !== ReportStatus.SUBMITTED || !userIsAdmin;
  const initialValues: {
    comment: string;
    status: string;
  } = {
    comment: "",
    status: status,
  };
  const [displayValue, setDisplayValue] = useState(initialValues);
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const statuses = new Set([...AdminReportStatusOptions, status]);
    const statusOptions = [];
    for (const status of statuses.values()) {
      statusOptions.push({
        label: status,
        value: status,
      });
    }
    setStatusOptions(statusOptions);
  }, []);

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
    setSubmitting(true);

    if (displayValue.status === "Unlock") {
      await releaseReport(selectedReport);
      reloadReports(ReportType.RHTP);
    } else if (
      displayValue.status === ReportStatus.ACCEPTED &&
      displayValue.status !== status
    ) {
      await acceptReport(selectedReport);
      reloadReports(ReportType.RHTP);
    }

    modalDisclosure.onClose();
    setSubmitting(false);
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      content={{
        heading: `Add comment to ${name || "report"}`,
        actionButtonText: "Save",
      }}
      onConfirmHandler={onSubmit}
      submitting={submitting}
    >
      <Dropdown
        label="Status"
        name="status"
        onChange={onChange}
        options={statusOptions}
        value={displayValue.status}
        disabled={disabled}
      />
    </Modal>
  );
};

interface ReportCommentProps {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  selectedReport: Report;
  reloadReports: Function;
}

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
      await createComment(
        allFiles[selectedAttachmentIndex].attachment.fileId,
        report?.state || "",
        {
          comment: displayValue.comment,
          type: CommentType.ATTACHMENT,
          parentReportId: report?.id,
          ...(didStatusChange && { statusChange: displayValue.status }),
        }
      );
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

    allFiles[selectedAttachmentIndex] = {
      ...allFiles[selectedAttachmentIndex],
      ...(didStatusChange && {
        status: displayValue.status as AttachmentStatus,
      }),
      canDelete: false, // if a comment is added, the file can no longer be deleted
    };
    updateElement({ answer: allFiles });

    setCommentSubmitting(false);
    modalDisclosure.onClose();
  };

  const modalHeading =
    pastComments.length === 0
      ? `Add Comment to ${fileName}`
      : `Comments for ${fileName}`;
  const modalSubHeading = userIsAdmin ? (
    <Fragment>
      <Text sx={sx.drawerSubheadingText}>
        Use the fields below to manage the attachment status and leave comments
        for the state. Certain statuses restrict the ability to modify or remove
        files:
      </Text>
      <UnorderedList sx={sx.drawerSubheadingList}>
        <ListItem>
          <b>Needs Revision, Informational, Archived:</b> Needs Revision,
          Informational, Archived: The attachment will no longer be able to be
          deleted.
        </ListItem>
        <ListItem>
          <b>Locked for Scoring:</b> The attachment is locked and cannot be
          edited or deleted.
        </ListItem>
      </UnorderedList>
    </Fragment>
  ) : (
    <Text sx={sx.drawerSubheadingText}>
      Leave a comment for your CMS Project Officer below
    </Text>
  );

  return (
    <Drawer
      isOpen={modalDisclosure.isOpen}
      onClose={modalDisclosure.onClose}
      placement="right"
    >
      <DrawerOverlay />
      <DrawerContent maxWidth={"50vw"}>
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
          <Heading as="h1" sx={sx.drawerHeaderText}>
            {modalHeading}
          </Heading>
          {modalSubHeading}
        </DrawerHeader>
        <DrawerBody>
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
        </DrawerBody>
        <DrawerFooter gap="spacer2">
          <Button variant="outline" onClick={modalDisclosure.onClose}>
            Close
          </Button>
          <Button
            onClick={onSubmit}
            isDisabled={commentsDisabled}
            isLoading={commentSubmitting}
          >
            Save
          </Button>
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
  drawerSubheadingText: {
    fontSize: "body_md",
    fontWeight: "normal",
    marginTop: "spacer1",
    marginBottom: "spacer2",
  },
  drawerSubheadingList: {
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
