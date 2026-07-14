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
import { useBreakpoint } from "utils";

export const Drawer = ({
  modalDisclosure,
  content,
  onConfirmHandler,
  submitting,
  formId,
  children,
  disableConfirm,
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
      <DrawerContent maxWidth={"576px"}>
        <Flex sx={sx.headerContainer}>
          <DrawerHeader sx={sx.modalHeaderText}>
            <Heading as="h1">
              {content.heading} asd asd asd sad asd asdasa dsad
            </Heading>
          </DrawerHeader>
          {content.subheading && (
            <Box sx={sx.subheading}>{content.subheading}</Box>
          )}
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
        <DrawerBody>{children}</DrawerBody>
        <Divider></Divider>
        <DrawerFooter>
          {formId && (
            <Button
              sx={sx.action}
              form={formId}
              type="submit"
              disabled={disableConfirm || submitting}
            >
              {submitting ? <Spinner size="md" /> : content.actionButtonText}
            </Button>
          )}
          {onConfirmHandler && (
            <Button
              sx={sx.action}
              onClick={() => onConfirmHandler()}
              disabled={disableConfirm || submitting}
            >
              {submitting ? <Spinner size="md" /> : content.actionButtonText}
            </Button>
          )}
          {content.closeButtonText && (
            <Button
              variant="link"
              onClick={modalDisclosure.onClose}
              fontWeight="bold"
            >
              {content.closeButtonText}
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
    actionButtonText: string | ReactNode;
    closeButtonText?: string;
  };
  onConfirmHandler?: () => void;
  submitting?: boolean;
  disableConfirm?: boolean;
  formId?: string;
  children?: ReactNode;
}

const sx = {
  headerContainer: {
    position: "relative",
    justifyContent: "space-between",
    padding: "24px 24px 0 24px",
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
