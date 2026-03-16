import {
  TextField,
  SingleInputDateField,
  Dropdown,
} from "@cmsgov/design-system";
import { ElementType } from "types";

export const buildElement = (
  defaultValue: string,
  element: ElementType,
  onChange: (value: string) => void,
  label?: string,
  children?: any
) => {
  switch (element) {
    case ElementType.Dropdown:
      return (
        <Dropdown
          name={label ?? "dropdown"}
          label={label}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          options={children}
          value={defaultValue}
        />
      );
    case ElementType.Textbox:
      return (
        <TextField
          label={label}
          name="description"
          onBlur={() => {}}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          value={defaultValue}
        />
      );
    case ElementType.TextAreaField:
      return (
        <TextField
          label={label}
          name="description"
          onBlur={() => {}}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          value={defaultValue}
          multiline
          rows={3}
        />
      );
    case ElementType.Date:
      return (
        <SingleInputDateField
          name={label ?? "date-field"}
          label={label}
          onChange={(_rawValue: string, maskedValue: string) => {
            onChange(maskedValue);
          }}
          value={defaultValue}
        />
      );
    default:
      console.log("missing: " + element);
  }
  return element;
};
