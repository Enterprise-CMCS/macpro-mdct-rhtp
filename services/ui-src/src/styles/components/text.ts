import { ComponentStyleConfig } from "@chakra-ui/react";

const baseStyles = {
  color: "base",
  transition: "all 0.3s ease",
  ".mobile &": {
    fontSize: "body_md",
  },
};

const tableEmptyVariant = {
  maxWidth: "75%",
  margin: "0 auto",
  textAlign: "center",
};
const helperTextVariant = {
  color: "gray_dark",
};
const errorVariant = {
  color: "error",
  fontSize: "body_xs",
  marginTop: "spacer_half",
};
const greyVariant = {
  color: "gray",
  fontWeight: "body_sm",
  textTransform: "none",
  letterSpacing: "normal",
  fontSize: "body_sm",
};

const variants = {
  tableEmpty: tableEmptyVariant,
  helperText: helperTextVariant,
  error: errorVariant,
  grey: greyVariant,
};

const textTheme: ComponentStyleConfig = {
  baseStyle: baseStyles,
  variants: variants,
};

export default textTheme;
