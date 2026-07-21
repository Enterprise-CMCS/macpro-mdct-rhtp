import {
  Divider,
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  AlertTypes,
  AttachmentStatus,
  InitiativeAnswerProp,
  UploadListProp,
} from "@rhtp/shared";
import { Alert, Drawer } from "components";
import { StatusDropdown } from "components/fields/attachments/StatusDropdown";
import { StageCheckpointDropdown } from "components/fields/attachments/StageCheckpointDropdown";
import { canDeleteAttachment, canEditAttachment } from "utils/other/fileUtils";

export const ManageDrawer = ({
  modalDisclosure,
  answer,
  files,
  onModalDelete,
  updateElement,
}: Props) => {
  const file = files.find((file) => file.attachment.fileId === answer.fileId);

  if (!answer || !file) return;

  const [status, setStatus] = useState<AttachmentStatus>(file.status);
  const [initiatives, setInitiatives] = useState<string[]>(file.initiatives);
  const [checkpoint, setCheckpoint] = useState<string>(file.checkpoint ?? "");

  const onSubmit = async () => {
    file.initiatives = initiatives;
    file.checkpoint = checkpoint;
    file.status = status;
    await updateElement({ answer: files });
    modalDisclosure.onClose();
  };

  const isFilled = () => {
    return initiatives.length > 0 && checkpoint;
  };

  const onDropdownHandler = (initiatives: string[], checkpoint?: string) => {
    setInitiatives(initiatives);
    setCheckpoint(checkpoint ?? "");
  };

  return (
    <Drawer
      modalDisclosure={modalDisclosure}
      onConfirmHandler={onSubmit}
      onOutlineHandler={onModalDelete}
      content={{
        heading: "Manage Attachment",
        outlineButtonText: "Delete attachment",
        solidButtonText: "Save changes",
      }}
      disableConfirm={!isFilled()}
      disableOutline={
        canDeleteAttachment(file.status, true) ||
        !canEditAttachment(file.status)
      }
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
          isError={!isFilled()}
        />
        <Heading variant="h2">Delete attachment</Heading>
        {canEditAttachment(file.status) ? (
          <Alert status={AlertTypes.WARNING} title="Warning">
            Deleting this attachment will remove it from all initiatives,
            stages, and checkpoints below.
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
  updateElement: Function;
  files: InitiativeAnswerProp[];
}
