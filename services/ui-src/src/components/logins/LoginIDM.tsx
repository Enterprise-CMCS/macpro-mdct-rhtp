import { useContext } from "react";
import { getReturnUrl, UserContext } from "utils";
import { Box, Button, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router";

export const LoginIDM = () => {
  const navigate = useNavigate();
  const { loginWithIDM } = useContext(UserContext);

  const handleLogin = () => {
    loginWithIDM();
    navigate(getReturnUrl());
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
