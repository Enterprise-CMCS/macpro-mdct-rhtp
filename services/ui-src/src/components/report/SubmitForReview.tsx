import { useState } from "react";
import { Button, Stack, Text } from "@chakra-ui/react";
import { TextField } from "@cmsgov/design-system";
import { AlertTypes, ReportComment } from "@rhtp/shared";
import { Alert } from "components/alerts/Alert";
import { Modal } from "components/modals/Modal";
import { putReport, useStore } from "utils";

export const SubmitForReview = () => {
  const [displayValue, setDisplayValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedForReview, setIsSubmittedForReview] = useState(false);
  const { full_name, userIsEndUser } = useStore()?.user ?? {};
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

    const comment: ReportComment = {
      name: full_name || "CMS State User",
      date: new Date().toString(),
      comment: displayValue,
      isInternal: false,
    };

    if (report?.comments) {
      report.comments.push(comment);
    } else {
      report.comments = [comment];
    }

    await putReport(report);
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
          Instructions to come
        </Alert>
      ) : null}
      <Text fontSize="heading_md" fontWeight="heading_md">
        Ready for Review?
      </Text>
      <Text fontSize="body_md">
        [Instructions about what happens during review]
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
          subheading: "{More instructions to come}",
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
