import { ComponentStyleConfig } from "@chakra-ui/react";

const baseStyles = {
  textDecoration: "underline",
  transition: "all 0.3s ease",
};

const primaryVariant = {
  color: "primary",
  _visited: {
    color: "primary",
    textDecorationColor: "primary",
  },
  ":hover, :visited:hover": {
    color: "primary_darker",
    textDecorationColor: "primary_darker",
  },
};
const returnVariant = {
  width: "fit-content",
  textDecoration: "none",
  _hover: {
    textDecoration: "underline",
  },
  _visited: {
    color: "primary",
  },
  display: "flex",
  ".icon": {
    width: "1.25rem",
    height: "1.25rem",
    marginTop: "0.15rem",
    marginRight: "spacer1",
  },
};
const sidebarVariant = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  textAlign: "left",
  textDecoration: "none",
  background: "transparent",
  color: "base",
  fontWeight: "body_sm_link",
  border: "1px solid",
  borderRadius: "0",
  borderColor: "gray_lighter",
  borderWidth: "0 0 1px 0",
  fontSize: "body_sm_link",
  lineHeight: "body_sm_link",
  paddingLeft: "1rem",
  height: "var(--chakra-sizes-10)",
  _visited: {
    color: "base",
  },
  ":focus, :focus:visited": {
    color: "secondary_darkest",
  },
  _hover: {
    color: "secondary_darkest",
    backgroundColor: "gray_lightest_highlight",
    border: "1px solid",
    borderColor: "secondary",
    borderWidth: "0 0 0 4px",
    textDecoration: "none",
  },
  "&.selected": {
    backgroundColor: "gray_lightest_highlight",
    border: "1px solid",
    borderColor: "secondary",
    borderWidth: "0 0 0 2px",
    color: "secondary_darkest",
  },
};
const inverseVariant = {
  color: "white",
  _visited: {
    color: "white",
    textDecorationColor: "white",
  },
  ":hover, :visited:hover": {
    color: "gray_lighter",
    textDecorationColor: "gray_lighter",
  },
  ":active, :focus, :focus:visited": {
    color: "white",
  },
};
const unstyledVariant = {
  textDecoration: "none",
  ":focus, :focus-visible, :hover, :visited, :visited:hover": {
    textDecoration: "none",
  },
};
const outlineButtonVariant = {
  color: "primary",
  border: "1px solid",
  paddingY: "spacer1",
  paddingX: "spacer2",
  borderRadius: "5px",
  fontWeight: "bold",
  textDecoration: "none",
  _visited: { color: "primary" },
  ":hover, :visited:hover": {
    color: "primary_darker",
    textDecoration: "none",
  },
  ".mobile &": {
    border: "none",
  },
};

const variants = {
  primary: primaryVariant,
  return: returnVariant,
  sidebar: sidebarVariant,
  inverse: inverseVariant,
  unstyled: unstyledVariant,
  outlineButton: outlineButtonVariant,
};

const linkTheme: ComponentStyleConfig = {
  baseStyle: baseStyles,
  variants: variants,
  defaultProps: {
    variant: "primary",
  },
};

export default linkTheme;
