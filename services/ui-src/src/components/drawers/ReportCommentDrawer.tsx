import { Fragment, useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import {
  ReportStatus,
  Report,
  CommentType,
  Comment,
  LiteReport,
} from "@rhtp/shared";
import { acceptReport, releaseReport, useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";
import {
  createComment,
  getComments,
} from "utils/api/requestMethods/commentMethods";
import closeIcon from "assets/icons/close/icon_close_primary.svg";
import { PreviousComments } from "./PreviousComments";

const AdminReportStatusOptions = [
  ReportStatus.SUBMITTED,
  ReportStatus.ACCEPTED,
  "Unlock",
];

export const ReportCommentDrawer = ({
  modalDisclosure,
  selectedReport,
}: Props) => {
  const { name, status, state, id } = selectedReport;
  const { userIsAdmin, userIsEndUser } = useStore().user ?? {};

  const initialValues: {
    comment: string;
    status: string;
    commentType: "external" | "internal" | "";
  } = {
    comment: "",
    status: status,
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
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pastComments, setPastComments] = useState<Comment[]>([]);

  const adminCommentsEnabled = useFlags()?.adminCommentsEnabled;
  const userCanAddComment =
    userIsEndUser || (userIsAdmin && adminCommentsEnabled);
  const commentsDisabled = !userCanAddComment;

  const commentsOptional = userIsAdmin;
  const statusDisabled = status !== ReportStatus.SUBMITTED || !userIsAdmin;

  const fetchComments = async () => {
    setCommentsLoading(true);
    setPastComments([]);
    try {
      const comments = await getComments(id, state);
      setPastComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setErrorMessages({
        ...errorMessages,
        overall:
          "There was an error fetching comments for this report. Please try again.",
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
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
    if (value) {
      setErrorMessages({
        ...errorMessages,
        [name]: "",
      });
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    setErrorMessages(noErrorState);

    try {
      if (commentsDisabled) {
        return;
      }

      if (displayValue.commentType === "" && userIsAdmin) {
        setErrorMessages({
          ...errorMessages,
          commentType: "Please select a comment type.",
        });
        return;
      }

      const didStatusChange = displayValue.status !== status;
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
          overall: "Must change Status or provide a Comment to submit.",
        });
        return;
      }

      if (!statusDisabled && didStatusChange) {
        if (displayValue.status === "Unlock") {
          await releaseReport(selectedReport);
        } else if (displayValue.status === ReportStatus.ACCEPTED) {
          await acceptReport(selectedReport);
        }
      }

      await createComment(id, state, {
        comment: displayValue.comment,
        type: CommentType.REPORT,
        isInternal: displayValue.commentType === "internal",
        ...(didStatusChange && { statusChange: displayValue.status }),
      });

      // Force close because status changed and need to refetch reports to get new status
      if (didStatusChange) return modalDisclosure.onClose(true);

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
      setSubmitting(false);
    }
  };

  const userSpecificSubheading = userIsAdmin
    ? "[Instructional text]"
    : "Enter a comment below to comment on the report. A notification will be sent to your CMS Project Officer.";

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
            onClick={() => modalDisclosure.onClose()}
            fontWeight="bold"
          >
            Close
          </Button>
        </Flex>
        <DrawerHeader>
          <Flex direction="column" gap="spacer3">
            <Heading as="h1" sx={sx.drawerHeaderText}>
              Add comment to report
            </Heading>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <Flex direction="column" gap="spacer4" marginBottom="spacer4">
            <Text sx={sx.drawerSubheading}>{userSpecificSubheading}</Text>
            <Text fontSize="body_lg" fontWeight="body_lg">
              <b>Report:</b> {name}
            </Text>
            {errorMessages.overall && (
              <Text fontSize="body_md" color="red">
                {errorMessages.overall}
              </Text>
            )}

            {userIsAdmin && (
              <Fragment>
                <Dropdown
                  label="Status"
                  name="status"
                  onChange={onChange}
                  options={statusOptions}
                  value={displayValue.status}
                  disabled={statusDisabled}
                  errorMessage={errorMessages.status}
                />
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
              </Fragment>
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
            isLoading={submitting}
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
          <Button onClick={() => modalDisclosure.onClose()}>Close</Button>
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
    onClose: (shouldReport?: boolean) => void;
  };
  selectedReport: Report | LiteReport;
}
