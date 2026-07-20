import { Heading, ListItem, Stack, UnorderedList } from "@chakra-ui/react";
import {
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
} from "@cmsgov/design-system";
import { AttachmentStatus, FileStatusOptions, UserRoles } from "@rhtp/shared";
import { useState } from "react";
import { optionalTag, useStore } from "utils";

interface Props {
  status: AttachmentStatus;
  onChange: (status: AttachmentStatus) => void;
}

export const StatusDropdown = ({ status, onChange }: Props) => {
  const { userRole } = useStore().user ?? {};
  const isStateUser = userRole === UserRoles.STATE_USER;
  const [statusOptions, _setStatusOptions] =
    useState<DropdownOption[]>(FileStatusOptions);

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
