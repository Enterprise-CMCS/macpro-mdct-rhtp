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

export const ManageDrawer = ({
  modalDisclosure,
  answer,
  files,
  onModalDelete,
  updateElement,
}: Props) => {
  if (!answer) return;
  const [status, setStatus] = useState<AttachmentStatus>(answer.status);
  const [initiatives, setInitiatives] = useState<string[]>([]);
  const [checkpoint, setCheckpoint] = useState<string>("");

  const onSubmit = async () => {
    const index = files.findIndex(
      (file) => file.attachment.fileId === answer.fileId
    );
    if (index !== -1) {
      files[index].initiatives = initiatives;
      files[index].checkpoint = checkpoint;
      files[index].status = status;
      await updateElement({ answer: files });
      modalDisclosure.onClose();
    }
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
    >
      <Stack gap="1.5rem">
        <Text>
          <b>Attachment:</b> {answer.name}
        </Text>
        <StatusDropdown
          status={answer.status}
          onChange={(status) => setStatus(status)}
        ></StatusDropdown>
        <Divider></Divider>
        <Heading variant="h2">Adjust initiatives and stage/checkpoint</Heading>
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
        <StageCheckpointDropdown onDropdownHandler={onDropdownHandler} />
        <Heading variant="h2">Delete attachment</Heading>
        <Alert status={AlertTypes.WARNING} title="Warning">
          Deleting this attachment will remove it from all initiatives, stages,
          and checkpoints below.
        </Alert>
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
  answer: UploadListProp & { status: AttachmentStatus };
  updateElement: Function;
  files: InitiativeAnswerProp[];
}
