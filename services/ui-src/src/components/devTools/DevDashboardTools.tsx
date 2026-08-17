import { Button, Select, Text, Divider } from "@chakra-ui/react";
import { LiteReport } from "@rhtp/shared";
import { ChangeEvent, useState } from "react";
import { deleteReport, deleteReportsForState, useStore } from "utils";

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

interface Props {
  reportType: string;
  reports: LiteReport[];
  reloadReports?: Function;
  state?: string;
}

export const DevDashboardTools = ({
  reportType,
  reports,
  reloadReports,
  state,
}: Props) => {
  const { devDate, setDevDate } = useStore();
  const [devDateLabel, setDevDateLabel] = useState<string>(
    devDate ? new Date(parseInt(devDate) ?? 0).toLocaleDateString() : ""
  );

  const [selectedReport, setSelectedReport] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // only state user dashboard specifies a state
  const isStateUser = !!state;

  const onDateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newDate = e.target.value ?? Date.now();
    setDevDate(e.target.value);
    setDevDateLabel(new Date(parseInt(newDate) ?? 0).toLocaleDateString());
  };

  const onDeleteReport = async () => {
    setLoading(true);
    const [state, id] = selectedReport.split("#"); // split value from select option below
    await deleteReport(reportType, state, id);
    if (reloadReports) reloadReports(reportType, state);
    setLoading(false);
  };
  const onDeleteAllReports = async () => {
    setLoading(true);
    if (!state) return;
    await deleteReportsForState(reportType, state);
    if (reloadReports) reloadReports(reportType, state);
    setLoading(false);
  };

  return (
    <>
      {isStateUser && (
        <>
          <Text fontWeight="bold">Current Dev Date: {devDateLabel}</Text>
          <Select
            placeholder="Select an open date"
            onChange={onDateChange}
            aria-label="select an open date"
          >
            {dateOptions.map((date, index) => (
              <option key={`${date.value}-${index}`} value={date.value}>
                {date.label}
              </option>
            ))}
          </Select>
          <Divider />
        </>
      )}
      <Text fontWeight="bold">Delete a Report</Text>
      <Select
        placeholder="Select a report to delete"
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          setSelectedReport(e.target.value);
        }}
        aria-label="select a report to delete"
      >
        {reports.map((report, index) => (
          <option
            key={`${report.name}-${index}`}
            value={`${report.state}#${report.id}`}
          >
            {report.name}
          </option>
        ))}
      </Select>
      <Button onClick={onDeleteReport} disabled={!selectedReport || loading}>
        Delete Report
      </Button>
      {isStateUser && (
        <>
          <Divider />
          <Text fontWeight="bold">Delete all reports</Text>
          <Button onClick={onDeleteAllReports} disabled={loading}>
            Delete All {reportType} Reports For {state}
          </Button>
        </>
      )}
    </>
  );
};
