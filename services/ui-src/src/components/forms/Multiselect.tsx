import { Box, Checkbox } from "@chakra-ui/react";
import { useState } from "react";

interface Prop {
  label: string;
  values: { label: string; value: string; checked?: boolean }[];
  onChange: (
    item: { label: string; value: string; checked?: boolean }[]
  ) => void;
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
    const multiselect = document.getElementById("multiselect");
    const target = e.target as any;

    if (multiselect && !multiselect.contains(target)) {
      setSearch("");
      setFilteredValues(values);
      setShowMenu(false);
    }
  });

  return (
    <Box sx={sx.container} id="multiselect">
      <div className="ds-c-label">{label}</div>
      <div className="displayContainer">{field()}</div>
      {showMenu && (
        <div className="ds-c-dropdown__menu-container">
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
        </div>
      )}
    </Box>
  );
};

const sx = {
  container: {
    position: "relative",
    display: "flex",
    flexDir: "column",
    width: "140px",
    ".ds-c-field": {
      width: "140px",
    },
    ".ds-c-dropdown__menu-container": {
      position: "absolute",
      top: "80px",
    },
    ".chakra-checkbox__control": {
      width: "24px",
      height: "24px",
      border: "2px solid black",
    },
    li: {
      paddingLeft: "10px",
    },
    ".displayContainer": {
      border: "2px solid black",
      input: {
        background: "white",
        width: "100%",
        height: "100%",
        padding: "8px",
        textAlign: "left",
        margin: "0",
      },
      height: "42px",
      marginTop: "8px",
    },
  },
};
