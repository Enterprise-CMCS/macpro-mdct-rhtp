import { Box, Checkbox } from "@chakra-ui/react";
import { useState } from "react";

interface Prop {
  label: string;
  values: string[];
}

export const MultiSelect = ({ label, values }: Prop) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);

  const onClick = () => {
    setShowMenu(!showMenu);
  };

  const onChecked = (item: string) => {
    const newValues = [...selected, item];
    setSelected(newValues);
  };

  return (
    <Box className="ds-c-dropdown" sx={sx.container}>
      <div className="ds-c-label ds-c-dropdown__label">{label}</div>
      <button onClick={onClick}>
        <span className="ds-c-dropdown__button ds-c-field">States</span>
        <span className="ds-c-downdown__caret"></span>
      </button>
      {showMenu && (
        <div className="ds-c-dropdown__menu-container">
          <ul className="ds-c-dropdown__menu">
            {values.map((value) => (
              <li>
                <Checkbox onChange={() => onChecked(value)}>{value}</Checkbox>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Box>
  );
};

const sx = {
  container: {
    width: "140px",
    ".ds-c-field": {
      width: "140px",
    },
    ".chakra-checkbox__control": {
      width: "24px",
      height: "24px",
      border: "2px solid black",
    },
    li: {
      paddingLeft: "10px",
    },
  },
};
