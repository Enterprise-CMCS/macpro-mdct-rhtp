import { Stack } from "@chakra-ui/react";
import {
  ChoiceList,
  Dropdown,
  DropdownChangeObject,
} from "@cmsgov/design-system";
import { InitiativePageTemplate, PageStatus } from "@rhtp/shared";
import { useEffect, useState } from "react";
import { useStore } from "utils";
import { checkpointAttachableOptions } from "verbiage/checkpoints";

interface Props {
  answer?: { initiatives: string[]; checkpoint?: string };
  disabled?: boolean;
  onDropdownHandler: (initiatives: string[], checkpoint: string) => void;
  errorCheck?: boolean;
  hideInitiative?: boolean;
}

export const StageCheckpointDropdown = ({
  answer,
  disabled,
  onDropdownHandler,
  hideInitiative,
  errorCheck,
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
    { label: string; value: string; checked: boolean; disabled: boolean }[]
  >([
    {
      label: "Select All",
      value: "all",
      checked: answer ? answer.initiatives.length > 0 : false,
      disabled: false,
    },
    ...getInitiativeOptions(),
  ]);
  const [checkpoint, setCheckpoint] = useState(answer?.checkpoint ?? "");

  useEffect(() => {
    //for changing the select all checkbox to indeterminate after rendering an edit view.
    if (answer?.initiatives) {
      const input = document.querySelector(
        'input[value="all"]'
      ) as HTMLInputElement;
      input.indeterminate =
        answer?.initiatives.length > 0 &&
        answer?.initiatives.length < initiativeOptions.length - 1;
    }
  }, []);

  const onChoiceChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    let choices = [...initiativeOptions];

    const choiceAll = choices[0];
    const filteredChoices = choices.filter((choice) => !choice.disabled);

    if (value === "all") {
      choices = choices.map((choice) => {
        const isChecked = !choice.disabled
          ? !choiceAll.checked
          : choice.checked;
        return {
          ...choice,
          checked: isChecked,
        };
      });
    } else {
      const choiceIndex = initiativeOptions.findIndex(
        (option) => option.value === value
      );
      choices[choiceIndex].checked = !choices[choiceIndex].checked;

      //set checks and indeterminate valye for select all
      choices[0].checked = filteredChoices.some(
        (choice) => choice.checked && choice.value != "all"
      );
      const input = document.querySelector(
        'input[value="all"]'
      ) as HTMLInputElement;
      input.indeterminate =
        choices[0].checked &&
        !filteredChoices.every((choice) => choice.checked);
    }
    setInitiativeOptions(choices);

    //if no checkbox is checked, we want to reset any options selected into the stage and checkpoint
    if (filteredChoices.every((choice) => !choice.checked)) {
      setCheckpoint("");
    }
    onDropdownHandler(
      initiativeOptions
        .filter((opt) => opt.checked && opt.value !== "all")
        .map((opt) => opt.value),
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
      initiativeOptions
        .filter((opt) => opt.checked && opt.value !== "all")
        .map((opt) => opt.value),
      newCheckpoint
    );
  };

  const getErrorMsg = () => {
    return errorCheck &&
      initiativeOptions.filter((opt) => opt.checked).length === 0
      ? "At least one initiative must be selected"
      : "";
  };

  return (
    <Stack gap="1.5rem">
      {!hideInitiative && (
        <ChoiceList
          choices={initiativeOptions}
          name={"initiative-choice-list"}
          type={"checkbox"}
          label={"Which initiative does this attachment apply to?"}
          onChange={onChoiceChangeHandler}
          disabled={disabled}
          errorMessage={getErrorMsg()}
        />
      )}
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
