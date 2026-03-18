import {
  Button,
  Hide,
  Show,
  Td,
  Tr,
  VStack,
  Text,
  Divider,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { Table } from "components";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { LiteReport, ReportStatus } from "types";
import {
  formatMonthDayYear,
  releaseReport,
  reportBasePath,
  updateArchivedStatus,
  useStore,
} from "utils";
import { useState, Fragment } from "react";

interface DashboardTableProps {
  reports: LiteReport[];
  unlockModalOnOpenHandler: () => void;
}

interface TableProps extends Omit<
  DashboardTableProps,
  "unlockModalOnOpenHandler"
> {
  tableContent: { caption: string; headRow: string[] };
  showReportSubmissionsColumn: boolean | undefined;
  showAdminControlsColumn: boolean | undefined;
  navigate: NavigateFunction;
  userIsEndUser: boolean | undefined;
  toggleArchived: (rowIndex: number) => void;
  toggleRelease: (rowIndex: number) => void;
  /** Used to store the archive index of the table row */
  archiving: number | undefined;
  /** Used to store the unlock index of the table row */
  unlocking: number | undefined;
}

export const getStatus = (report: LiteReport) => {
  if (
    report.status === ReportStatus.IN_PROGRESS &&
    report.submissionCount >= 1
  ) {
    return "In revision";
  }
  return report.status;
};

export const HorizontalTable = (props: TableProps) => {
  return (
    <Table content={props.tableContent}>
      {props.reports.map((report, idx) => (
        <Tr key={report.id}>
          <Td
            fontWeight={"bold"}
            maxWidth={"14.25rem"}
            fontSize="body_md"
            padding="16px 16px 16px 0"
          >
            {report.name ?? "{Name of form}"}
            {report.copyFromReportId && (
              <Text
                color="gray_dark"
                fontSize="body_sm"
                paddingTop="spacer_half"
              >
                Copied from previous report
              </Text>
            )}
          </Td>
          <Td>{report.year ?? "{Year of form}"}</Td>
          <Td>
            {!!report.lastEdited && formatMonthDayYear(report.lastEdited)}
          </Td>
          <Td>{report.lastEditedBy}</Td>
          <Td>{getStatus(report)}</Td>
          {props.showReportSubmissionsColumn && (
            <Td width="3rem">{report.submissionCount ?? 0}</Td>
          )}
          <Td>
            <Button
              onClick={() => props.navigate(reportBasePath(report))}
              variant="outline"
              width="100%"
              disabled={report.archived}
              aria-label={
                report.status !== ReportStatus.SUBMITTED
                  ? `Edit ${report.name} report`
                  : `View ${report.name} report`
              }
            >
              {props.userIsEndUser && report.status !== ReportStatus.SUBMITTED
                ? "Edit"
                : "View"}
            </Button>
          </Td>
          {props.showAdminControlsColumn && (
            <>
              <td>
                <Button
                  variant="link"
                  fontSize="body_sm"
                  onClick={async () => await props.toggleRelease(idx)}
                  disabled={
                    report.status !== ReportStatus.SUBMITTED ||
                    report.archived ||
                    props.unlocking === idx
                  }
                >
                  {props.unlocking === idx && (
                    <Spinner size="sm" marginRight="spacer_half" />
                  )}
                  Unlock
                </Button>
              </td>
              <td>
                <Button
                  variant="link"
                  fontSize="body_sm"
                  onClick={async () => await props.toggleArchived(idx)}
                  disabled={props.archiving === idx}
                >
                  {props.archiving === idx && (
                    <Spinner size="sm" marginRight="spacer_half" />
                  )}
                  {report.archived ? "Unarchive" : "Archive"}
                </Button>
              </td>
            </>
          )}
        </Tr>
      ))}
    </Table>
  );
};

export const VerticalTable = (props: TableProps) => {
  return (
    <VStack alignItems="start" gap={4}>
      {props.reports.map((report, idx) => (
        <Fragment key={idx}>
          <div>
            <Text variant="gray">Submission name</Text>
            <HStack>
              <Text fontWeight="heading_md" fontSize="heading_md">
                {report.name}
              </Text>
            </HStack>
            {report.copyFromReportId && (
              <HStack>
                <Text color="gray_dark" fontSize="body_sm">
                  Copied from previous report
                </Text>
              </HStack>
            )}
          </div>
          <HStack gap="4rem">
            <div>
              <Text variant="gray">Reporting Year</Text>
              <Text>{report.year}</Text>
            </div>
            <div>
              <Text variant="gray">Last Edited</Text>
              <Text>{formatMonthDayYear(report.lastEdited!)}</Text>
            </div>
            <div>
              <Text variant="gray">Edited By</Text>
              <Text>{report.lastEditedBy}</Text>
            </div>
          </HStack>
          <div>
            <Text variant="gray">Status</Text>
            <Text>{getStatus(report)}</Text>
          </div>
          {props.showReportSubmissionsColumn && (
            <Text>{report.submissionCount ?? 0}</Text>
          )}
          <HStack gap={"6"}>
            <Button
              onClick={() => props.navigate(reportBasePath(report))}
              variant="outline"
              width="100px"
              height="30px"
              fontSize="body_sm"
              disabled={report.archived}
              aria-label={
                report.status !== ReportStatus.SUBMITTED
                  ? "Edit " + report.name + " report"
                  : "View " + report.name + " report"
              }
            >
              {props.userIsEndUser && report.status !== ReportStatus.SUBMITTED
                ? "Edit"
                : "View"}
            </Button>
            {props.showAdminControlsColumn && (
              <>
                <td>
                  <Button
                    variant="link"
                    onClick={async () => await props.toggleRelease(idx)}
                    disabled={
                      report.status !== ReportStatus.SUBMITTED ||
                      report.archived ||
                      props.unlocking === idx
                    }
                  >
                    {props.unlocking === idx && (
                      <Spinner size="sm" marginRight="spacer_half" />
                    )}
                    Unlock
                  </Button>
                </td>
                <td>
                  <Button
                    variant="link"
                    onClick={async () => await props.toggleArchived(idx)}
                    disabled={props.archiving === idx}
                  >
                    {props.archiving === idx && (
                      <Spinner size="sm" marginRight="spacer_half" />
                    )}
                    {report.archived ? "Unarchive" : "Archive"}
                  </Button>
                </td>
              </>
            )}
          </HStack>
          <Divider></Divider>
        </Fragment>
      ))}
    </VStack>
  );
};

export const DashboardTable = ({
  reports,
  unlockModalOnOpenHandler,
}: DashboardTableProps) => {
  const navigate = useNavigate();
  const { userIsAdmin, userIsEndUser } = useStore().user ?? {};
  const [reportsInView, setReportsInView] = useState<LiteReport[]>(reports);

  const [archiving, setArchiving] = useState<number>();
  const [unlocking, setUnlocking] = useState<number>();

  // Translate role to defined behaviors
  const showReportSubmissionsColumn = userIsAdmin;
  const showAdminControlsColumn = userIsAdmin;

  // Build header columns based on defined behaviors per role
  const headers = [
    "Submission name",
    "Reporting Year",
    "Last edited",
    "Edited by",
    "Status",
  ];
  if (showReportSubmissionsColumn) headers.push("#");
  headers.push("Actions");

  const tableContent = {
    caption: "Rural Health Transformation Program Reports",
    headRow: headers,
  };

  const toggleArchived = async (idx: number) => {
    setArchiving(idx);
    const reports = [...reportsInView];
    const report = reports[idx];
    await updateArchivedStatus(report, !report.archived);
    report.archived = !report.archived;
    reports[idx] = report;
    setReportsInView(reports);
    setArchiving(undefined);
  };

  const toggleRelease = async (idx: number) => {
    setUnlocking(idx);
    const reports = [...reportsInView];
    const report = reports[idx];
    await releaseReport(report);
    unlockModalOnOpenHandler();
    report.status = ReportStatus.IN_PROGRESS;
    reports[idx] = report;
    setReportsInView(reports);
    setUnlocking(undefined);
  };

  return (
    <>
      <Hide below="sm">
        {HorizontalTable({
          tableContent,
          reports,
          showReportSubmissionsColumn,
          showAdminControlsColumn,
          navigate,
          userIsEndUser,
          toggleArchived,
          toggleRelease,
          archiving,
          unlocking,
        })}
      </Hide>
      <Show below="sm">
        {VerticalTable({
          tableContent,
          reports,
          showReportSubmissionsColumn,
          showAdminControlsColumn,
          navigate,
          userIsEndUser,
          toggleArchived,
          toggleRelease,
          archiving,
          unlocking,
        })}
      </Show>
    </>
  );
};
