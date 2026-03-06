import { MouseEventHandler, ReactNode } from "react";
import {
  AccordionButton,
  AccordionItem as AccordionItemRoot,
  AccordionPanel,
  Image,
  SystemStyleObject,
  Text,
} from "@chakra-ui/react";
import plusIcon from "assets/icons/accordion/icon_plus.svg";
import minusIcon from "assets/icons/accordion/icon_minus.svg";

export const AccordionItem = ({
  label,
  children,
  sx: sxOverride,
  onClick,
}: Props) => {
  return (
    <AccordionItemRoot sx={sxOverride ?? ""}>
      {({ isExpanded }) => (
        <>
          <AccordionButton
            aria-label={label}
            title="accordion-button"
            onClick={onClick}
          >
            <Text flex="1">{label}</Text>
            <Image
              src={isExpanded ? minusIcon : plusIcon}
              alt={isExpanded ? "Collapse" : "Expand"}
            />
          </AccordionButton>
          <AccordionPanel>{children}</AccordionPanel>
        </>
      )}
    </AccordionItemRoot>
  );
};

interface Props {
  children?: ReactNode | ReactNode[];
  label?: string;
  sx?: SystemStyleObject;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
