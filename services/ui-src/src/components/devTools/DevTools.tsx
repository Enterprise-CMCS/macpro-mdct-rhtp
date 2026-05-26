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
  { label: "9/30/2026", value: "1790740800000" },
  { label: "12/29/2026", value: "1798520400000" },
  { label: "4/1/2027", value: "1806552000000" },
  { label: "6/30/2027", value: "1814328000000" },
  { label: "9/30/2027", value: "1822276800000" },
  { label: "12/29/2027", value: "1830056400000" },
  { label: "3/29/2028", value: "1837915200000" },
  { label: "6/30/2028", value: "1845950400000" },
  { label: "9/30/2028", value: "1853899200000" },
  { label: "12/29/2028", value: "1861678800000" },
  { label: "4/1/2029", value: "1869710400000" },
  { label: "6/30/2029", value: "1877486400000" },
  { label: "9/30/2029", value: "1885435200000" },
  { label: "12/29/2029", value: "1893214800000" },
  { label: "4/1/2030", value: "1901246400000" },
  { label: "6/30/2030", value: "1909022400000" },
  { label: "9/30/2030", value: "1916971200000" },
  { label: "12/29/2031", value: "1956286800000" },
];

export const DevTools = ({
  reportType,
  state,
  reloadReports,
  reports,
}: Props) => {
  const devTools = useFlags()?.devTools;
  if (!devTools || !reportType || !state) return;

  const { devDate, setDevDate } = useStore();
  const [devDateLabel, setDevDateLabel] = useState<string>(
    devDate ? new Date(parseInt(devDate) ?? 0).toLocaleDateString() : ""
  );
  const [showOptions, setShowOptions] = useState<boolean>();
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [loading, setLoading] = useState<boolean>();

  const onDateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value ?? Date.now();
    setDevDate(e.target.value);
    setDevDateLabel(new Date(parseInt(newDate) ?? 0).toLocaleDateString());
  };

  const onDeleteReport = async () => {
    setLoading(true);
    await deleteReport(reportType, state, selectedReport);
    reloadReports(reportType, state);
    setLoading(false);
  };
  const onDeleteAllReports = async () => {
    setLoading(true);
    await deleteReportsForState(reportType, state);
    reloadReports(reportType, state);
    setLoading(false);
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
          <Text fontWeight="bold">Current Dev Date: {devDateLabel}</Text>
          <Select
            placeholder="Select an open date"
            onChange={onDateChange}
            aria-label="select an open date"
          >
            {dateOptions.map((date) => (
              <option value={date.value}>{date.label}</option>
            ))}
          </Select>
          <Divider></Divider>
          <Text fontWeight="bold">Delete a Report</Text>
          <Select
            placeholder="Select a report to delete"
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSelectedReport(e.target.value);
            }}
            aria-label="select a report to delete"
          >
            {reports.map((report) => (
              <option value={report.id}>{report.name}</option>
            ))}
          </Select>
          <Button
            onClick={onDeleteReport}
            disabled={!selectedReport || loading}
          >
            Delete Report
          </Button>
          <Divider></Divider>
          <Text fontWeight="bold">Delete all reports</Text>
          <Button onClick={onDeleteAllReports} disabled={loading}>
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
    height: "404px",
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
