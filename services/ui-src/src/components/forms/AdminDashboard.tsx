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
import { MultiselectOptions, MultiSelect } from "./Multiselect";
import closeTag from "assets/icons/close/icon_close_tag.svg";
import { budgetPeriodFilterOptions } from "./../../constants";

const buildStateOptions = () => {
  const stateValues = [];
  for (const [key, value] of Object.entries(StateNames)) {
    stateValues.push({
      label: value,
      value: key,
      checked: false,
    });
  }
  return stateValues;
};

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dropdownValue, setDropdownValue] = useState(
    searchParams.get("budgetPeriod") || "All"
  );
  const [stateSelected, setStateSelected] =
    useState<MultiselectOptions[]>(buildStateOptions());

  //when the page is loaded, we load the reports
  useEffect(() => {
    const reloadReports = (reportType: string) => {
      (async () => {
        setIsLoading(true);
        const result = await getReportByType(reportType);
        setReports(result);
        setIsLoading(false);
      })();
    };

    //we don't have any other report types so defaulting to RHTP
    reloadReports(ReportType.RHTP);

    const savedStates = localStorage.getItem("states");
    if (savedStates !== null) {
      const stateFilter = savedStates.split(",");
      const filteredStates = stateSelected.map((state) => ({
        ...state,
        checked: stateFilter.includes(state.value),
      }));
      setStateSelected(filteredStates);

      setSearchParams({
        budgetPeriod: dropdownValue.toString(),
        states: savedStates,
      });
    }
  }, []);

  //after reports are filtered, we apply the sort
  useEffect(() => {
    sortRows("", SORT_TYPE.DEFAULT);
  }, [filteredReports]);

  // when reports have been loaded or when any filters have been changed
  useEffect(() => {
    const filterBudgetPeriod = searchParams.get("budgetPeriod") || "All";
    const statesTag = searchParams.get("states") || "";

    const states =
      statesTag && statesTag.length > 0 ? statesTag.split(",") : "";

    const filterByBudget =
      filterBudgetPeriod === "All"
        ? reports
        : reports.filter(
            (report) => report.budgetPeriod === parseInt(filterBudgetPeriod)
          );

    const filterByState =
      states === ""
        ? filterByBudget
        : filterByBudget.filter((report) => states.includes(report.state));
    setFilteredReports(filterByState);
  }, [reports, searchParams]);

  const selectedTags = () => {
    return stateSelected.filter((state) => state.checked);
  };

  const handleBudgetPeriodChange = (evt: { target: { value: string } }) => {
    setDropdownValue(evt.target.value);
  };

  const applyFilter = () => {
    const selectedStates = selectedTags()
      .map((state) => state.value)
      .join(",");
    setSearchParams({
      budgetPeriod: dropdownValue.toString(),
      states: selectedStates,
    });

    localStorage.setItem("states", selectedStates);
  };

  const clearFilter = () => {
    const newState = [...stateSelected].map((state) => ({
      ...state,
      checked: false,
    }));
    setStateSelected(newState);
    setDropdownValue("All");

    setFilteredReports(reports);
    setSearchParams();
    localStorage.removeItem("states");
  };

  const removeTag = (tag: string) => {
    const newState = [...stateSelected];
    const stateIndex = newState.findIndex((state) => state.value == tag);
    newState[stateIndex].checked = false;
    setStateSelected(newState);
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
          <Button variant="link" fontWeight="bold">
            Comment/Status
          </Button>
        </HStack>
      );

      return [
        StateNames[report.state],
        report.name,
        report.budgetPeriod,
        formatMonthDayYear(report.lastEdited!),
        report.status,
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
          return answer.status;
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
    setTableRows(buildRows(runSort(filteredReports)));
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
        <Flex gap="spacer3" alignItems="flex-end">
          <MultiSelect
            label="State(s)"
            values={stateSelected}
            onChange={(selected) => {
              setStateSelected(selected);
            }}
          />
          <CmsdsDropdownField
            name="budgetPeriodFilter"
            label="Budget Period"
            value={dropdownValue}
            onChange={handleBudgetPeriodChange}
            options={budgetPeriodFilterOptions}
          />
          <Button onClick={applyFilter} variant="outline">
            Apply
          </Button>
          <Button onClick={clearFilter} variant="link" height="40px">
            Clear Filters
          </Button>
        </Flex>
        {selectedTags().length > 0 && (
          <Flex gap=".75rem" flexWrap="wrap">
            {selectedTags().map((state) => (
              <Button
                variant="tag"
                rightIcon={<Image src={closeTag} />}
                onClick={() => removeTag(state.value)}
                aria-label={`Remove ${state} tag`}
              >
                {state.label}
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
};
