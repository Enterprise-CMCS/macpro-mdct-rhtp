import { useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import { TextField } from "@cmsgov/design-system";
import { AlertTypes, CommentType } from "@rhtp/shared";
import { Alert } from "components/alerts/Alert";
import { Modal } from "components/modals/Modal";
import { useStore } from "utils";
import { createComment } from "utils/api/requestMethods/commentMethods";

export const SubmitForReview = () => {
  const [displayValue, setDisplayValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedForReview, setIsSubmittedForReview] = useState(false);
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
        type: CommentType.REPORT,
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
    setIsSubmittedForReview(true);
    setModalOpen(false);
    setIsSubmitting(false);
  };

  return (
    <Stack width={"100%"}>
      {isSubmittedForReview ? (
        <Alert title={"Submitted for Review"} status={AlertTypes.SUCCESS}>
          Your submission was sent to CMS for preliminary review of the details
          entered to date. You can still edit the report in preparation for
          final submission.
        </Alert>
      ) : null}
      <Text fontSize="heading_md" fontWeight="heading_md">
        Submit for Review
      </Text>
      <Text fontSize="body_md">
        Select “Submit for Review” to send a notification to CMS that the report
        is ready for a preliminary review. States will still have edit
        functionality to complete the rest of the report until you have selected
        to fully “Submit” the report below.
      </Text>
      <Button
        variant="outline"
        width="fit-content"
        marginTop="1rem"
        onClick={() => setModalOpen(true)}
        disabled={!userIsEndUser}
      >
        Submit for Review
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
          heading: "Submit for Review",
          subheading:
            "Add a comment below to detail to the CMS PO what portion of the report is ready for preliminary review. Once you select “Submit for Review” a notification will be sent to CMS PO’s.",
          actionButtonText: "Submit for Review",
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
