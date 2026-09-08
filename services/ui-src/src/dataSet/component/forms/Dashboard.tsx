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
import { AlertTypes, StateNames } from "@rhtp/shared";
import { PageTemplate } from "components";
import { ResponsiveTable, SORT_TYPE } from "components/tables/ResponsiveTable";
import { useStore } from "utils";
import { MultiSelect } from "components/forms/Multiselect";
import { UploadDrawer } from "dataSet/component/drawers/UploadDrawer";
import { Dropdown, DropdownChangeObject } from "@cmsgov/design-system";
import {
  DataSetUploadType,
  getFilesByState,
  updateUploadedFile,
} from "../api/requestMethods/datasetUploads";
import { downloadFile, removeFile } from "../util/other/fileUtils";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { EditDrawer } from "../drawers/EditDrawer";
import { getDataSets } from "../api/requestMethods/datasets";
import { DropdownOptions } from "types";

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<DataSetUploadType[]>([]);
  const [tableRows, setTableRows] = useState<
    (string | number | JSX.Element | undefined)[][]
  >([]);
  const [lastSorted, setLastSorted] = useState<{
    sort: string;
    type: SORT_TYPE;
  }>({ sort: "", type: SORT_TYPE.DEFAULT });

  //Filters
  const { state } = useStore().user ?? {};
  const [filterDataSet, setFilterDataSet] = useState<string[]>([]);
  const [displayValue, setDisplayValue] = useState<
    DataSetUploadType | { datasetId: string; fileId?: string }
  >();
  const [dataSetOptions, setDataSetOptions] = useState<DropdownOptions[]>([]);

  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const setDataSetHandler = (dataSet: string[]) => {
    setFilterDataSet(dataSet);
  };
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
    setDataSetHandler([]);
  };

  const onEditHandler = (file: DataSetUploadType) => {
    setDisplayValue(file);
    setEditDrawerOpen(true);
  };

  const onDeleteHandler = (file: DataSetUploadType) => {
    removeFile(state!, file.datasetId, file.fileId).then(async () => {
      await reloadFiles();
    });
  };

  const buildRows = (data: DataSetUploadType[]) => {
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
    setTableRows(buildRows(runSort(files)));
  };

  const setDataSetDropdown = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    setDisplayValue({ ...displayValue, datasetId: event.target.value });
  };

  const getNotification = () => {
    const set = dataSetOptions.find(
      (opt) => opt.value === displayValue?.datasetId
    )?.label;
    const instruction =
      !displayValue || displayValue.fileId === ""
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

  const saveFiles = async () => {
    if (displayValue) {
      await updateUploadedFile(
        state!,
        displayValue.datasetId!,
        displayValue.fileId!
      );
      setEditDrawerOpen(false);
    }
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
          {dataSetOptions.length > 0 && (
            <MultiSelect
              label="Filter by Data Set:"
              placeholder="Search data set"
              countLabel="Data Set"
              options={dataSetOptions}
              values={filterDataSet}
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
            name="associated-data-set"
            onChange={setDataSetDropdown}
            options={dataSetOptions}
            value={displayValue?.datasetId}
          />
        }
        answer={[]}
        saveToReport={saveFiles}
        notification={getNotification()}
        disabled={!displayValue?.datasetId}
        dataSetId={displayValue?.datasetId ?? ""}
      />
      <EditDrawer
        modalDisclosure={{
          isOpen: editDrawerOpen,
          onClose: () => setEditDrawerOpen(false),
        }}
        selections={
          <Dropdown
            label={"Associated data set"}
            name="associated-data-set"
            hint="Updating the data set will reassign this file to that data set."
            onChange={setDataSetDropdown}
            options={dataSetOptions}
            value={displayValue?.datasetId}
          />
        }
        onModalSubmit={saveFiles}
        file={displayValue as DataSetUploadType}
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
