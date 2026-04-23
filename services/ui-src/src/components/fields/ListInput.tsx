import React, { useState } from "react";
import { ListInputTemplate } from "@rhtp/shared";
import { PageElementProps } from "components/report/Elements";
import { Button, HStack, Image } from "@chakra-ui/react";
import { Hint, Label, TextField } from "@cmsgov/design-system";
import cancelPrimary from "assets/icons/cancel/icon_cancel_primary.svg";
import addPrimary from "assets/icons/add/icon_add_blue.svg";
import { ErrorMessages } from "../../constants";

const validateField = (rawValue: string, validation: string | undefined) => {
  let validationError = undefined;
  if (validation === "link") {
    const isValid = URL.canParse(rawValue);
    if (!isValid) validationError = ErrorMessages.mustBeALink;
  }
  return validationError;
};

export const ListInput = (props: PageElementProps<ListInputTemplate>) => {
  const { updateElement, disabled, element } = props;
  const { id, label, fieldLabel, helperText, buttonText, answer, validation } =
    element;
  const [displayValue, setDisplayValue] = useState(answer ?? []);
  const [errorMessages, setErrorMessages] = useState([""]);

  const onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const rawValue = event.target.value;
    const newDisplay = [...displayValue];
    newDisplay[index] = rawValue;
    setDisplayValue(newDisplay);

    const newErrorMessages = [...errorMessages];
    const validationError = validateField(rawValue, validation);
    if (!rawValue) {
      newErrorMessages[index] = ErrorMessages.requiredResponse;
    } else if (validationError) {
      newErrorMessages[index] = validationError;
    } else {
      newErrorMessages[index] = "";
    }
    setErrorMessages(newErrorMessages);

    updateElement({ answer: newDisplay });
  };

  const onAddHandler = () => {
    const newDisplay = [...displayValue, ""];
    setDisplayValue(newDisplay);
    const newErrorMessages = [...errorMessages, ""];
    setErrorMessages(newErrorMessages);
    updateElement({ answer: newDisplay });
  };

  const onRemoveHandler = (index: number) => {
    const newDisplay = [...displayValue];
    newDisplay.splice(index, 1);
    setDisplayValue(newDisplay);
    const newErrorMessages = [...errorMessages];
    newErrorMessages.splice(index, 1);
    setErrorMessages(newErrorMessages);
    updateElement({ answer: newDisplay });
  };

  return (
    <fieldset key="list-input-field">
      <Label fieldId={id}>{label}</Label>
      <Hint id={id}>{helperText}</Hint>
      {displayValue.map((field, index) => (
        <HStack
          alignItems="flex-end"
          mt="1rem"
          key={`list-item-stack-${index}`}
        >
          <TextField
            key={`list-item-${index}`}
            name={`list-item-${index}`}
            label={`${fieldLabel} ${index + 1}`}
            value={field}
            onChange={(evt) => onChangeHandler(evt, index)}
            onBlur={(evt) => onChangeHandler(evt, index)}
            errorMessage={errorMessages?.[index]}
            disabled={disabled}
          />
          <Button
            variant="unstyled"
            onClick={() => onRemoveHandler(index)}
            disabled={disabled}
            aria-label={`Remove ${field}`}
            leftIcon={<Image src={cancelPrimary} alt="Remove icon" />}
          />
        </HStack>
      ))}
      <Button
        mt="1rem"
        variant="outline"
        leftIcon={<Image src={addPrimary} alt="Add icon" />}
        onClick={onAddHandler}
        disabled={disabled}
      >
        {buttonText}
      </Button>
    </fieldset>
  );
};
