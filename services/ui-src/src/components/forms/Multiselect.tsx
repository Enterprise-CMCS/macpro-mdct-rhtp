import { Box, Checkbox, Image } from "@chakra-ui/react";
import { useState } from "react";
import arrowIcon from "assets/icons/arrows/icon_arrow_up_black.svg";

export type MultiselectOptions = {
  label: string;
  value: string;
  checked?: boolean;
};

interface Prop {
  label: string;
  values: MultiselectOptions[];
  onChange: (item: MultiselectOptions[]) => void;
}

export const MultiSelect = ({ label, values, onChange }: Prop) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [filteredValues, setFilteredValues] =
    useState<{ label: string; value: string; checked?: boolean }[]>(values);

  const onClick = () => {
    setShowMenu(!showMenu);
  };

  const onChecked = (selection: string) => {
    const newSelection = [...values];
    const index = newSelection.findIndex(
      (select) => select.value === selection
    );
    newSelection[index].checked = !newSelection[index].checked;
    onChange(newSelection);
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    if (searchValue === undefined || searchValue === "")
      setFilteredValues(values);
    else {
      const displayValues = values.filter((value) =>
        value.label.toLowerCase().startsWith(searchValue)
      );
      setFilteredValues(displayValues);
    }
  };

  const count = () => {
    return values.filter((value) => value.checked).length;
  };

  const field = () => {
    return showMenu ? (
      <input
        type="search"
        placeholder="Search states"
        onChange={onSearch}
        value={search}
      />
    ) : (
      <input type="button" onClick={onClick} value={`States (${count()})`} />
    );
  };

  window.addEventListener("click", (e) => {
    const multiselect = document.getElementById("multiselect-field");
    const target = e.target as any;

    if (multiselect && !multiselect.contains(target)) {
      setSearch("");
      setFilteredValues(values);
      setShowMenu(false);
    }
  });

  return (
    <Box sx={sx.container} id="multiselect">
      <Box className="ds-c-label">{label}</Box>
      <Box position="relative" id="multiselect-field">
        <Box className="displayContainer">
          {field()}
          {search.length <= 0 && (
            <Image
              src={arrowIcon}
              className={showMenu ? "open" : "closed"}
            ></Image>
          )}
        </Box>
        {showMenu && (
          <Box className="ds-c-dropdown__menu-container">
            <ul className="ds-c-dropdown__menu">
              {filteredValues.map((value) => (
                <li>
                  <Checkbox
                    onChange={() => onChecked(value.value)}
                    isChecked={value.checked}
                    checked={value.checked}
                  >
                    {value.label}
                  </Checkbox>
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const sx = {
  container: {
    position: "relative",
    display: "flex",
    flexDir: "column",
    width: "190px",
    zIndex: "1001",
    ".ds-c-label": {
      marginBottom: "8px",
    },
    ".chakra-checkbox__control": {
      width: "24px",
      height: "24px",
      border: "2px solid black",
    },
    li: {
      paddingLeft: "10px",
      label: {
        margin: "0",
        paddingY: " 10px",
      },
    },
    ".displayContainer": {
      height: "42px",
      input: {
        background: "white",
        width: "100%",
        height: "100%",
        textAlign: "left",
        margin: "0",
        border: "2px solid black",
        borderRadius: "3px",
        padding: "8px",
      },
      img: {
        position: "absolute",
        width: "18px",
        right: "8px",
        top: "12px",
        "&.closed": {
          transform: "rotate(180deg)",
        },
        "&.open": {
          transform: "rotate(0deg)",
        },
      },
    },
  },
};
