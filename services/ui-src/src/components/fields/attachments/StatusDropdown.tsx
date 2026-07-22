import {
  Heading,
  ListItem,
  Stack,
  UnorderedList,
  Text,
} from "@chakra-ui/react";
import { Dropdown, DropdownChangeObject } from "@cmsgov/design-system";
import { AttachmentStatus, FileStatusOptions, UserRoles } from "@rhtp/shared";
import { useState } from "react";
import { optionalTag, useStore } from "utils";

interface Props {
  status: AttachmentStatus;
  onChange: (status: AttachmentStatus) => void;
}

const buildStatusOptions = (isStateUser: boolean, currentStatus: string) => {
  let statusOptions = structuredClone(FileStatusOptions);
  // state users cannot change status to Locked For Scoring or Needs Revision, but those options should still show up if it's the existing status
  if (isStateUser) {
    statusOptions = statusOptions.filter(
      (status) =>
        (status.value !== AttachmentStatus.LOCKED_FOR_SCORING &&
          status.value !== AttachmentStatus.NEEDS_REVISION) ||
        status.value === currentStatus
    );
  }
  return statusOptions;
};

export const StatusDropdown = ({ status, onChange }: Props) => {
  const { userRole } = useStore().user ?? {};
  const isStateUser = userRole === UserRoles.STATE_USER;
  const statusOptions = buildStatusOptions(isStateUser, status);

  const statusDisabled =
    isStateUser && status === AttachmentStatus.LOCKED_FOR_SCORING;

  const [displayValue, setDisplayValue] = useState(status);

  const setDropdownValue = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    const newStatus = event.target.value as AttachmentStatus;
    setDisplayValue(newStatus);
    onChange(newStatus);
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h2">Status</Heading>
      <Text>
        Use the field below to manage the attachment status. Certain statuses
        restrict the ability to modify or remove files. View “Understanding
        initiatives status” instructions on previous page for more detailed
        definitions:
      </Text>
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
        label={optionalTag({ label: "Status", required: false })}
        name="status"
        onChange={setDropdownValue}
        options={statusOptions}
        value={displayValue}
        disabled={statusDisabled}
      />
    </Stack>
  );
};
