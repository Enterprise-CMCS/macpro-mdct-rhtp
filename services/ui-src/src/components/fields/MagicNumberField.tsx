import { TextField, TextFieldProps } from "@cmsgov/design-system";

/**
 * A mask function compatible with the CMSDS `useLabelMask()` hook.
 * Provides masking behavior for both the hint and the input value.
 */
const magicNumberMask = (value: string | number = "", _valueOnly = false) => {
  const rawValue = String(value);
  let formattedValue = "";
  let numericValue = undefined;

  const hasDigits = /\d/.test(rawValue);
  const startsWithN = rawValue.startsWith("N") || rawValue.startsWith("n");
  const hasNegative = rawValue.includes("-");
  const hasDollar = rawValue.includes("$");
  const hasPercent = rawValue.includes("%");
  const stripped = rawValue
    .replaceAll(/[^\d\.]/g, "")
    .match(/^(\d*\.?\d*)/)![1];
  if (!hasDigits && startsWithN) {
    formattedValue = "N/A";
  } else if (hasDigits) {
    numericValue = Number(stripped);

    if (hasPercent) {
      formattedValue = `${numericValue}%`;
    } else if (hasDollar) {
      formattedValue = `$${numericValue}`;
    } else {
      formattedValue = `${numericValue}`;
    }

    if (hasNegative) {
      formattedValue = `-${formattedValue}`;
    }
  }

  return formattedValue;
};

const isStrictlyValid = (rawInput: string) => {
  const NUMBER = /^-?\d+(\.\d+)?$/;
  const PERCENT = /^-?\d+(\.\d+)?%$/;
  const DOLLAR = /^-?\$\d+(\.\d+)?$/;
  const NA = /^N\/A$/;
  return [NUMBER, PERCENT, DOLLAR, NA].some((format) => format.test(rawInput));
};

/**
 * A field that accepts bare numbers, dollar amounts, percentages, and "N/A"
 */
export const MagicNumberField = (props: Omit<TextFieldProps, "labelMask">) => {
  const createChangeHandler = (eventName: string) => (evt: any) => {
    const rawValue = evt.target.value;
    const formatted = magicNumberMask(rawValue, true);
    const valueToSave = isStrictlyValid(rawValue) ? rawValue : undefined;
    console.log(eventName, { rawValue, formatted, valueToSave });
  };

  return (
    <TextField
      {...props}
      onChange={createChangeHandler("onChange")}
      onBlur={createChangeHandler("onBlur")}
      labelMask={magicNumberMask}
    />
  );
};
