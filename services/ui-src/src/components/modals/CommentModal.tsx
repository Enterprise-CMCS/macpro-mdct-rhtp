import { useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
} from "@cmsgov/design-system";
import { Box, Divider, Heading, Text } from "@chakra-ui/react";
import { Modal } from "./Modal";
import {
  InitiativeAnswerProp,
  InitiativeComment,
  UploadListProp,
  AttachmentStatus,
  ReportStatus,
  UserRoles,
  FileStatusOptions,
  CommentType,
} from "@rhtp/shared";
import { useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";
import {
  createComment,
  getComments,
} from "utils/api/requestMethods/commentMethods";

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
  const { full_name, userIsAdmin, userIsEndUser, userRole } =
    useStore().user ?? {};
  const isStateUser = userRole === UserRoles.STATE_USER;
  const { report } = useStore();
  const [pastComments, setPastComments] = useState<InitiativeComment[]>([]);
  const [statusOptions, setStatusOptions] =
    useState<DropdownOption[]>(FileStatusOptions);
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

  const onSubmit = async () => {
    console.log("slectedFile", allFiles[selectedAttachmentIndex]);
    console.log("REPORT", report);
    const pastComments = await getComments(
      allFiles[selectedAttachmentIndex].attachment.fileId
    );
    console.log("pastComments", pastComments);
    // await createComment(allFiles[selectedAttachmentIndex].attachment.fileId, {
    //   comment: "Random Comment",
    //   type: CommentType.ATTACHMENT,
    //   parentReportId: report?.id,
    // });
    if (selectedAttachmentIndex === -1 || commentsDisabled) {
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
      return;
    }

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
