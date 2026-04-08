import { ComponentStyleConfig, theme } from "@chakra-ui/react";

const baseStyles = {
  table: {
    th: {
      padding: "0.5rem 0",
      borderBottom: "1px solid",
      borderColor: "gray_light",
      color: "gray",
      fontWeight: "heading_sm_bold",
      textTransform: "none",
      letterSpacing: "normal",
      fontSize: "heading_sm",
    },
    tr: {
      borderBottom: "1px solid",
      borderColor: "gray_light",
    },
    td: {
      paddingLeft: 0,
      borderColor: "gray_light",
      textAlign: "left",
      "&:last-of-type": {
        paddingRight: 0,
      },
    },
  },
};

const stripedVariant = () => ({
  ...theme.components.Table.variants!.striped,
  table: {
    maxWidth: "100%",
    "tr td:first-of-type": {
      width: "8rem",
      fontWeight: "semibold",
    },
    td: {
      padding: "0.5rem",
    },
    "td, tr": {
      border: "none",
    },
  },
});
const statusVariant = {
  td: {
    fontSize: "heading_sm",
    padding: "0.75rem 0.75rem 0.75rem 0",
    "&:first-of-type": {
      width: "65%",
      fontWeight: "heading_sm_bold",
    },
    "&:nth-of-type(2)": {
      width: "25%",
      div: {
        display: "flex",
      },
    },
    ".mobile &": {
      border: "none",
      width: "100%",
      paddingY: "0.5rem",
    },
  },
  tr: {
    ".mobile &": {
      display: "grid",
      gridTemplateColumns: "50% 50%",
      paddingY: "0.5rem",
    },
  },
  th: {
    ".mobile &": {
      "&:last-of-type": {
        display: "none",
      },
      padding: "0",
    },
    "tr &": {
      border: "none",
    },
  },
};

const exportVariant = {
  table: {
    "th, td": {
      borderColor: "gray_lighter",
    },
    td: {
      fontSize: "heading_sm",
      width: "50%",
      "p:first-of-type": {
        fontWeight: "heading_sm_bold",
        color: "black",
      },
      "&:first-child": {
        "p:nth-child(2)": {
          color: "gray_medium",
        },
      },
      "vertical-align": "top",
    },
  },
};

const reportDetailsVariant = {
  tr: {
    "th, td": {
      borderColor: "transparent",
    },
  },
  td: {
    fontSize: "body_sm",
    padding: "0",
    color: "black",
    width: "25%",
  },
};

const metricVariant = {
  table: {
    boxShadow: "0px 2px 8px 0px #0000001F",
    th: {
      background: "primary_darkest",
      color: "white",
      padding: "1rem 0.75rem",
    },
    tr: {
      padding: "1rem",
      border: "none",
    },
    "tr:nth-child(even)": {
      background: "gray_lightest_highlight",
    },
    td: {
      border: "none",
      padding: "1rem 0.75rem",
      "label, button": {
        margin: "0",
        display: "flex",
        justifyContent: "center",
      },
      ".chakra-checkbox span": {
        width: "32px",
        height: "32px",
        borderColor: "black",
        svg: {
          width: "1.4rem",
        },
      },
      ".ds-c-single-input-date-field": {
        minWidth: "100px",
      },
      ".ds-c-label-mask": {
        display: "none",
      },
      "&:last-of-type": {
        paddingRight: "0.75rem",
      },
    },
  },
};

const initiativeVariant = {
  table: {
    th: {
      "&:last-of-type": {
        textAlign: "right",
      },
    },
    td: {
      "&:last-of-type": {
        textAlign: "right",
      },
      ".chakra-link": {
        width: "5rem",
      },
      ".chakra-button": {
        padding: "0 1rem",
      },
    },
  },
};

const variants = {
  striped: stripedVariant,
  status: statusVariant,
  export: exportVariant,
  reportDetails: reportDetailsVariant,
  metric: metricVariant,
  initiative: initiativeVariant,
};

const sizes = {};

const tableTheme: ComponentStyleConfig = {
  baseStyle: baseStyles,
  sizes: sizes,
  variants: variants,
};

export default tableTheme;
