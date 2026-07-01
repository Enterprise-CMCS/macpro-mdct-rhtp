import { Link as RouterLink } from "react-router";
import { Flex, Container, Image, Link, Text } from "@chakra-ui/react";
import { useStore } from "utils";
import checkIcon from "assets/icons/check/icon_check_gray.png";

export const SubnavBar = () => {
  const { report, lastSavedTime } = useStore();
  const { userIsAdmin, userIsEndUser } = useStore().user ?? {};
  const saveStatusText = "Last saved " + lastSavedTime;
  const title = report?.name;

  //different return route if user is an admin
  const returnRoute =
    userIsEndUser && !userIsAdmin
      ? `/report/${report?.type}/${report?.state}`
      : "/";

  return (
    <Flex sx={sx.subnavBar}>
      <Container sx={sx.subnavContainer}>
        <Flex sx={sx.subnavFlex}>
          <Flex>
            <Text sx={sx.submissionNameText}>{title}</Text>
          </Flex>
          <Flex sx={sx.subnavFlexRight}>
            {lastSavedTime && (
              <>
                <Image
                  src={checkIcon}
                  alt="gray checkmark icon"
                  sx={sx.checkIcon}
                />
                <Text sx={sx.saveStatusText}>{saveStatusText}</Text>
              </>
            )}
            <Link
              as={RouterLink}
              to={returnRoute}
              sx={sx.leaveFormLink}
              variant="outlineButton"
            >
              Leave form
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );
};

const sx = {
  subnavBar: {
    position: "sticky",
    bg: "secondary_lightest",
  },
  subnavContainer: {
    maxW: "appMax",
    padding: ".5rem",
    ".desktop &": {
      paddingX: "spacer4",
    },
    minHeight: "60px",
  },
  subnavFlex: {
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },
  leaveFormLink: {
    marginLeft: "spacer2",
    ".mobile &": {
      margin: "0",
      paddingLeft: "0",
      textAlign: "right",
      border: "none",
    },
  },
  checkIcon: {
    marginRight: "spacer1",
    boxSize: "1rem",
    ".mobile &": {
      display: "none",
    },
  },
  submissionNameText: {
    fontWeight: "bold",
  },
  saveStatusText: {
    fontSize: "body_sm",
    ".mobile &": {
      textAlign: "right",
    },
  },
  subnavFlexRight: {
    alignItems: "center",
  },
};
