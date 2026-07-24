import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { HelpCard, PageTemplate } from "components";
import { HELP_DESK_EMAIL_ADDRESS } from "../../../constants";
import { useBreakpoint } from "utils";

export const HelpPage = () => {
  const { isDesktop } = useBreakpoint();
  const helpfile = "RHTP_State Reporting Expectations_Guide V7_6.12.26.pdf";
  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" variant="h1">
          How can we help you?
        </Heading>
        <Text>
          Question or feedback? Please email us and we will respond as soon as
          possible. You can also review our frequently asked questions below.
        </Text>
      </Box>
      <Flex flexDirection="column" gap="spacer4">
        <HelpCard icon="settings">
          <Text sx={sx.bodyText}>For technical support and login issues:</Text>
          <Text sx={sx.emailText}>
            Email {!isDesktop && <br />}
            <Link href={`mailto:${HELP_DESK_EMAIL_ADDRESS}`} target="_blank">
              {HELP_DESK_EMAIL_ADDRESS}
            </Link>
          </Text>
        </HelpCard>
        <HelpCard icon="spreadsheet">
          <Text sx={sx.bodyText}>For questions about the online form:</Text>
          <Text sx={sx.emailText}>
            Contact your Project Officer or refer to the{" "}
            <Link
              href={`${window.location.origin}/${helpfile}`}
              target="_blank"
              rel="noopener noreferrer"
              fontWeight="bold"
            >
              State Reporting Guide
            </Link>
          </Text>
        </HelpCard>
      </Flex>
    </PageTemplate>
  );
};

const sx = {
  bodyText: {
    marginBottom: "spacer1",
  },
  emailText: {
    fontWeight: "body_md_link_bold",
  },
};
