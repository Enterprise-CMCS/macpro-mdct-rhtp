import {
  Box,
  Button,
  Image,
  Link,
  Menu as MenuRoot,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import { MenuOption } from "components";
import { useBreakpoint, useStore } from "utils";
import chevronDownIcon from "assets/icons/arrows/icon_arrow_down.svg";
import gearIcon from "assets/icons/icon_gear.svg";
import { UserRoles } from "@rhtp/shared";

export const AdminMenu = () => {
  const { userRole } = useStore().user ?? {};
  const { isMobile } = useBreakpoint();

  return (
    <MenuRoot offset={[0, 20]}>
      <Box role="group">
        <MenuButton
          as={Button}
          rightIcon={
            <Image src={chevronDownIcon} alt="Arrow down" sx={sx.menuIcon} />
          }
          sx={sx.menuButton}
          aria-label="admin menu"
        >
          <MenuOption
            icon={gearIcon}
            altText=""
            text="Admin"
            hideText={isMobile}
          />
        </MenuButton>
      </Box>
      <MenuList sx={sx.menuList}>
        <Link as={RouterLink} to="/admin" variant="unstyled">
          <MenuItem sx={sx.menuItem}>
            <MenuOption role="button" text="Banner Editor" />
          </MenuItem>
        </Link>
        {userRole === UserRoles.APPROVER && (
          <Link as={RouterLink} to="/notifications" variant="unstyled">
            <MenuItem sx={sx.menuItem}>
              <MenuOption role="button" text="Notifications" />
            </MenuItem>
          </Link>
        )}
      </MenuList>
    </MenuRoot>
  );
};

const sx = {
  menuButton: {
    padding: 0,
    paddingRight: "spacer1",
    marginLeft: "spacer1",
    borderRadius: 0,
    background: "none",
    color: "white",
    fontWeight: "bold",
    _hover: { background: "none !important" },
    _active: { background: "none" },
    _focus: {
      boxShadow: "none",
      outline: "0px solid transparent !important",
    },
    ".mobile &": {
      marginLeft: 0,
    },
    "& .chakra-button__icon": {
      marginInlineStart: "0rem",
    },
  },
  menuList: {
    background: "primary_darkest",
    padding: "0",
    border: "none",
    boxShadow: "0px 5px 16px rgba(0, 0, 0, 0.14)",
  },
  menuItem: {
    background: "primary_darkest",
    borderRadius: ".375rem",
    _focus: { background: "primary_darker" },
    _hover: { background: "primary_darker" },
  },
  menuIcon: {
    width: "0.75rem",
  },
};
