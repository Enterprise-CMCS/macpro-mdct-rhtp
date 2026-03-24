import {
  TextField,
  SingleInputDateField,
  Dropdown,
  DropdownOption,
} from "@cmsgov/design-system";
import { ErrorMessages } from "../../../constants";
import { ActionElement, ElementType } from "types";
import { validateDate } from "utils/validation/inputValidation";

export const buildElement = (
  element: ActionElement,
  defaultValue: string | number,
  onChange: (value: string[]) => void,
  label?: string,
  errorMessage?: string
) => {
  const { type } = element;
  const children = "children" in element ? element.children : [];

  switch (type) {
    case ElementType.Paragraph:
      return defaultValue;
    case ElementType.Dropdown:
      return (
        <Dropdown
          name={label ?? "dropdown"}
          label={label}
          onChange={(event) => {
            onChange([event.target.value]);
          }}
          options={children as DropdownOption[]}
          value={defaultValue}
          errorMessage={errorMessage}
          disabled={element.disabled}
        />
      );
    case ElementType.Textbox:
      return (
        <TextField
          label={label}
          name={label ?? "textbox"}
          onChange={(event) => {
            onChange([event.target.value]);
          }}
          onBlur={(event) => {
            onChange([event.target.value]);
          }}
          value={defaultValue}
          errorMessage={errorMessage}
          disabled={element.disabled}
        />
      );
    case ElementType.TextAreaField:
      return (
        <TextField
          label={label}
          name={label ?? "textarea"}
          onChange={(event) => {
            onChange([event.target.value]);
          }}
          onBlur={(event) => {
            onChange([event.target.value]);
          }}
          value={defaultValue}
          errorMessage={errorMessage}
          multiline
          rows={3}
          disabled={element.disabled}
        />
      );
    case ElementType.Date:
      return (
        <SingleInputDateField
          name={label ?? "date-field"}
          label={label}
          onChange={(_rawValue: string, maskedValue: string) => {
            onChange([_rawValue, maskedValue]);
          }}
          value={defaultValue as string}
          errorMessage={errorMessage}
          disabled={element.disabled}
        />
      );
    default:
      console.error("missing: " + element);
  }
  return null;
};

export const getErrorMessage = (validation: string, value: string[]) => {
  switch (validation) {
    case "required":
      if (!value[0]) return ErrorMessages.requiredResponse;
      break;
    case "date":
      const { errorMessage } = validateDate(value[0], value[1], true);
      return errorMessage;
  }

  return "";
};
