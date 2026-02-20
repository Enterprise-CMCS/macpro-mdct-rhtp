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
    boxShadow: "0px 3px 9px #00000033",
    width: "100%",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
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
