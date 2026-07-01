import React, { useState, useEffect } from "react";
import { TextField as CmsdsTextField } from "@cmsgov/design-system";
import { Box } from "@chakra-ui/react";
import { optionalTag, parseHintText, useStore } from "utils";
import { TextAreaBoxTemplate } from "@rhtp/shared";
import { PageElementProps } from "../report/Elements";
import { useElementIsHidden } from "utils/state/hooks/useElementIsHidden";
import { ErrorMessages } from "../../constants";

export const TextAreaField = (props: PageElementProps<TextAreaBoxTemplate>) => {
  const { setModalComponent } = useStore();
  const { element: textbox, updateElement, disabled } = props;
  const defaultValue = textbox.answer ?? "";
  const [displayValue, setDisplayValue] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState("");

  const hideElement = useElementIsHidden(textbox.hideCondition);

  // Need to listen to prop updates from the parent for events
  useEffect(() => {
    setDisplayValue(textbox.answer ?? "");
  }, [textbox.answer]);

  const onChangeHandler = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setDisplayValue(value);
    if (!value && textbox.required) {
      setErrorMessage(ErrorMessages.requiredResponse);
    } else {
      setErrorMessage("");
    }
    const answer = value === "" ? undefined : value;
    updateElement({ answer });
  };

  const parsedHint = parseHintText(textbox, setModalComponent);

  if (hideElement) {
    return null;
  }

  return (
    <Box width={"100%"}>
      <CmsdsTextField
        name={textbox.id}
        label={optionalTag(textbox)}
        hint={parsedHint}
        onChange={onChangeHandler}
        onBlur={onChangeHandler}
        value={displayValue}
        errorMessage={errorMessage}
        multiline
        rows={3}
        disabled={disabled || textbox.disabled}
      />
    </Box>
  );
};
