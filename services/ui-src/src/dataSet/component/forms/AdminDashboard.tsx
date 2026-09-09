import { JSX, useEffect, useState } from "react";
import { Button, Heading, Flex, Spinner, Stack, Text } from "@chakra-ui/react";
import { StateDropdownOptions } from "@rhtp/shared";
import { PageTemplate } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import {
  DataSetUploadType,
  getFiles,
} from "../api/requestMethods/datasetUploads";
import { downloadFile } from "../util/other/fileUtils";
import { getDataSets } from "../api/requestMethods/datasets";
import { DropdownOptions } from "types";

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DataSetUploadType[]>([]);
  const [sortedFiles, setSortedFiles] = useState<DataSetUploadType[]>([]);
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDataSets, setSelectedDataSets] = useState<string[]>([]);
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  const { state } = useStore().user ?? {};
  const [dataSetOptions, setDataSetOptions] = useState<DropdownOptions[]>([]);

  const setStatesHandler = (states: string[]) => {
    setSelectedStates(states);
  };

  const setDataSetHandler = (dataSet: string[]) => {
    setSelectedDataSets(dataSet);
  };

  const reloadDataSet = async () => {
    setIsLoading(true);
    const dataSets = await getDataSets();
    setDataSetOptions(
      dataSets.map((set) => ({ label: set.name, value: set.key! }))
    );
  };

  const reloadFiles = async () => {
    const result = await getFiles();
    setFiles(
      result.toSorted((a, b) => (b.uploadedDate! < a.uploadedDate! ? -1 : 1))
    );
    setIsLoading(false);
  };

  useEffect(() => {
    reloadDataSet();
    reloadFiles();
  }, []);

  useEffect(() => {
    if (selectedDataSets.length > 0) {
      setSortedFiles(
        files.filter((file) => selectedDataSets.includes(file.datasetId))
      );
    } else setSortedFiles(files);
  }, [files, selectedDataSets]);

  useEffect(() => {
    sortRows(lastSorted.sort, lastSorted.type);
  }, [sortedFiles]);

  const clearFilter = () => {
    setStatesHandler([]);
    setDataSetHandler([]);
  };

  const buildRows = (data: DataSetUploadType[]) => {
    return data.map((file) => {
      const columnAction = (
        <Button
          variant="outline"
          onClick={() => downloadFile(file.datasetId, state!, file.fileId)}
        >
          Download
        </Button>
      );

      return [
        "state",
        file.filename,
        dataSetOptions.find((opt) => opt.value === file.datasetId)?.label,
        file.uploadedUsername,
        file.uploadedDate,
        columnAction,
      ];
    });
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: DataSetUploadType, type: string) => {
      switch (type) {
        case "File name":
          return answer.filename;
        case "Data Set":
          return answer.datasetId;
        case "Uploaded By":
          return answer.uploadedUsername;
        case "Upload Date":
          return answer.uploadedDate!;
        default:
          return "";
      }
    };

    const runSort = (arr: DataSetUploadType[]) => {
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
    setTableRows(buildRows(runSort(sortedFiles)));
  };

  return (
    <PageTemplate type="report" sxOverride={sx.layout}>
      <Stack sx={sx.box} gap="2rem">
        <Heading as="h1" variant="h1">
          File Upload Admin Dashboard
        </Heading>
        <Text>
          Use this page to upload documents and data requested by CMS. Select
          the relevant data set for each file before uploading.
        </Text>
        <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
          <MultiSelect
            label="Filter by State(s)"
            placeholder="Search states"
            countLabel="States"
            options={StateDropdownOptions}
            values={selectedStates}
            onChange={(selected) => setStatesHandler(selected)}
          />
          {dataSetOptions.length > 0 && (
            <MultiSelect
              label="Filter by Data Set:"
              placeholder="Search data set"
              countLabel="Data Set"
              options={dataSetOptions}
              values={selectedDataSets}
              onChange={(selected) => setDataSetHandler(selected)}
            />
          )}
          <Button
            onClick={clearFilter}
            variant="link"
            height="40px"
            fontWeight="bold"
            aria-label="Clear All Filters"
          >
            Clear Filters
          </Button>
        </Flex>
        {isLoading ? (
          <Flex justify="center">
            <Spinner size="md" />
          </Flex>
        ) : (
          ResponsiveTable(
            [
              { label: "State/Territory", sortable: true },
              { label: "File name", sortable: true },
              { label: "Data Set", sortable: true },
              { label: "Uploaded By", sortable: true },
              { label: "Upload Date", sortable: true },
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
  accordionPanel: {
    ".mobile &": {
      paddingTop: "spacer2",
    },
  },
};
