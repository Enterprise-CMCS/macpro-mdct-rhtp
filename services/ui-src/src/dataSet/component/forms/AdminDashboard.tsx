import { JSX, useEffect, useState } from "react";
import {
  Button,
  Heading,
  Flex,
  Spinner,
  Stack,
  HStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { StateDropdownOptions } from "@rhtp/shared";
import { PageTemplate } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import { getFilesByState } from "../api/requestMethods/datasetUploads";
import { downloadFile, removeFile } from "../util/other/fileUtils";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { getDataSets } from "../api/requestMethods/datasets";
import { DropdownOptions } from "types";

export type DataSetType = {
  filename: string;
  fileId: string;
  datasetId: string;
  uploadedUsername: string;
  uploadedDate: string;
};

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DataSetType[]>([]);
  const [_displayValue, _setDisplayValue] = useState<string>();
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const [selectedStates, _setSelectedStates] = useState<string[]>([]);
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  const [_uploadDrawerOpen, _setUploadDrawerOpen] = useState(false);
  const [_editDrawerOpen, setEditDrawerOpen] = useState(false);
  const { state } = useStore().user ?? {};
  const [_selectedFile, setSelectedFile] = useState<DataSetType>();
  const [_dataSetOptions, setDataSetOptions] = useState<DropdownOptions[]>([]);

  const setStatesHandler = (_states: string[]) => {};

  const reloadDataSet = async () => {
    setIsLoading(true);
    const dataSets = await getDataSets();
    setDataSetOptions([
      { label: "- Select an option -", value: "" },
      ...dataSets.map((set) => ({ label: set.name, value: set.key! })),
    ]);
  };

  const reloadFiles = async () => {
    const result = await getFilesByState(state!);
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
    sortRows(lastSorted.sort, lastSorted.type);
  }, [files]);

  const clearFilter = () => {
    setStatesHandler([]);
  };

  const onEditHandler = (file: DataSetType) => {
    setSelectedFile(file);
    setEditDrawerOpen(true);
  };

  const onDeleteHandler = (file: DataSetType) => {
    removeFile(state!, "1234", file.fileId).then(async () => {
      await reloadFiles();
    });
  };

  const buildRows = (data: DataSetType[]) => {
    return data.map((file) => {
      const columnAction = (
        <HStack>
          <Button
            variant="outline"
            onClick={() => downloadFile(file.datasetId, state!, file.fileId)}
          >
            Download
          </Button>
          <Button
            variant="link"
            fontWeight="bold"
            onClick={() => onEditHandler(file)}
          >
            Edit
          </Button>
          <Button
            variant="link"
            fontWeight="bold"
            onClick={() => onDeleteHandler(file)}
            rightIcon={<Image src={cancelIcon} alt="Remove" />}
          ></Button>
        </HStack>
      );

      return [
        file.filename,
        file.datasetId,
        file.uploadedUsername,
        file.uploadedDate,
        columnAction,
      ];
    });
  };

  const sortRows = (row: string, type: SORT_TYPE) => {
    const getValue = (answer: DataSetType, type: string) => {
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

    const runSort = (arr: DataSetType[]) => {
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
    setTableRows(buildRows(runSort(files)));
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
            label="State(s)"
            placeholder="Search states"
            countLabel="States"
            options={StateDropdownOptions}
            values={selectedStates}
            onChange={(selected) => setStatesHandler(selected)}
          />
          <MultiSelect
            label="Filter by Data Set:"
            placeholder="Search data set"
            countLabel="Data Set"
            options={StateDropdownOptions}
            values={selectedStates}
            onChange={(selected) => setStatesHandler(selected)}
          />
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
