import { useContext } from "react";
import { UserContext } from "utils";
import { useLocation } from "react-router";
import { Box, Button, Heading } from "@chakra-ui/react";

export const LoginIDM = () => {
  const { loginWithIDM } = useContext(UserContext);
  const { pathname } = useLocation();

  const handleLogin = async () => {
    localStorage.setItem("ReturnURL", pathname);
    await loginWithIDM();
  };

  return (
    <Box sx={sx.root}>
      <Heading as="h2" fontSize="heading_xl" sx={sx.heading}>
        Log In with IDM
      </Heading>
      <Button sx={sx.button} onClick={handleLogin}>
        Log In with IDM
      </Button>
    </Box>
  );
};

const sx = {
  root: {
    textAlign: "center",
  },
  heading: {
    marginBottom: "spacer4",
    alignSelf: "center",
  },
  button: {
    width: "100%",
  },
};
