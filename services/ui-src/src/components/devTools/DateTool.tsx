import { Box, Select, Text } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";

export const DevTools = () => {
  const devTools = useFlags()?.devTools;
  console.log("devTools", devTools);

  return (
    <Box sx={sx.container}>
      <Text>Current Date</Text>
      <Select placeholder="Select an open date">
        <option value="2026-09-30T00:00:00Z">9/30/2026</option>
        <option value="1798502400000">12/29/2026</option>
        <option value="1806537600000">4/1/2027</option>
        <option value="1814313600000">6/30/2027</option>
      </Select>
    </Box>
  );
};

const sx = {
  container: {
    position: "absolute",
    top: "200px",
  },
};
