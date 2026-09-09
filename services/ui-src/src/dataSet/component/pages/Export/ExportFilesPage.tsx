import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { Dropdown } from "@cmsgov/design-system";
import { PageTemplate } from "components/layout/PageTemplate";
import { Modal } from "components/modals/Modal";
import { useEffect, useState } from "react";
import {
  dropdownEmptyOption,
  StateDropdownOptions,
} from "../../../../../../shared/src/utils/constants";
import { MultiSelect } from "components/forms/Multiselect";
import { RhtpSubTypeMap, ZipRequestTypes } from "@rhtp/shared";
import { getZipFile } from "utils/other/fileUtils";

const ExportCard = (
  title: string,
  desc: string,
  onClick: () => void,
  isZipLoading: boolean
) => {
  return (
    <Card
      boxShadow="0px 3px 9px rgba(0, 0, 0, 0.2)"
      paddingBottom="spacer3 !important"
    >
      <HStack justifyContent="space-between" padding="1.50rem">
        <Stack>
          <Text fontWeight="bold">{title}</Text>
          <Text maxWidth={"36rem"}>{desc}</Text>
        </Stack>
        <Button variant="outline" onClick={onClick} disabled={isZipLoading}>
          {isZipLoading && (
            <Flex justify="center">
              <Spinner size="md" marginRight="spacer2" />
            </Flex>
          )}
          Export
        </Button>
      </HStack>
    </Card>
  );
};

export const ExportFilesPage = () => {
  const [isStateExporting, setIsStateExporting] = useState(false);
  const [isReportsExporting, setIsReportsExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    heading: string;
    subheading?: string;
    actionButtonText: string;
    closeButtonText?: string;
  }>({ heading: "", actionButtonText: "Export", closeButtonText: "Cancel" });
  const [view, setView] = useState<"STATE" | "DATASET" | undefined>();

  const [selectedState, setSelectedState] = useState<string>();
  const [selectedDataSets, setSelectedDataSets] = useState<string[]>([]);

  const buildReportOptions = () => {
    const subType = Object.entries(RhtpSubTypeMap)
      .filter((item) => item[1].openDate < Date.now())
      .map((item) => ({ label: item[1].name, value: item[0] }));

    return [{ label: "All", value: "all" }, ...subType];
  };

  //using all states of now until we get a report lite route
  const stateOptions = [dropdownEmptyOption, ...StateDropdownOptions];
  const dataSetOptions = buildReportOptions();

  useEffect(() => {
    setSelectedState("");
    setSelectedDataSets([]);
  }, [modalOpen]);

  const onStateChange = (evt: { target: { value: string } }) => {
    const newState = evt.target.value;

    setSelectedState(newState);
    setSelectedDataSets([]);
  };

  const onDataSetChange = (selected: string[]) => {
    if (!selectedDataSets.includes("all") && selected.includes("all")) {
      //if user selected all and it previously wasn't selected, set all checkboxes to selected
      setSelectedDataSets(dataSetOptions.map((option) => option.value));
    } else if (selectedDataSets.includes("all") && !selected.includes("all")) {
      //if all was selected and now is deselected, remove all checkboxes
      setSelectedDataSets([]);
    } else if (
      selected.length === dataSetOptions.length - 1 &&
      !selected.includes("all")
    ) {
      //if user selects all the selections, auto select all
      setSelectedDataSets(["all", ...selected]);
    } else if (selected.length < dataSetOptions.length + 1) {
      //if user deselects a state and all is selected, it will be remove
      setSelectedDataSets(selected.filter((selection) => selection !== "all"));
    } else {
      setSelectedDataSets(selected);
    }
  };

  const setExportData = (view: "STATE" | "DATASET") => {
    switch (view) {
      case "DATASET":
        setModalData({
          ...modalData,
          heading: "Export by Data Set (All States)",
          subheading:
            "Select a data set to download submissions from all participating states.",
        });
        break;
      case "STATE":
        setModalData({
          ...modalData,
          heading: "Export by State and Data Set",
          subheading:
            "Select a state and a data set to download the corresponding submissions.",
        });
        break;
    }
    setView(view);
    setModalOpen(true);
  };

  const onExport = async () => {
    if (view === "STATE") {
      setIsStateExporting(true);
    } else if (view === "DATASET") {
      setIsReportsExporting(true);
    }
    setModalOpen(false);

    const reports = selectedDataSets.filter((report) => report !== "all");
    const body = {
      type: ZipRequestTypes.OBLIGATED_AND_SPENT_FUNDS,
      state: selectedState,
      reportSubTypeKeys: reports,
    };
    await getZipFile(body);

    if (view === "STATE") {
      setIsStateExporting(false);
    } else if (view === "DATASET") {
      setIsReportsExporting(false);
    }
  };

  const isDataSetSelectDisabled = () => {
    return view === "STATE" && selectedState === "";
  };

  const isExportSubmitDisabled = () => {
    return isDataSetSelectDisabled() || selectedDataSets.length === 0;
  };

  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" variant="h1" tabIndex={-1}>
          Export Files
        </Heading>
        <Text paddingTop={"1rem"}>
          Select an export type below. Requested files will be bundled and
          downloaded as a compressed ZIP file.
        </Text>
      </Box>
      <Flex flexDirection="column" gap="spacer4">
        {ExportCard(
          "By Data Set (All States)",
          "Bulk export submitted files from all participating states for a single data set request.",
          () => setExportData("DATASET"),
          isReportsExporting
        )}
        {ExportCard(
          "By State and Data Set",
          "Export all submitted files for a single state filtered by a specific data set request.",
          () => setExportData("STATE"),
          isStateExporting
        )}
      </Flex>
      <Modal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        content={modalData}
        onConfirmHandler={onExport}
        disableConfirm={isExportSubmitDisabled()}
      >
        <Stack gap="1.5rem" sx={sx.override}>
          <div>
            <p>
              Once the download starts, you can safely navigate away from this
              page; it will continue running in the background. If this export
              contains large files, the download time will vary depending on
              your internet speed.
            </p>
            <br />
            <p>Do not refresh your browser until the download is complete.</p>
          </div>
          {view === "STATE" && (
            <Dropdown
              label="Select a State"
              name="state"
              onChange={onStateChange}
              options={stateOptions}
              value={selectedState}
            ></Dropdown>
          )}
          <MultiSelect
            label="Select a Data Set"
            onChange={(selected) => onDataSetChange(selected)}
            options={dataSetOptions}
            values={selectedDataSets}
            placeholder={"- Select an option -"}
            countLabel={"DataSet"}
            disabled={isDataSetSelectDisabled()}
          ></MultiSelect>
        </Stack>
      </Modal>
    </PageTemplate>
  );
};

const sx = {
  override: {
    ".ds-c-dropdown": {
      zIndex: "10002",
    },
  },
};
