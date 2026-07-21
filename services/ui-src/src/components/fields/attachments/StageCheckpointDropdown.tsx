import { Stack } from "@chakra-ui/react";
import {
  ChoiceList,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { InitiativePageTemplate, PageStatus } from "@rhtp/shared";
import { useState } from "react";
import { useStore } from "utils";
import { checkpointAttachableOptions } from "verbiage/checkpoints";

interface Props {
  answer?: { initiatives: string[]; checkpoint?: string };
  disabled?: boolean;
  onDropdownHandler: (initatives: string[], checkpoint: string) => void;
  isError?: boolean;
}

export const StageCheckpointDropdown = ({
  answer,
  disabled,
  onDropdownHandler,
  isError,
}: Props) => {
  const { report } = useStore();

  const initiatives = (report?.pages.filter(
    (page) => "initiativeNumber" in page
  ) || []) as InitiativePageTemplate[];

  const getInitiativeOptions = () => {
    return initiatives.map(({ id, initiativeNumber, status, title }) => {
      const isAbandoned = status === PageStatus.ABANDONED;
      const isChecked = answer?.initiatives.includes(id);

      return {
        label: `${initiativeNumber}: ${title}${isAbandoned ? " (abandoned)" : ""}`,
        value: id,
        checked: !!isChecked,
        disabled: isAbandoned,
      };
    });
  };

  const [initiativeOptions, setInitiativeOptions] = useState<
    { label: string; value: string; checked: boolean }[]
  >(getInitiativeOptions());
  const [checkpoint, setCheckpoint] = useState(answer?.checkpoint ?? "");

  const onChoiceChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    const choices = [...initiativeOptions];
    const choiceIndex = initiativeOptions.findIndex(
      (option) => option.value === value
    );
    choices[choiceIndex].checked = !choices[choiceIndex].checked;
    setInitiativeOptions(choices);

    //if no checkbox is checked, we want to reset any options selected into the stage and checkpoint
    if (choices.every((choice) => !choice.checked)) {
      setCheckpoint("");
    }
    onDropdownHandler(
      initiativeOptions.filter((opt) => opt.checked).map((opt) => opt.value),
      checkpoint
    );
  };

  const isStageEnabled = () => {
    return initiativeOptions.every((option) => option.checked != true);
  };

  const onCheckpointHandler = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    const newCheckpoint = event.target.value;
    setCheckpoint(newCheckpoint);
    onDropdownHandler(
      initiativeOptions.filter((opt) => opt.checked).map((opt) => opt.value),
      newCheckpoint
    );
  };

  return (
    <Stack gap="1.5rem">
      <ChoiceList
        choices={initiativeOptions}
        name={"initiative-choice-list"}
        type={"checkbox"}
        label={"Which initiative does this attachment apply to?"}
        onChange={onChoiceChangeHandler}
        disabled={disabled}
        errorMessage={isError ? "At least one initiative must be selected" : ""}
      />
      <Dropdown
        name={"checkpoint"}
        label={"Which stage/checkpoint does this attachment apply to?"}
        options={checkpointAttachableOptions}
        value={checkpoint}
        onChange={onCheckpointHandler}
        disabled={isStageEnabled() || disabled}
      />
    </Stack>
  );
};
