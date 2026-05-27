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
  VStack,
  Image,
} from "@chakra-ui/react";
import { Dropdown as CmsdsDropdownField } from "@cmsgov/design-system";
import { Report, StateNames } from "@rhtp/shared";
import { PageTemplate, AccordionItem } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { formatMonthDayYear, getReportByType, reportBasePath } from "utils";
import { MultiSelect } from "./Multiselect";
import closeTag from "assets/icons/close/icon_close_tag.svg";

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
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dropdownValue, setDropdownValue] = useState(
    searchParams.get("budgetPeriod") || "All"
  );
  const [stateSelected, setStateSelected] =
    useState<
      {
        label: string;
        value: string;
        checked?: boolean;
      }[]
    >(buildStateOptions());

  const reloadReports = (reportType: string) => {
    (async () => {
      setIsLoading(true);
      const result = await getReportByType(reportType);
      setReports(result);
      setIsLoading(false);
      sortRows("", SORT_TYPE.DEFAULT);
    })();
  };

  useEffect(() => {
    reloadReports("RHTP");
  }, []);

  const filterBudgetPeriod = searchParams.get("budgetPeriod") || "All";
  const filterDropdownOptions = [
    { label: "All", value: "All" },
    { label: "Budget Period 1", value: 1 },
    { label: "Budget Period 2", value: 2 },
    { label: "Budget Period 3", value: 3 },
    { label: "Budget Period 4", value: 4 },
    { label: "Budget Period 5", value: 5 },
  ];

  useEffect(() => {
    if (filterBudgetPeriod === "All") {
      //placeholder
    } else {
      //placeholder
    }
  }, [filterBudgetPeriod]);

  const handleBudgetPeriodChange = (evt: { target: { value: string } }) => {
    setDropdownValue(evt.target.value);
  };

  const handleFilter = () => {
    setSearchParams({
      budgetPeriod: dropdownValue.toString(),
    });
  };

  const handleStateFilter = (
    selected: { label: string; value: string; checked?: boolean }[]
  ) => {
    setStateSelected(selected);
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
        <VStack>
          <Button
            variant="outline"
            onClick={() => navigate(reportBasePath(report))}
          >
            View Report
          </Button>
          <Button variant="link">Comment/Status</Button>
        </VStack>
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
    setTableRows(buildRows(runSort(reports)));
  };

  return (
    <PageTemplate type="report" sxOverride={sx.layout}>
      <Stack gap="2rem" width="100%">
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
      </Stack>
      <Flex alignItems="flex-end" gap="spacer3">
        <MultiSelect
          label="State(s)"
          values={stateSelected}
          onChange={handleStateFilter}
        />
        <CmsdsDropdownField
          name="budgetPeriodFilter"
          label="Budget Period"
          value={dropdownValue}
          onChange={handleBudgetPeriodChange}
          options={filterDropdownOptions}
        />
        <Button onClick={handleFilter} variant="outline">
          Apply
        </Button>
        <Button onClick={handleFilter} variant="link">
          Clear Filters
        </Button>
      </Flex>
      <Flex gap=".75rem">
        {stateSelected
          .filter((state) => state.checked)
          .map((state) => (
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
      {ResponsiveTable(
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
      )}
      {isLoading && (
        <Flex justify="center">
          <Spinner size="md" />
        </Flex>
      )}
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
};
