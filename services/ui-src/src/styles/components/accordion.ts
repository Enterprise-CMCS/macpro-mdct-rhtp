import { ComponentStyleConfig } from "@chakra-ui/react";

const baseStyles = {
  borderStyle: "none",
  root: {
    width: "100%",
  },
  button: {
    background: "gray_lightest",
    padding: "0 1.5rem",
    textAlign: "left",
    minHeight: "3.5rem",
  },
  panel: {
    width: "100%",
    table: {
      "tr td:last-of-type": {
        fontWeight: "semibold",
      },
    },
    a: {
      color: "primary",
      textDecoration: "underline",
    },
    header: {
      marginBottom: "spacer3",
    },
    p: {
      marginBottom: "spacer3",
    },
    ul: {
      marginBottom: "spacer3",
    },
  },
  container: {
    borderStyle: "none",
  },
};

const borderVariant = {
  ...baseStyles,
  button: {
    ...baseStyles.button,
    fontWeight: "bold",
  },
  panel: {
    ...baseStyles.panel,
    border: "2px solid #F2F2F2",
    "div, input, textarea, .ds-c-field": {
      width: "100%",
      maxWidth: "444px",
    },
    padding: "1.5rem",
  },
  container: {
    marginBottom: "1.5rem",
  },
};

const variants = {
  border: borderVariant,
};

const accordionTheme: ComponentStyleConfig = {
  baseStyle: baseStyles,
  variants: variants,
};

export default accordionTheme;
