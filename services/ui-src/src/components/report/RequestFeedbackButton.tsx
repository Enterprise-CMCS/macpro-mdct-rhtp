import { useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import { TextField } from "@cmsgov/design-system";
import { AlertTypes, CommentType } from "@rhtp/shared";
import { Alert } from "components/alerts/Alert";
import { Modal } from "components/modals/Modal";
import { useStore } from "utils";
import { createComment } from "utils/api/requestMethods/commentMethods";

export const RequestFeedbackButton = () => {
  const [displayValue, setDisplayValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didRequestFeedback, setDidRequestFeedback] = useState(false);
  const { userIsEndUser } = useStore()?.user ?? {};
  const { report } = useStore();

  if (!report) {
    return null;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDisplayValue(value);
  };

  const onSubmit = async () => {
    const commentsEmpty = displayValue.trim() === "";
    if (commentsEmpty) {
      setErrorMessage("A response is required.");
      return;
    }
    setIsSubmitting(true);

    try {
      await createComment(report.id, report.state, {
        comment: displayValue,
        type: CommentType.REQUEST_FEEDBACK,
        isInternal: false,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrorMessage(
        "There was an error submitting your comment. Please try again."
      );
      setIsSubmitting(false);
      return;
    }

    setDisplayValue("");
    setErrorMessage("");
    setDidRequestFeedback(true);
    setModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <Stack width={"100%"}>
      {didRequestFeedback ? (
        <Alert title={"Feedback requested"} status={AlertTypes.SUCCESS}>
          You requested feedback from your PO for preliminary review of the
          details entered to date. You can still edit the report in preparation
          for final submission.
        </Alert>
      ) : null}
      <Text fontSize="heading_md" fontWeight="heading_md">
        Request PO Feedback
      </Text>
      <Text fontSize="body_md">
        Highly Optional. This does NOT lock your report. Use this strictly if
        you want to flag a section for early alignment with your PO via the
        platform similar to email correspondence.
      </Text>
      <Button
        variant="outline"
        width="fit-content"
        marginTop="1rem"
        onClick={() => setModalOpen(true)}
        disabled={!userIsEndUser}
      >
        Request PO Feedback
      </Button>
      <Modal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => {
            setModalOpen(false);
            setErrorMessage("");
          },
        }}
        onConfirmHandler={onSubmit}
        submitting={isSubmitting}
        content={{
          heading: "Request PO Feedback",
          subheading:
            "Add a comment below to detail to the CMS PO what section of the report is ready for feedback. Once you select Request PO Feedback, an email notification will be sent to your PO’s. You can continue to edit your report.",
          actionButtonText: "Request PO Feedback",
          closeButtonText: "Cancel",
        }}
      >
        <TextField
          name={"comment"}
          label={"Add Comment"}
          onChange={onChange}
          value={displayValue}
          errorMessage={errorMessage}
          multiline
          rows={3}
        />
      </Modal>
    </Stack>
  );
};
