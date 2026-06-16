import { JSX, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Button,
  Heading,
  Text,
  Flex,
  Accordion,
  Spinner,
  Stack,
  HStack,
  Image,
} from "@chakra-ui/react";
import { Dropdown as CmsdsDropdownField } from "@cmsgov/design-system";
import { Report, ReportType, StateNames } from "@rhtp/shared";
import { PageTemplate, AccordionItem } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { formatMonthDayYear, getReportByType, reportBasePath } from "utils";
import { MultiSelect } from "./Multiselect";
import closeTag from "assets/icons/close/icon_close_tag.svg";
import { budgetPeriodFilterOptions } from "./../../constants";
import { ReportCommentDrawer } from "components/drawers/ReportCommentDrawer";
import { getStatus } from "utils/other/status";

const buildStateOptions = () => {
  const stateValues = [];
  for (const [key, value] of Object.entries(StateNames)) {
    stateValues.push({
      label: value,
      value: key,
    });
  }
  return stateValues;
};

const budgetPeriodValues = [1, 2, 3, 4, 5];
const stateAbbr = Object.keys(StateNames);

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [sortedReports, setSortedReports] = useState<Report[]>([]);
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [budgetValue, setBudgetValue] = useState(
    searchParams.get("budgetPeriod") || "All"
  );
  const [selectedStates, setSelectedStates] = useState<string[]>(
    searchParams.get("states")?.split(",") ?? []
  );
  const states = buildStateOptions();
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report>();

  const reloadReports = async (reportType: string) => {
    setIsLoading(true);
    const result = await getReportByType(reportType);
    //set latest edit report to the top
    setReports(
      result.toSorted((a, b) => (b.lastEdited! < a.lastEdited! ? -1 : 1))
    );
    setIsLoading(false);
  };

  //when the page is loaded, we load the reports
  useEffect(() => {
    //we don't have any other report types so defaulting to RHTP
    reloadReports(ReportType.RHTP);
  }, []);

  useEffect(() => {
    const savingStates = selectedStates.join(",");

    if (selectedStates.length === 0 && budgetValue === "All") {
      setSearchParams();
    } else {
      setSearchParams({
        budgetPeriod: budgetValue.toString(),
        states: savingStates,
      });
    }
  }, [selectedStates, budgetValue]);

  useEffect(() => {
    const paramBudgetPeriod = searchParams.get("budgetPeriod");
    const paramStates = searchParams.get("states");

    const filterBudgetPeriod =
      paramBudgetPeriod == null || paramBudgetPeriod == "All"
        ? budgetPeriodValues
        : [parseInt(paramBudgetPeriod)];

    const filterStates =
      paramStates == null || paramStates == ""
        ? stateAbbr
        : paramStates.split(",");

    const filtered = reports.filter(
      (report) =>
        filterBudgetPeriod.includes(report.budgetPeriod) &&
        filterStates.includes(report.state)
    );

    setSortedReports(filtered);
  }, [reports, searchParams]);

  //after reports are filtered, we apply the last saved sort
  useEffect(() => {
    sortRows(lastSorted.sort, lastSorted.type);
  }, [sortedReports]);

  const handleBudgetPeriodChange = (evt: { target: { value: string } }) => {
    setBudgetValue(evt.target.value);
  };

  const clearFilter = () => {
    setSelectedStates([]);
    setBudgetValue("All");
    setSortedReports(reports);
  };

  const tagLabel = (id: string) => {
    return StateNames[id as keyof typeof StateNames];
  };

  const removeTag = (deleteTag: string) => {
    const remainingTags = selectedStates.filter((tag) => tag != deleteTag);
    setSelectedStates(remainingTags);
    setSearchParams({
      budgetPeriod: budgetValue.toString(),
      states: remainingTags.join(","),
    });
  };

  const openCommentsDrawer = (report: Report) => {
    setSelectedReport(report);
    setCommentDrawerOpen(true);
  };

  const closeCommentsDrawer = () => {
    setSelectedReport(undefined);
    setCommentDrawerOpen(false);
    reloadReports(ReportType.RHTP);
  };

  const buildRows = (reports: Report[]) => {
    return reports.map((report) => {
      const columnAction = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => navigate(reportBasePath(report))}
          >
            View Report
          </Button>
          <Button
            variant="link"
            fontWeight="bold"
            onClick={() => openCommentsDrawer(report)}
          >
            Comment/Status
          </Button>
        </HStack>
      );

      return [
        StateNames[report.state],
        report.name,
        report.budgetPeriod,
        formatMonthDayYear(report.lastEdited!),
        getStatus(report),
        report.submissionCount,
        columnAction,
      ];
    });
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: Report, type: string) => {
      switch (type) {
        case "State/Territory":
          return answer.state;
        case "Report Name":
          return answer.name;
        case "Budget Period":
          return answer.budgetPeriod;
        case "Last Edited":
          return answer.lastEdited!;
        case "Status":
          return getStatus(answer);
        default:
          return "";
      }
    };

    const runSort = (arr: Report[]) => {
      return type == SORT_TYPE.DEFAULT
        ? arr
        : arr.toSorted((a, b) => {
            const valueA = getValue(a, row);
            const valueB = getValue(b, row);
            if (type === SORT_TYPE.DESCENDING) {
              return valueA < valueB ? -1 : 1;
            } else {
              return valueB < valueA ? -1 : 1;
            }
          });
    };
    setLastSorted({ sort: row, type: type });
    setTableRows(buildRows(runSort(sortedReports)));
  };

  return (
    <PageTemplate type="report" sxOverride={sx.layout}>
      <Stack sx={sx.box} gap="2rem">
        <Heading as="h1" variant="h1">
          Admin Dashboard
        </Heading>
        <Text>
          Instructions go here that need to be seen at all times. Provide
          details and context to help the user complete this page.
        </Text>
        <Accordion
          allowToggle={true}
          defaultIndex={[-1]} // sets the accordion to closed by default
        >
          <AccordionItem label="Instructions">[Needs content]</AccordionItem>
        </Accordion>
        <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
          <MultiSelect
            label="State(s)"
            placeholder="Search states"
            countLabel="States"
            options={states}
            values={selectedStates}
            onChange={(selected) => {
              setSelectedStates(selected);
            }}
          />
          <CmsdsDropdownField
            name="budgetPeriodFilter"
            label="Budget Period"
            value={budgetValue}
            onChange={handleBudgetPeriodChange}
            options={budgetPeriodFilterOptions}
          />
          <Button
            onClick={clearFilter}
            variant="link"
            height="40px"
            aria-label="Clear All Filters"
          >
            Clear Filters
          </Button>
        </Flex>
        <Text>
          [placeholder text for letting users know that filters auto apply]
        </Text>
        {selectedStates.length > 0 && (
          <Flex gap=".75rem" flexWrap="wrap">
            {selectedStates.map((tag) => (
              <Button
                key={tag}
                variant="tag"
                rightIcon={<Image src={closeTag} />}
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tagLabel(tag)} tag`}
              >
                {tagLabel(tag)}
              </Button>
            ))}
          </Flex>
        )}
        {isLoading ? (
          <Flex justify="center">
            <Spinner size="md" />
          </Flex>
        ) : (
          ResponsiveTable(
            [
              { label: "State/Territory", sortable: true },
              { label: "Report Name", sortable: true },
              { label: "Budget Period", sortable: true },
              { label: "Last Edited", sortable: true },
              { label: "Status", sortable: true },
              { label: "#" },
              { label: "Actions" },
            ],
            tableRows,
            "",
            sortRows
          )
        )}
      </Stack>
      {selectedReport && (
        <ReportCommentDrawer
          modalDisclosure={{
            isOpen: commentDrawerOpen,
            onClose: closeCommentsDrawer,
          }}
          selectedReport={selectedReport}
        />
      )}
    </PageTemplate>
  );
};

const sx = {
  layout: {
    ".contentFlex": {
      maxWidth: "appMax",
      marginTop: "spacer7",
      marginBottom: "100px",
      alignItems: "center",
    },
  },
  box: {
    maxWidth: "55.25rem",
  },
  filters: {
    ".ds-c-dropdown__menu-container": {
      zIndex: "1001",
    },
  },
};
