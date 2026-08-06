import { Flex, Heading, Image, Link, Text, Box } from "@chakra-ui/react";
import { PageTemplate } from "components";
import warningIcon from "assets/icons/alert/icon_warning.svg";

export const AccessDeniedPage = () => {
  return (
    <PageTemplate sxOverride={sx.layout}>
      <Flex sx={sx.heading}>
        <Image src={warningIcon} alt="warning icon" sx={sx.warningIcon} />
        <Heading as="h1" variant="h1">
          Access Denied
        </Heading>
      </Flex>
      <Heading as="h2" variant="subHeader">
        You do not have permission to access this page.
      </Heading>
      <Box>
        <Text>
          <Link href={"/"}>Click here</Link> to go to the home page.
        </Text>
      </Box>
    </PageTemplate>
  );
};

const sx = {
  layout: {
    marginBottom: "spacer3",
    ".contentFlex": {
      maxWidth: "35rem",
    },
  },
  heading: {
    gap: "spacer2",
    alignItems: "center",
  },
  warningIcon: {
    boxSize: "2rem",
    ".mobile &": {
      boxSize: "1.5rem",
    },
  },
};
