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
    width: "90vw",
    maxWidth: "450px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
    boxShadow: "0px 3px 9px #00000033",
    marginBottom: "1rem",
    ".progress": {
      width: "100%",
      background: "transparent",
      borderRadius: "25px",
      border: "2px solid #0071BC",
    },
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
