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
import arrowLeftIcon from "assets/icons/arrows/icon_arrow_left_blue.svg";
import { getReportsForState } from "utils/api/requestMethods/report";
import { Dropdown as CmsdsDropdownField } from "@cmsgov/design-system";
import { DevTools, ToolType } from "components/devTools/DevTools";
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
        type={ToolType.DASHBOARD}
      />
      <Link as={RouterLink} to="/" variant="return">
        <Image src={arrowLeftIcon} alt="" className="icon" />
        Return home
      </Link>
      {banner ? <Banner {...banner} key={banner.key} /> : null}
      <Box sx={sx.leadTextBox}>
        <Heading as="h1" variant="h1">
          {fullStateName} {reportName}
        </Heading>
        <Flex marginTop="spacer4" gap={"1rem"} direction={"column"}>
          <Text>
            Click the <b>“Start {reportName} Report”</b> button to begin
            creating your report.
          </Text>
          <Text>
            Your work is securely auto-saved in real-time as you type.
          </Text>
          <Text>
            Need step-by-step reporting parameters? Check the "Get Help" page in
            the top right-hand corner with a link to the Comprehensive RHTP
            Field & Guidance Guide.
          </Text>
        </Flex>
        <Accordion
          allowToggle={true}
          sx={sx.accordion}
          defaultIndex={[-1]} // sets the accordion to closed by default
        >
          <AccordionItem
            label="Understanding Report Status and Email Notification"
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
                <li>
                  <strong>Accepted:</strong> The report has been submitted and
                  accepted by CMS after review.
                </li>
              </ul>
              <p>
                The RHTP application automatically triggers email notifications
                to your state team for these key milestones:
              </p>
              <ul>
                <li>
                  <strong>When You Submit a Report:</strong> The moment your
                  state team hits finalize, an immediate automated confirmation
                  email is sent to your point-of-contact roster. This serves as
                  your digital receipt and proof of timely completion.
                </li>
                <li>
                  <strong>When a Project Officer Leaves a Comment:</strong> If
                  your CMS Project Officer drops an edit flag or a direct
                  request on an initiative attachment, the platform instantly
                  emails you an alert with details on what attachment needs
                  attention.
                </li>
                <li>
                  <strong>
                    When a Report Status is "Unlocked for Revision":
                  </strong>{" "}
                  If your initial submission requires adjustments, CMS will
                  unlock the document. An automated notification will detail the
                  necessary changes and grant you immediate data entry access
                  again.
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
            label="Filter by Budget Period"
            value={budgetPeriodFilter}
            onChange={handleBudgetPeriodChange}
            options={budgetPeriodFilterOptions}
          />
          <Button
            onClick={clearFilter}
            variant="link"
            fontWeight="bold"
            height="40px"
          >
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
