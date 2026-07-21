import { Text } from "@chakra-ui/react";

export const CharacterCounter = ({ id, input = "", maxLength }: Props) => {
  const displayMessage = (input: string, maxLength: number) => {
    const pluralize = (count: number) => {
      return [1, -1].includes(count) ? "" : "s";
    };

    if (!input) return `${maxLength} character${pluralize(maxLength)} allowed`;

    const remaining = maxLength - input.length;
    const text = `${Math.abs(remaining)} character${pluralize(remaining)}`;

    return `${text} left`;
  };

  return (
    <Text id={id} sx={sx.characterCounter}>
      {displayMessage(input, maxLength)}
    </Text>
  );
};

interface Props {
  id: string;
  input: string;
  maxLength: number;
}

const sx = {
  characterCounter: {
    alignItems: "center",
    display: "flex",
  },
};
