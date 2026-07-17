import { Heading, ListItem, Stack, UnorderedList } from "@chakra-ui/react";
import {
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
} from "@cmsgov/design-system";
import {
  AttachmentStatus,
  FileStatusOptions,
  InitiativeAnswerProp,
  UploadListProp,
  UserRoles,
} from "@rhtp/shared";
import { useState } from "react";
import { useStore } from "utils";

interface Props {
  files: InitiativeAnswerProp[];
  selectedFile: UploadListProp | undefined;
}

const noErrorState = {
  comment: "",
  status: "",
  overall: "",
  commentType: "",
};

export const AttachStatus = ({ files, selectedFile }: Props) => {
  const { userRole } = useStore().user ?? {};
  const isStateUser = userRole === UserRoles.STATE_USER;
  const [statusOptions, _setStatusOptions] =
    useState<DropdownOption[]>(FileStatusOptions);
  const [errorMessages, _setErrorMessages] = useState(noErrorState);

  const selectedAttachmentIndex = files.findIndex(
    (file) => file.attachment.fileId === selectedFile?.fileId
  );
  const fileStatus = files[selectedAttachmentIndex]?.status || "";

  const [displayValue, _setDisplayValue] = useState(fileStatus);
  const statusDisabled =
    isStateUser && fileStatus === AttachmentStatus.LOCKED_FOR_SCORING;

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    console.log(event);
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h2">Status</Heading>
      <UnorderedList>
        <ListItem>
          <b>Needs Revision, Informational, Archived:</b> The attachment will no
          longer be able to be deleted.
        </ListItem>
        <ListItem>
          <b>Locked for Scoring:</b> The attachment is locked and cannot be
          edited or deleted.
        </ListItem>
      </UnorderedList>
      <Dropdown
        label="Status (Optional)"
        name="status"
        onChange={onChange}
        options={statusOptions}
        value={displayValue}
        disabled={statusDisabled}
        errorMessage={errorMessages.status}
      />
    </Stack>
  );
};
