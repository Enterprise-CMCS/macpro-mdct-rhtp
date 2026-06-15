import { Box, Checkbox, Image } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import arrowIcon from "assets/icons/arrows/icon_arrow_up_black.svg";
import { InlineError } from "@cmsgov/design-system";

interface Prop {
  label: string;
  values: string[];
  options: { label: string; value: string }[];
  placeholder: string;
  countLabel: string;
  onChange: (item: string[]) => void;
  errorMessage?: string;
}

export const MultiSelect = ({
  label,
  values,
  options,
  countLabel,
  placeholder,
  onChange,
  errorMessage,
}: Prop) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [filteredValues, setFilteredValues] =
    useState<{ label: string; value: string }[]>(options);

  const onClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const clickOutOfBounds = (e: PointerEvent) => {
      const multiselect = document.getElementById(`multiselect-field-${label}`);
      const target = e.target as any;

      if (multiselect && !multiselect.contains(target)) {
        setSearch("");
        setFilteredValues(options);
        setIsOpen(false);
      }
    };

    window.addEventListener("click", clickOutOfBounds);

    //when component unmounts, it will run this function
    return () => {
      window.removeEventListener("click", clickOutOfBounds);
    };
  }, []);

  const onChecked = (selection: string) => {
    let newSelection = [...values];
    if (newSelection.includes(selection)) {
      onChange(newSelection.filter((selected) => selected != selection));
    } else {
      onChange([...newSelection, selection]);
    }
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    if (searchValue === undefined || searchValue === "")
      setFilteredValues(options);
    else {
      const displayValues = options.filter((value) =>
        value.label.toLowerCase().startsWith(searchValue)
      );
      setFilteredValues(displayValues);
    }
  };

  const field = () => {
    return isOpen ? (
      <input
        id="multi-search"
        type="search"
        placeholder={placeholder}
        onChange={onSearch}
        value={search}
        aria-label={`Search ${countLabel} by name`}
      />
    ) : (
      <input
        id="multi-select"
        name="multi-select"
        type="button"
        onClick={onClick}
        value={`${countLabel} (${values.length})`}
        aria-label={`${countLabel} select`}
      />
    );
  };

  return (
    <Box sx={sx.container} id="multiselect">
      <Box className="ds-c-label">{label}</Box>
      {errorMessage ? <InlineError>{errorMessage}</InlineError> : null}
      <Box position="relative" id={`multiselect-field-${label}`}>
        <Box className="displayContainer">
          {field()}
          {search.length <= 0 && (
            <Image
              src={arrowIcon}
              className={isOpen ? "open" : "closed"}
              onClick={onClick}
              alt={isOpen ? "down arrow" : "up arrow"}
            ></Image>
          )}
        </Box>
        {isOpen && (
          <Box className="ds-c-dropdown__menu-container">
            <ul className="ds-c-dropdown__menu">
              {filteredValues.map((opt) => (
                <li key={opt.value}>
                  <Checkbox
                    onChange={() => onChecked(opt.value)}
                    isChecked={values.includes(opt.value)}
                    checked={values.includes(opt.value)}
                  >
                    {opt.label}
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
    minWidth: "190px",
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
          pointerEvents: "None",
        },
        "&.open": {
          transform: "rotate(0deg)",
          pointerEvents: "auto",
        },
      },
    },
  },
};
