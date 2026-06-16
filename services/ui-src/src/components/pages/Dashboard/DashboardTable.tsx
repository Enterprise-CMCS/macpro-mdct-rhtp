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
} from "@chakra-ui/react";
import { Table } from "components";
import { NavigateFunction, useNavigate } from "react-router";
import { LiteReport } from "@rhtp/shared";
import { formatMonthDayYear, reportBasePath, useStore } from "utils";
import { Fragment, useState } from "react";
import { getStatus } from "utils/other/status";
import { ReportCommentDrawer } from "components/drawers/ReportCommentDrawer";

interface DashboardTableProps {
  reports: LiteReport[];
}

interface TableProps extends DashboardTableProps {
  tableContent: { caption: string; headRow: string[] };
  showReportSubmissionsColumn: boolean | undefined;
  showAdminControlsColumn: boolean | undefined;
  navigate: NavigateFunction;
  userIsEndUser: boolean | undefined;
  openCommentsDrawer: Function;
}

export const HorizontalTable = (props: TableProps) => {
  return (
    <Table content={props.tableContent}>
      {props.reports.map((report) => (
        <Tr key={report.id}>
          <Td
            fontWeight={"bold"}
            maxWidth={"14.25rem"}
            fontSize="body_md"
            padding="16px 16px 16px 0"
          >
            {report.name ?? "{Name of form}"}
          </Td>
          <Td>
            {!!report.lastEdited && formatMonthDayYear(report.lastEdited)}
          </Td>
          <Td>{report.lastEditedBy}</Td>
          <Td>{getStatus(report)}</Td>
          {props.showReportSubmissionsColumn && (
            <Td width="3rem">{report.submissionCount ?? 0}</Td>
          )}
          <Td>
            <HStack>
              <Button
                onClick={() => props.navigate(reportBasePath(report))}
                variant="outline"
                aria-label={`View ${report.name} report`}
              >
                View Report
              </Button>
              <Button
                variant="link"
                fontWeight="bold"
                onClick={() => props.openCommentsDrawer(report)}
              >
                Comment
              </Button>
            </HStack>
          </Td>
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
          </div>
          <HStack gap="4rem">
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
              aria-label={`View ${report.name} report`}
            >
              View Report
            </Button>
          </HStack>
          <Divider></Divider>
        </Fragment>
      ))}
    </VStack>
  );
};

export const DashboardTable = ({ reports }: DashboardTableProps) => {
  const navigate = useNavigate();
  const { userIsAdmin, userIsEndUser } = useStore().user ?? {};
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LiteReport>();

  const openCommentsDrawer = (report: LiteReport) => {
    setSelectedReport(report);
    setCommentDrawerOpen(true);
  };

  const closeCommentsDrawer = () => {
    setSelectedReport(undefined);
    setCommentDrawerOpen(false);
  };

  // Translate role to defined behaviors
  const showReportSubmissionsColumn = userIsAdmin;
  const showAdminControlsColumn = userIsAdmin;

  // Build header columns based on defined behaviors per role
  const headers = ["Submission name", "Last edited", "Edited by", "Status"];
  if (showReportSubmissionsColumn) headers.push("#");
  headers.push("Actions");

  const tableContent = {
    caption: "Rural Health Transformation Program Reports",
    headRow: headers,
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
          openCommentsDrawer,
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
          openCommentsDrawer,
        })}
      </Show>
      {selectedReport && (
        <ReportCommentDrawer
          modalDisclosure={{
            isOpen: commentDrawerOpen,
            onClose: closeCommentsDrawer,
          }}
          selectedReport={selectedReport}
        />
      )}
    </>
  );
};
