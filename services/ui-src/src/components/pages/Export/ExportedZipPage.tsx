import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Dropdown } from "@cmsgov/design-system";
import { PageTemplate } from "components/layout/PageTemplate";
import { Modal } from "components/modals/Modal";
import { useEffect, useState } from "react";
import {
  dropdownEmptyOption,
  StateDropdownOptions,
} from "../../../../../shared/src/utils/constants";
import { MultiSelect } from "components/forms/Multiselect";
import { RhtpSubTypeMap, ZipRequestTypes } from "@rhtp/shared";
import { getZipFile } from "utils/other/fileUtils";

const ExportCard = (title: string, desc: string, onClick: () => void) => {
  return (
    <Card
      boxShadow="0px 3px 9px rgba(0, 0, 0, 0.2)"
      paddingBottom="spacer3 !important"
    >
      <HStack justifyContent="space-between" padding="1.50rem">
        <Stack>
          <Text fontWeight="bold">{title}</Text>
          <Text>{desc}</Text>
        </Stack>
        <Button variant="outline" onClick={onClick}>
          Export
        </Button>
      </HStack>
    </Card>
  );
};

export const ExportedZipPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    heading: string;
    subheading?: string;
    actionButtonText: string;
    closeButtonText?: string;
  }>({ heading: "", actionButtonText: "Export", closeButtonText: "Cancel" });
  const [view, setView] = useState<"STATE" | "REPORTS" | undefined>();

  const [selectedState, setSelectedState] = useState<string>();
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const buildReportOptions = () => {
    const subType = Object.entries(RhtpSubTypeMap)
      .filter((item) => item[1].openDate < Date.now())
      .map((item) => ({ label: item[1].name, value: item[0] }));

    return [{ label: "All", value: "all" }, ...subType];
  };

  //using all states of now until we get a report lite route
  const stateOptions = [dropdownEmptyOption, ...StateDropdownOptions];
  const reportOptions = buildReportOptions();

  useEffect(() => {
    setSelectedState("");
    setSelectedReports([]);
  }, [modalOpen]);

  const onStateChange = (evt: { target: { value: string } }) => {
    const newState = evt.target.value;

    setSelectedState(newState);
    setSelectedReports([]);
  };

  const onReportChange = (selected: string[]) => {
    if (!selectedReports.includes("all") && selected.includes("all")) {
      //if user selected all and it previously wasn't selected, set all checkboxes to selected
      setSelectedReports(reportOptions.map((option) => option.value));
    } else if (selectedReports.includes("all") && !selected.includes("all")) {
      //if all was selected and now is deselected, remove all checkboxes
      setSelectedReports([]);
    } else if (
      selected.length === reportOptions.length - 1 &&
      !selected.includes("all")
    ) {
      //if user selects all the selections, auto select all
      setSelectedReports(["all", ...selected]);
    } else if (selected.length < reportOptions.length + 1) {
      //if user deselects a state and all is selected, it will be remove
      setSelectedReports(selected.filter((selection) => selection !== "all"));
    } else {
      setSelectedReports(selected);
    }
  };

  const setExportData = (view: "STATE" | "REPORTS") => {
    switch (view) {
      case "REPORTS":
        setModalData({
          ...modalData,
          heading: "Use of Funds: By Reports (includes All States)",
          subheading:
            "Report includes all states. Select one or many reports to include in the download.",
        });
        break;
      case "STATE":
        setModalData({
          ...modalData,
          heading: "Use of Funds: By State and Report(s) Export",
          subheading:
            "Select one State and one or many reports to include in the download.",
        });
        break;
    }
    setView(view);
    setModalOpen(true);
  };

  const onExport = async () => {
    setIsExporting(true);

    const reports = selectedReports.filter((report) => report !== "all");
    const body = {
      type: ZipRequestTypes.USE_OF_FUNDS,
      state: selectedState,
      reportSubTypeKeys: reports,
    };
    await getZipFile(body);

    setIsExporting(false);
    setModalOpen(false);
  };

  const isReportSelectDisabled = () => {
    return view === "STATE" && selectedState === "";
  };

  const isExportSubmitDisabled = () => {
    return isReportSelectDisabled() || selectedReports.length === 0;
  };

  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" variant="h1" tabIndex={-1}>
          Export RHTP Files and Data
        </Heading>
        <Text>
          Instructions go here that need to be seen at all times. Provide
          details and context to help the user complete this page.
        </Text>
      </Box>
      <Flex flexDirection="column" gap="spacer4">
        {ExportCard(
          "Use of Funds: By Reports (includes All States)",
          "{Details about what is included in the export}",
          () => setExportData("REPORTS")
        )}
        {ExportCard(
          "Use of Funds: By State and Report(s)",
          "{Details about what is included in the export}",
          () => setExportData("STATE")
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
        submitting={isExporting}
        disableConfirm={isExportSubmitDisabled()}
      >
        <Stack gap="1.5rem" sx={sx.override}>
          {view === "STATE" && (
            <Dropdown
              label="State"
              name="state"
              onChange={onStateChange}
              options={stateOptions}
              value={selectedState}
            ></Dropdown>
          )}
          <MultiSelect
            label="Report(s)"
            onChange={(selected) => onReportChange(selected)}
            options={reportOptions}
            values={selectedReports}
            placeholder={"- Select an option -"}
            countLabel={"Reports"}
            disabled={isReportSelectDisabled()}
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
