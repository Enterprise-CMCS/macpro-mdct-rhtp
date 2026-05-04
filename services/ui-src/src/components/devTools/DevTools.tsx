import { Box, Button, Select, Text, Stack, Divider } from "@chakra-ui/react";
import { LiteReport } from "@rhtp/shared";
import { useFlags } from "launchdarkly-react-client-sdk";
import { ChangeEvent, useState } from "react";
import { deleteReport, deleteReportsForState, useStore } from "utils";

interface Props {
  reportType: string | undefined;
  state: string | undefined;
  reloadReports: Function;
  reports: LiteReport[];
}

const dateOptions = [
  { label: "Default", value: Date.now() },
  { label: "9/30/2026", value: "1790726400000" },
  { label: "12/29/2026", value: "1798502400000" },
  { label: "4/1/2027", value: "1806537600000" },
  { label: "6/30/2027", value: "1814313600000" },
  { label: "9/30/2027", value: "1822262400000" },
  { label: "12/29/2027", value: "1830038400000" },
  { label: "3/29/2028", value: "1837900800000" },
  { label: "6/30/2028", value: "1845936000000" },
  { label: "9/30/2028", value: "1853884800000" },
  { label: "12/29/2028", value: "1861660800000" },
  { label: "4/1/2029", value: "1869696000000" },
  { label: "6/30/2029", value: "1877472000000" },
  { label: "9/30/2029", value: "1885420800000" },
  { label: "12/29/2029", value: "1893196800000" },
  { label: "4/1/2030", value: "1901232000000" },
  { label: "6/30/2030", value: "1909008000000" },
  { label: "9/30/2030", value: "1916956800000" },
  { label: "12/29/2031", value: "1956441600000" },
];

export const DevTools = ({
  reportType,
  state,
  reloadReports,
  reports,
}: Props) => {
  const devTools = useFlags()?.devTools;
  if (!devTools || !reportType || !state) return;

  const { setDevDate } = useStore();
  const [devDateLabel, setDevDateLabel] = useState<string>("");
  const [showOptions, setShowOptions] = useState<boolean>();
  const [selectedReport, setSelectedReport] = useState<string>("");

  const onDateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value ?? Date.now();
    setDevDate(e.target.value);
    setDevDateLabel(new Date(parseInt(newDate) ?? 0).toLocaleDateString());
  };

  const onDeleteReport = async () => {
    await deleteReport(reportType, state, selectedReport).then(() => {
      reloadReports(reportType, state);
    });
  };
  const onDeleteAllReports = async () => {
    await deleteReportsForState(reportType, state).then(() => {
      reloadReports(reportType, state);
    });
  };

  return (
    <Box sx={sx.container}>
      <Button sx={sx.primaryBtn} onClick={() => setShowOptions(!showOptions)}>
        <Text transform="rotate(-90deg)" color="white">
          Dev Tools
        </Text>
      </Button>
      {showOptions && (
        <Stack sx={sx.menuBox} gap="1rem">
          <Text>Current Dev Date: {devDateLabel}</Text>
          <Select placeholder="Select an open date" onChange={onDateChange}>
            {dateOptions.map((date) => (
              <option value={date.value}>{date.label}</option>
            ))}
          </Select>
          <Divider></Divider>
          <Text>Reports</Text>
          <Select
            placeholder="Select a report to delete"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSelectedReport(e.target.value);
            }}
          >
            {reports.map((report) => (
              <option value={report.id}>{report.name}</option>
            ))}
          </Select>
          <Button onClick={onDeleteReport}>Delete Report</Button>
          <Divider></Divider>
          <Button onClick={onDeleteAllReports}>
            Delete All {reportType} Reports For {state}
          </Button>
        </Stack>
      )}
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
    alignItems: "flex-start",
    height: "45%",
  },
  menuBox: {
    background: "white",
    border: "1px solid grey",
    height: "100%",
    width: "300px",
    padding: "12px",
    borderRadius: "0px 0px 0px 12px",
    boxShadow: "0px 3px 9px rgba(0, 0, 0, 0.1)",
  },
  primaryBtn: {
    width: "40px",
    height: "100px",
    borderRadius: "12px 0px 0px 12px",
  },
};
