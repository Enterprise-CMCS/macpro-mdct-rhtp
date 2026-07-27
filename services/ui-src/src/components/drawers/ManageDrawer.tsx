import {
  Divider,
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  AlertTypes,
  AttachmentStatus,
  CommentType,
  InitiativeAnswerProp,
  UploadListProp,
} from "@rhtp/shared";
import { Alert, Drawer } from "components";
import { StatusDropdown } from "components/fields/attachments/StatusDropdown";
import { StageCheckpointDropdown } from "components/fields/attachments/StageCheckpointDropdown";
import { canDeleteAttachment, canEditAttachment } from "utils/other/fileUtils";
import { createComment } from "utils/api/requestMethods/commentMethods";
import { useStore } from "utils";

export const ManageDrawer = ({
  modalDisclosure,
  answer,
  files,
  onModalDelete,
  onSubmit,
}: Props) => {
  const [status, setStatus] = useState<AttachmentStatus>(
    AttachmentStatus.PENDING_REVIEW
  );
  const [initiatives, setInitiatives] = useState<string[]>([]);
  const [checkpoint, setCheckpoint] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<InitiativeAnswerProp>({
    initiatives: [],
    checkpoint: "",
    status: AttachmentStatus.PENDING_REVIEW,
    attachment: { name: "", size: 0, fileId: "" },
    canDelete: true,
  });
  const { report } = useStore();

  useEffect(() => {
    const file = files.find(
      (file) => file.attachment.fileId === answer?.fileId
    );

    if (file) {
      setStatus(file.status);
      setInitiatives(file.initiatives);
      setCheckpoint(file.checkpoint ?? "");
      setFile(file);
    }
  }, [modalDisclosure.isOpen]);

  const onConfirmHandler = async () => {
    setSubmitting(true);
    const newFile = {
      ...file,
      initiatives: initiatives,
      checkpoint: checkpoint,
      status: status,
    };

    const fileIndex = files.findIndex(
      (file) => file.attachment.fileId === newFile.attachment.fileId
    );
    files[fileIndex] = newFile;

    if (onSubmit) {
      await onSubmit(files);
    }
    // notify users if attachment is marked as one of the following statuses
    if (
      status === AttachmentStatus.LOCKED_FOR_SCORING ||
      status === AttachmentStatus.NEEDS_REVISION
    ) {
      await createComment(newFile.attachment.fileId, report?.state || "", {
        type: CommentType.ATTACHMENT_STATUS,
        parentReportId: report?.id,
        isInternal: false,
        statusChange: status,
      });
    }
    modalDisclosure.onClose();
    setSubmitting(false);
  };

  const isFilled = () => {
    return initiatives.length > 0 && checkpoint;
  };

  const onDropdownHandler = (initiatives: string[], checkpoint?: string) => {
    setInitiatives(initiatives);
    setCheckpoint(checkpoint ?? "");
  };

  if (!answer) return;

  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onConfirmHandler}
      onOutlineHandler={onModalDelete}
      submitting={submitting}
      content={{
        heading: "Manage Attachment",
        outlineButtonText: "Delete attachment",
        solidButtonText: "Save changes",
      }}
      disableConfirm={!isFilled()}
      disableOutline={!canDeleteAttachment(status, file.canDelete)}
    >
      <Stack gap="1.5rem">
        <Text>
          <b>Attachment:</b> {answer.name}
        </Text>
        <StatusDropdown
          status={file.status}
          onChange={(status) => setStatus(status)}
        ></StatusDropdown>
        <Divider></Divider>
        <Heading variant="h2">Adjust initiatives and stage/checkpoint</Heading>
        <Text>
          <b>Important:</b> If you edit the checkpoint, that change will update
          the file's checkpoint across all linked initiatives.
        </Text>
        <UnorderedList>
          <ListItem>
            Why can't I replace files? Federal record-keeping mandates require
            an unedited audit trail of all uploaded evidence.
          </ListItem>
          <ListItem>
            What should I do instead? If your file has no comments and is in
            "Pending Review," you can delete it entirely from the system below.
            If deletion is locked, change the status above to Archived, then
            upload your new document as a fresh attachment.
          </ListItem>
        </UnorderedList>
        <StageCheckpointDropdown
          answer={file}
          onDropdownHandler={onDropdownHandler}
          disabled={!canEditAttachment(file.status)}
          errorCheck={true}
        />
        <Heading variant="h2">Delete attachment</Heading>
        {canDeleteAttachment(file.status, file.canDelete) ? (
          <Alert status={AlertTypes.WARNING} title="Warning">
            Deleting this attachment will remove it from all initiatives,
            stages, and checkpoints above.
          </Alert>
        ) : (
          <Text>
            Attachment is in a status that cannot longer be deleted due to
            record keeping requirements.
          </Text>
        )}
      </Stack>
    </Drawer>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  onModalDelete?: () => void;
  answer: UploadListProp;
  onSubmit?: Function;
  files: InitiativeAnswerProp[];
}
