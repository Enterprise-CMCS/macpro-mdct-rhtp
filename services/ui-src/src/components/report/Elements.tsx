import { useNavigate, useParams } from "react-router";
import {
  Button,
  Heading,
  Stack,
  Image,
  Text,
  Accordion,
  Divider,
  Flex,
  Box,
} from "@chakra-ui/react";
import {
  HeaderTemplate,
  SubHeaderTemplate,
  ParagraphTemplate,
  AccordionTemplate,
  ButtonLinkTemplate,
  HeaderIcon,
  PageElement,
  RhtpSubType,
} from "@rhtp/shared";
import { AccordionItem } from "components";
import arrowLeftIcon from "assets/icons/arrows/icon_arrow_left_blue.png";
import { parseHtml } from "utils";
import successIcon from "assets/icons/status/icon_status_check.svg";
import { useElementIsHidden } from "utils/state/hooks/useElementIsHidden";

export type PageElementProps<T extends PageElement = PageElement> = T extends {
  answer?: any;
}
  ? {
      element: T;
      updateElement: (updatedElement: Partial<T>) => void;
      disabled?: boolean;
      subType?: RhtpSubType;
    }
  : {
      element: T;
      disabled?: boolean;
    };

export const HeaderElement = ({
  element,
}: PageElementProps<HeaderTemplate>) => {
  const buildIcon = (icon: HeaderIcon | undefined) => {
    switch (icon) {
      case HeaderIcon.Check:
        return {
          src: successIcon,
          alt: "complete icon",
          text: "Complete",
        };
      default:
        return undefined;
    }
  };
  const icon = buildIcon(element.icon);

  return (
    <Heading as="h1" variant="h1">
      <Flex direction="row" width="100%">
        {icon && (
          <span>
            <Image
              src={icon.src}
              alt={icon.alt}
              marginRight="spacer2"
              boxSize="xl"
              height="27px"
              display="inline-block"
            />
          </span>
        )}
        {element.text}
      </Flex>
    </Heading>
  );
};

export const SubHeaderElement = ({
  element,
}: PageElementProps<SubHeaderTemplate>) => {
  const hideElement = useElementIsHidden(element.hideCondition);
  if (hideElement) {
    return null;
  }
  return (
    <Stack>
      <Heading as="h2" variant="subHeader">
        {element.text}
      </Heading>
      {element.helperText && (
        <Text variant="helperText">{element.helperText}</Text>
      )}
    </Stack>
  );
};

export const ParagraphElement = ({
  element,
}: PageElementProps<ParagraphTemplate>) => {
  const styleObject = (type: string) => {
    let styleDefault = { weight: "normal", size: "body_md", color: "base" };

    switch (type) {
      case "bold":
        return { ...styleDefault, weight: "bold" };
      case "hint":
        return { ...styleDefault, size: "body_sm", color: "gray_dark" };
    }
    return styleDefault;
  };

  const obj = styleObject(element.style ?? "");

  return (
    <Stack>
      {element.title && (
        <Text fontSize="heading_md" fontWeight="heading_md">
          {element.title}
        </Text>
      )}
      <Box fontSize={obj.size} fontWeight={obj.weight} color={obj.color}>
        {parseHtml(element.text)}
      </Box>
    </Stack>
  );
};

export const AccordionElement = ({
  element: accordion,
}: PageElementProps<AccordionTemplate>) => {
  return (
    <Accordion allowToggle={true} defaultIndex={[-1]}>
      <AccordionItem label={accordion.label}>
        {parseHtml(accordion.value)}
      </AccordionItem>
    </Accordion>
  );
};

export const DividerElement = (_props: PageElementProps) => {
  return <Divider></Divider>;
};

export const ButtonLinkElement = ({
  element: button,
}: PageElementProps<ButtonLinkTemplate>) => {
  const { reportType, state, reportId } = useParams();

  const navigate = useNavigate();
  const page = button.to;

  const link = `/report/${reportType}/${state}/${reportId}/${page}`;
  const nav = () => navigate(link);

  //swapping between props based on style
  const getPropObj = (style: string) => {
    switch (style) {
      case "alt-continue":
        return {
          prop: {
            marginLeft: "auto",
            variant: "primary",
            onClick: () => nav(),
          },
        };

      default:
        return {
          prop: {
            variant: "return",
            onClick: () => nav(),
          },
          style: {
            src: arrowLeftIcon,
            alt: "Arrow left",
          },
        };
    }
  };

  const propObj = getPropObj(button.style ?? "");

  return (
    <Button {...propObj.prop}>
      {propObj.style ? <Image {...propObj.style} className="icon" /> : null}
      {button.label}
    </Button>
  );
};
