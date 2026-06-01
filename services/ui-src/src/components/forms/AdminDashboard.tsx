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
  const [stateTags, setStateTags] = useState<MultiselectOptions[]>([]);

  const updateStateFilter = (newStates: MultiselectOptions[]) => {
    setStateSelected(newStates);
    const checkedStates = newStates.filter((states) => states.checked);
    setStateTags(checkedStates);

    const statesString = checkedStates.map((state) => state.value).join(",");
    localStorage.setItem("states", statesString);
    setSearchParams({
      budgetPeriod: dropdownValue.toString(),
      states: statesString,
    });
  };
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
  }, []);

  useEffect(() => {
    //if local storage is no null, we want to set params
    const savedStates = localStorage.getItem("states");
    if (savedStates != null) {
      setSearchParams({
        budgetPeriod: dropdownValue.toString(),
        states: savedStates ?? "",
      });

      const statesArr = savedStates.split(",");
      const reloadStateFilter = [...stateSelected].map((state) => ({
        ...state,
        checked: (state.checked = statesArr.includes(state.value)),
      }));
      setStateSelected(reloadStateFilter);
      setStateTags(selectedTags());
    }
    const filters = [
      searchParams.get("budgetPeriod") || "All",
      searchParams.get("states") || "",
    ];

    const stateTags = filters[1].length > 0 ? filters[1].split(",") : undefined;
    const filterByBudget =
      filters[0] === "All"
        ? reports
        : reports.filter(
            (report) => report.budgetPeriod === parseInt(filters[0])
          );

    const filterByState = stateTags
      ? filterByBudget.filter((report) => stateTags.includes(report.state))
      : filterByBudget;

    setFilteredReports(filterByState);
  }, [reports, searchParams]);

  //after reports are filtered, we apply the sort
  useEffect(() => {
    sortRows("", SORT_TYPE.DEFAULT);
  }, [filteredReports]);

  const selectedTags = () => {
    return stateSelected.filter((state) => state.checked);
  };

  const handleBudgetPeriodChange = (evt: { target: { value: string } }) => {
    setDropdownValue(evt.target.value);
  };

  const applyFilter = () => {
    updateStateFilter(stateSelected);
  };

  const clearFilter = () => {
    const newState = [...stateSelected].map((state) => ({
      ...state,
      checked: false,
    }));
    setStateSelected(newState);
    setDropdownValue("All");

    localStorage.removeItem("states");
    setFilteredReports(reports);
    setStateTags([]);
    setSearchParams();
  };

  const removeTag = (tag: string) => {
    const newState = [...stateSelected];
    const stateIndex = newState.findIndex((state) => state.value == tag);
    newState[stateIndex].checked = false;
    updateStateFilter(newState);
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
        <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
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
        {stateTags.length > 0 && (
          <Flex gap=".75rem" flexWrap="wrap">
            {stateTags.map((state) => (
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
  filters: {
    ".ds-c-dropdown__menu-container": {
      zIndex: "1001",
    },
  },
};
