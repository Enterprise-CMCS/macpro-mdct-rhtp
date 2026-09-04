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
import { AlertTypes, StateDropdownOptions, StateNames } from "@rhtp/shared";
import { PageTemplate } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import { UploadDrawer } from "dataSet/component/drawers/UploadDrawer";
import { Dropdown, DropdownChangeObject } from "@cmsgov/design-system";
import { getFilesByState } from "../api/requestMethods/datasetUploads";
import { downloadFile, removeFile } from "../util/other/fileUtils";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { EditDrawer } from "../drawers/EditDrawer";

export type DataSetType = {
  filename: string;
  fileId: string;
  datasetId: string;
  uploadedUsername: string;
  uploadedDate: string;
};

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DataSetType[]>([]);
  const [displayValue, setDisplayValue] = useState<string>();
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const [selectedStates, _setSelectedStates] = useState<string[]>([]);
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const { state } = useStore().user ?? {};
  const [selectedFile, setSelectedFile] = useState<DataSetType>();

  const setStatesHandler = (_states: string[]) => {};

  const reloadFiles = async () => {
    setIsLoading(true);
    const result = await getFilesByState(state!);
    setFiles(
      result.toSorted((a, b) => (b.uploadedDate! < a.uploadedDate! ? -1 : 1))
    );
    sortRows(lastSorted.sort, lastSorted.type);
    setIsLoading(false);
  };

  //when the page is loaded, we load the reports and states assigned to the user
  useEffect(() => {
    //we don't have any other report types so defaulting to RHTP
    reloadFiles();
  }, []);

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

  const dataSetOptions = [
    { label: "- Select an option -", value: "" },
    { label: "data set 1", value: "ds1" },
    { label: "data set 2", value: "ds2" },
    { label: "data set 3", value: "ds3" },
  ];
  const setDropdownValue = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    setDisplayValue(event.target.value);
  };

  const getNotification = () => {
    const set = dataSetOptions.find((opt) => opt.value === displayValue)?.label;
    const instruction =
      !displayValue || displayValue === ""
        ? {
            type: AlertTypes.WARNING,
            text: "Select a data set above to unlock file upload.",
          }
        : {
            type: AlertTypes.INFO,
            text: `Upload files corresponding to ${set}`,
          };

    return {
      instruction: instruction,
      success: `${set}`,
    };
  };

  const saveFiles = () => {
    reloadFiles();
  };

  return (
    <PageTemplate type="report" sxOverride={sx.layout}>
      <Stack sx={sx.box} gap="2rem">
        <Heading as="h1" variant="h1">
          {StateNames[state as keyof typeof StateNames]} File Upload
        </Heading>
        <Text>
          Use this page to upload documents and data requested by CMS. Select
          the relevant data set for each file before uploading.
        </Text>
        <Button onClick={() => setUploadDrawerOpen(true)} maxWidth="156px">
          Upload File(s)
        </Button>
        <Flex gap="spacer3" alignItems="flex-end" sx={sx.filters}>
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
      <UploadDrawer
        modalDisclosure={{
          isOpen: uploadDrawerOpen,
          onClose: () => setUploadDrawerOpen(false),
        }}
        selections={
          <Dropdown
            label={"Select the associated data set for the file(s)."}
            name="status"
            onChange={setDropdownValue}
            options={dataSetOptions}
            value={displayValue}
          />
        }
        answer={[]}
        saveToReport={saveFiles}
        notification={getNotification()}
        disabled={!displayValue}
      />
      <EditDrawer
        modalDisclosure={{
          isOpen: editDrawerOpen,
          onClose: () => setEditDrawerOpen(false),
        }}
        file={selectedFile!}
      />
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
