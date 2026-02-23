import { ComponentStyleConfig } from "@chakra-ui/react";

const baseStyles = {
  container: {},
};

const accordionVariant = {
  container: {
    paddingLeft: "1rem",
  },
};

const uploadVariant = {
  container: {
    width: "100%",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
    boxShadow: "0px 3px 9px #00000033",
    marginBottom: "1rem",
  },
};

const variants = {
  accordion: accordionVariant,
  upload: uploadVariant,
};

const listTheme: ComponentStyleConfig = {
  baseStyle: baseStyles,
  variants: variants,
};

export default listTheme;
