import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { LiteReport } from "@rhtp/shared";
import { useFlags } from "launchdarkly-react-client-sdk";
import { DevDashboardTools } from "./DevDashboardTools";
import { DevReportTools } from "./DevReportTools";
import { useState } from "react";

interface Props {
  reportType: string | undefined;
  state: string | undefined;
  reloadReports?: Function;
  reports: LiteReport[];
  type: ToolType;
}

export enum ToolType {
  DASHBOARD = "dashboard",
  REPORT = "report",
}

export const DevTools = ({
  reportType,
  state,
  reloadReports,
  reports,
  type,
}: Props) => {
  const devTools = useFlags()?.devTools;
  if (!devTools || !reportType || !state) return;

  const [showOptions, setShowOptions] = useState<boolean>();

  return (
    <Box sx={sx.container} top={type === ToolType.DASHBOARD ? "96px" : "156px"}>
      <Button sx={sx.primaryBtn} onClick={() => setShowOptions(!showOptions)}>
        <Text transform="rotate(-90deg)" color="white">
          Dev Tools
        </Text>
      </Button>
      {showOptions && (
        <Stack sx={sx.menuBox} gap="1rem">
          {type === ToolType.DASHBOARD && (
            <DevDashboardTools
              reportType={reportType}
              state={state}
              reports={reports}
              reloadReports={reloadReports}
            ></DevDashboardTools>
          )}
          {type === ToolType.REPORT && <DevReportTools></DevReportTools>}
        </Stack>
      )}
    </Box>
  );
};

const sx = {
  container: {
    position: "fixed",
    display: "flex",
    right: "0",
    zIndex: "999",
    alignItems: "flex-start",
  },
  menuBox: {
    background: "white",
    border: "1px solid grey",
    height: "100%",
    width: "300px",
    padding: "12px",
    borderRadius: "0px 0px 0px 12px",
    boxShadow: "0px 3px 9px rgba(0, 0, 0, 0.1)",
    minHeight: "110px",
  },
  primaryBtn: {
    width: "40px",
    height: "100px",
    borderRadius: "12px 0px 0px 12px",
  },
};
