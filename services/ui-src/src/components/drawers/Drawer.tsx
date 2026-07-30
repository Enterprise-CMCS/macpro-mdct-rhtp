import { ReactNode } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Spinner,
  Drawer as ChakraDrawer,
  DrawerHeader,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Divider,
} from "@chakra-ui/react";
import closeIcon from "assets/icons/close/icon_close_primary.svg";
import { parseHtml, useBreakpoint } from "utils";

export const Drawer = ({
  modalDisclosure,
  content,
  onOutlineHandler,
  onConfirmHandler,
  submitting,
  children,
  disableConfirm,
  disableOutline,
}: Props) => {
  const { isMobile } = useBreakpoint();

  return (
    <ChakraDrawer
      isOpen={modalDisclosure.isOpen}
      onClose={modalDisclosure.onClose}
      preserveScrollBarGap={true}
      size={isMobile ? "sm" : "md"}
    >
      <DrawerOverlay />
      <DrawerContent maxWidth={"576px"} sx={sx.modalContent}>
        <Flex sx={sx.headerContainer}>
          <DrawerHeader sx={sx.modalHeaderText}>
            <Heading as="h1">{content.heading}</Heading>
          </DrawerHeader>
          <Button
            leftIcon={<Image src={closeIcon} alt="Close" />}
            variant="link"
            onClick={modalDisclosure.onClose}
            fontWeight="bold"
            sx={sx.close}
          >
            Close
          </Button>
        </Flex>
        <DrawerBody sx={sx.modalBody}>
          {content.subheading && (
            <Box sx={sx.subheading}>{parseHtml(content.subheading)}</Box>
          )}
          {children}
        </DrawerBody>
        <Divider padding="16px 0"></Divider>
        <DrawerFooter
          paddingX="0"
          justifyContent="space-between"
          flexDirection="row-reverse"
        >
          {onConfirmHandler && (
            <Button
              sx={sx.action}
              onClick={() => onConfirmHandler()}
              disabled={disableConfirm || submitting}
            >
              {submitting ? <Spinner size="md" /> : content.solidButtonText}
            </Button>
          )}
          {onOutlineHandler && (
            <Button
              variant="outline"
              onClick={() => onOutlineHandler()}
              fontWeight="bold"
              disabled={disableOutline}
            >
              {content.outlineButtonText}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </ChakraDrawer>
  );
};

interface Props {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  content: {
    heading: string;
    subheading?: string;
    solidButtonText: string | ReactNode;
    outlineButtonText?: string;
  };
  onOutlineHandler?: () => void;
  onConfirmHandler?: () => void;
  submitting?: boolean;
  disableConfirm?: boolean;
  disableOutline?: boolean;
  children?: ReactNode;
}

const sx = {
  modalContent: {
    padding: "24px 56px",
    overflow: "scroll",
  },
  headerContainer: {
    position: "relative",
    justifyContent: "space-between",
    padding: "0",
  },
  modalHeaderText: {
    flexBasis: "100%",
    padding: "0 16px 0 0",
    h1: {
      fontSize: "heading_2xl",
      fontWeight: "heading_2xl",
      paddingRight: "12px",
    },
  },
  modalBody: {
    padding: "24px 0 0 0",
    overflow: "visible",
  },
  subheading: {
    paddingBottom: "spacer3",
  },
  action: {
    minWidth: "10rem",
    span: {
      "&.ds-c-spinner": {
        marginLeft: 0,
      },
    },
    ".mobile &": {
      fontSize: "body_sm",
    },
  },
  close: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
    width: "78px",
    span: {
      display: "flex",
      alignItems: "flex-start",
      width: "12px",
      height: "100%",
      padding: "6px 0 0 0 ",
    },
  },
};
