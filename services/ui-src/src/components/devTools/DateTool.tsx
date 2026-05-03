import { Box, Button, Select } from "@chakra-ui/react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { ChangeEvent, useState } from "react";
import { useStore } from "utils";

interface Props {
  path: string[];
}

export const DevTools = ({ path }: Props) => {
  const isDevToolsAvaliable = path.includes("RHTP") && path.length === 4;
  const devTools = useFlags()?.devTools && isDevToolsAvaliable;
  if (!devTools) return;

  const [showOptions, setShowOptions] = useState<boolean>();
  const { devDate, setDevDate } = useStore();

  const onDateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDevDate(e.target.value);
  };

  const onClearReports = () => {};

  return (
    <Box sx={sx.container}>
      {showOptions && (
        <Box sx={sx.menuBox}>
          Current Dev Date: {devDate}
          <Select placeholder="Select an open date" onChange={onDateChange}>
            <option value="1766984400000">12/29/2025</option>
            <option value="1790726400000">9/30/2026</option>
            <option value="1798502400000">12/29/2026</option>
            <option value="1806537600000">4/1/2027</option>
            <option value="1814313600000">6/30/2027</option>
          </Select>
          <Button onClick={onClearReports}>Clear Reports</Button>
        </Box>
      )}
      <Button onClick={() => setShowOptions(!showOptions)}>Dev Tools</Button>
    </Box>
  );
};

const sx = {
  container: {
    position: "absolute",
    display: "flex",
    top: "96px",
    right: "0",
    zIndex: "999",
    alignItems: "flex-end",
    flexDir: "column",
  },
  menuBox: {
    background: "white",
    border: "1px solid black",
    height: "200px",
    width: "300px",
  },
};
