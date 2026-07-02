import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  StateNames,
  isStateAbbr,
  isReportType,
  LiteReport,
  BannerArea,
  isCompleteStatus,
} from "@rhtp/shared";
import { getReportName } from "types";
import {
  PageTemplate,
  DashboardTable,
  CreateReportModal,
  AccordionItem,
  Banner,
} from "components";
import {
  Box,
  Button,
  Image,
  Heading,
  Link,
  Text,
  Flex,
  useDisclosure,
  Accordion,
  Spinner,
} from "@chakra-ui/react";
import { useStore } from "utils";
import arrowLeftIcon from "assets/icons/arrows/icon_arrow_left_blue.png";
import { getReportsForState } from "utils/api/requestMethods/report";
import { Dropdown as CmsdsDropdownField } from "@cmsgov/design-system";
import { DevTools } from "components/devTools/DevTools";
import { activeBannerSelector } from "utils/state/selectors";
import { budgetPeriodFilterOptions } from "./../../../constants";

export const DashboardPage = () => {
  const { reportType, state } = useParams();
  const banner = useStore(activeBannerSelector(reportType as BannerArea));
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<LiteReport[]>([]);
  const [canCreateReport, setCanCreateReport] = useState(false);
  const [filteredReports, setFilteredReports] = useState<LiteReport[]>([]);
  const [budgetPeriodFilter, setBudgetPeriodFilter] = useState("All");

  const fullStateName = isStateAbbr(state) ? StateNames[state] : "";
  const reportName = getReportName(reportType);
  const hasSubmittedReport = reports.some((report) =>
    isCompleteStatus(report.status)
  );

  useEffect(() => {
    if (!isReportType(reportType) || !isStateAbbr(state)) {
      return;
    }
    reloadReports(reportType, state);
  }, [reportType, state]);

  useEffect(() => {
    if (budgetPeriodFilter === "All") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(
        reports.filter(
          (report) => report.budgetPeriod === parseInt(budgetPeriodFilter)
        )
      );
    }
  }, [reports, budgetPeriodFilter]);

  useEffect(() => {
    const noReports = reports.length === 0;
    const allSubmittedReports = reports.every((report) =>
      isCompleteStatus(report.status)
    );
    setCanCreateReport(noReports || allSubmittedReports);
  }, [reports]);

  const reloadReports = (reportType: string, state: string) => {
    (async () => {
      setIsLoading(true);
      const result = await getReportsForState(reportType, state);
      setReports(result);
      setIsLoading(false);
    })();
  };

  // add/edit program modal disclosure
  const {
    isOpen: createReportModalIsOpen,
    onOpen: createReportModalOnOpenHandler,
    onClose: createReportModalOnCloseHandler,
  } = useDisclosure();

  const handleBudgetPeriodChange = (evt: { target: { value: string } }) => {
    setBudgetPeriodFilter(evt.target.value);
  };

  const clearFilter = () => {
    setBudgetPeriodFilter("All");
  };

  return (
    <PageTemplate type="report" sxOverride={sx.layout}>
      <DevTools
        reportType={reportType}
        state={state}
        reloadReports={reloadReports}
        reports={reports}
      />
      <Link as={RouterLink} to="/" variant="return">
        <Image src={arrowLeftIcon} alt="Arrow left" className="icon" />
        Return home
      </Link>
      {banner ? <Banner {...banner} key={banner.key} /> : null}
      <Box sx={sx.leadTextBox}>
        <Heading as="h1" variant="h1">
          {fullStateName} {reportName}
        </Heading>
        <Box marginTop="spacer4">
          Click the <b>“Start {reportName} Report”</b> button to begin creating
          your report. Refer to the reference guide "RHTP_State Reporting
          Expectations_Guide" as needed for additional support. Prior to
          submitting your report confirm all the information is complete and
          accurate.
        </Box>
        <Accordion
          allowToggle={true}
          sx={sx.accordion}
          defaultIndex={[-1]} // sets the accordion to closed by default
        >
          <AccordionItem
            label="Understanding report statuses"
            sx={sx.accordionItem}
          >
            <Box sx={sx.accordionPanel}>
              <ul>
                <li>
                  <strong>Not started:</strong> The report has been created but
                  no data has been entered or actions taken.
                </li>
                <li>
                  <strong>In progress:</strong> The report is actively being
                  worked on, with some or all data entered.
                </li>
                <li>
                  <strong>Submitted:</strong> The report has been completed and
                  submitted to CMS for review.
                </li>
                <li>
                  <strong>In revision:</strong> The report has been sent back to
                  the state for revisions or additional information after
                  submission.
                </li>
              </ul>
            </Box>
          </AccordionItem>
        </Accordion>
      </Box>
      <Flex sx={sx.bodyBox} gap="2rem" flexDirection="column">
        <Flex alignItems="flex-end" gap="spacer3">
          <CmsdsDropdownField
            name="budgetPeriodFilter"
            label="Budget Period"
            value={budgetPeriodFilter}
            onChange={handleBudgetPeriodChange}
            options={budgetPeriodFilterOptions}
          />
          <Button onClick={clearFilter} variant="link" fontWeight="bold">
            Clear Filter
          </Button>
        </Flex>
        {!isLoading && <DashboardTable reports={filteredReports} />}
        {isLoading && (
          <Flex justify="center">
            <Spinner size="md" />
          </Flex>
        )}
        {reports.length === 0 && (
          <Text variant="tableEmpty">
            Keep track of your {reportName} Reports, once you start a report you
            can access it here.
          </Text>
        )}
        <Flex justifyContent="center">
          <Button
            onClick={createReportModalOnOpenHandler}
            type="submit"
            disabled={!canCreateReport}
          >
            {hasSubmittedReport
              ? `Copy ${reportName} Submission`
              : `Start ${reportName} Report`}
          </Button>
        </Flex>
      </Flex>
      <CreateReportModal
        activeState={state!}
        reportType={reportType!}
        modalDisclosure={{
          isOpen: createReportModalIsOpen,
          onClose: createReportModalOnCloseHandler,
        }}
        reportHandler={reloadReports}
      />
    </PageTemplate>
  );
};

const sx = {
  layout: {
    ".contentFlex": {
      maxWidth: "appMax",
      marginTop: "spacer4",
      marginBottom: "spacer7",
    },
  },
  leadTextBox: {
    width: "100%",
    maxWidth: "55.25rem",
    marginTop: "spacer5",
    marginX: "auto",
  },
  bodyBox: {
    maxWidth: "55.25rem",
    margin: "0 auto",
    ".desktop &": {
      width: "100%",
    },
    ".tablet &, .mobile &": {
      margin: "0",
    },
    ".ds-c-spinner": {
      "&:before": {
        borderColor: "black",
      },
      "&:after": {
        borderLeftColor: "black",
      },
    },
    ".ds-c-dropdown__menu-container": {
      zIndex: "1101",
    },
  },
  accordion: {
    marginTop: "spacer4",
    color: "base",
  },
  accordionItem: {
    marginBottom: "spacer3",
  },
  accordionPanel: {
    ".mobile &": {
      paddingTop: "spacer2",
    },
  },
};
