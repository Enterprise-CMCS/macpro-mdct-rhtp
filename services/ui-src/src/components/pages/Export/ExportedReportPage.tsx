import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import {
  Box,
  Center,
  Heading,
  Spinner,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { formatMonthDayYear, useStore } from "utils";
import { Report, ReportPage, ReportPages, StateNames } from "@rhtp/shared";
import { getReportName } from "types";
import { ExportedReportBanner, ExportedReportWrapper } from "components";
import { shouldRender } from "./ExportedReportPageHelpers";

export const ExportedReportPage = () => {
  const { report } = useStore();
  const [renderedReport, setRenderedReport] = useState<React.JSX.Element[]>([]);
  const reportPages = structuredClone(report?.pages);

  useEffect(() => {
    if (!reportPages) return;
    setRenderedReport(renderReportSections(reportPages));
  }, [report]);

  if (!reportPages) return null;

  return (
    <Box>
      <ExportedReportBanner reportName={getReportName(report?.type)} />
      <Box sx={sx.container}>
        {(report && reportPages.length > 0 && (
          <Flex sx={sx.innerContainer} gap="spacer4">
            {/* pdf metadata */}
            <Helmet>
              <title>{reportTitle(report)}</title>
              <meta name="author" content="CMS" />
              <meta
                name="subject"
                content="Rural Health Transformation Program Report"
              />
              <meta name="language" content="English" />
            </Helmet>
            <Box>
              {/* report heading */}
              <Heading as="h1" variant="h1">
                {reportTitle(report)}
              </Heading>
              {/* report details */}
              {reportDetails(report)}
            </Box>
            {/* report submission set up */}
            {reportSubmissionSetUp(report)}
            {/* report sections */}
            {renderedReport}
          </Flex>
        )) || (
          <Center>
            <Spinner size="lg" />
          </Center>
        )}
      </Box>
    </Box>
  );
};

export const reportTitle = (report: Report) => {
  return `${StateNames[report.state]} ${getReportName(report.type)} for: ${
    report.name
  }`;
};

export const reportDetails = (report: Report) => {
  return (
    <Table variant={"reportDetails"}>
      <Thead>
        <Tr>
          <Th>Reporting budget period</Th>
          <Th>Last edited</Th>
          <Th>Edited by</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>{report.budgetPeriod}</Td>
          <Td>{formatMonthDayYear(report.lastEdited!)}</Td>
          <Td>{report.lastEditedBy}</Td>
          <Td>{report.status}</Td>
        </Tr>
      </Tbody>
    </Table>
  );
};

export const reportSubmissionSetUp = (_report: Report) => {
  return null;
};

export const renderReportSections = (reportPages: ReportPages) => {
  reportPages = reportPages.filter(shouldRender);

  const sortedReports = reportPages.reduce(
    (acc: ReportPage[][], curr) => {
      const index = "initiativeNumber" in curr ? 0 : 1;
      acc[index].push(curr);
      return acc;
    },
    [[], []]
  );

  const indexOfInitiative = sortedReports[1].findIndex(
    (report) => report.id === "initiatives"
  );

  for (const init of sortedReports[0]) {
    init.elements = init.elements?.map((element) => ({
      ...element,
      initId: init.id,
    }));
  }

  console.log(sortedReports[1]);

  sortedReports[1].splice(indexOfInitiative + 1, 0, ...sortedReports[0]);

  return sortedReports[1].map((section, idx) => {
    return (
      <Box key={`${section.id}.${idx}`}>
        <Flex flexDirection="column">
          <Heading as="h2" variant="h2">
            {section.title}
          </Heading>
          <ExportedReportWrapper section={section} />
        </Flex>
      </Box>
    );
  });
};

export const sx = {
  container: {
    width: "100%",
    maxWidth: "55.25rem",
    margin: "0 auto",
    paddingY: "spacer6",
    paddingX: "spacer2",
    "h1, h2, h3": {
      marginBottom: "spacer3",
      color: "black",
    },
    h4: {
      color: "black",
    },
    ".performance-rate-header": {
      marginBottom: "spacer2",
      color: "black",
    },
  },
  innerContainer: {
    width: "100%",
    maxWidth: "40rem",
    margin: "auto",
    "@media print": {
      margin: "5rem 0",
    },
    flexDir: "column",
  },
};
