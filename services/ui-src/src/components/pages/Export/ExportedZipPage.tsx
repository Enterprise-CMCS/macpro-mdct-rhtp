import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Dropdown } from "@cmsgov/design-system";
import { PageTemplate } from "components/layout/PageTemplate";
import { Modal } from "components/modals/Modal";
import { useEffect, useState } from "react";
import {
  dropdownEmptyOption,
  StateNames,
} from "../../../../../shared/src/utils/constants";
import { MultiSelect } from "components/forms/Multiselect";
import { ElementType, Report, ReportType, UploadListProp } from "@rhtp/shared";
import { getReportByType } from "utils";
import { getZipFile } from "utils/state/reportLogic/reportActions";
import { DropdownOptions } from "types";

type ZipMetadata = {
  name: string;
  id: string;
  state: string;
  file?: UploadListProp;
};

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

const buildReportList = (reports: Report[]) => {
  return reports.map((report) => {
    const useOfFunds = report.pages.find((page) => page.id === "use-of-funds");
    const attachments =
      useOfFunds?.elements
        ?.filter((element) => element.type === ElementType.UseOfFundsAttachment)
        .flatMap((attachment) => attachment.answer)
        .filter(Boolean) ?? [];

    return {
      id: report.id,
      name: report.name,
      state: report.state,
      file: attachments[0],
    };
  });
};

export const ExportedZipPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [emptyReport, isEmptyReport] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    heading: string;
    subheading?: string;
    actionButtonText: string;
    closeButtonText?: string;
  }>({ heading: "", actionButtonText: "Export", closeButtonText: "Cancel" });
  const [view, setView] = useState<"STATE" | "REPORTS" | undefined>();
  const [reports, setReports] = useState<ZipMetadata[]>([]);

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [stateOptions, setStateOptions] = useState<DropdownOptions[]>([]);
  const [reportOptions, setReportOptions] = useState<DropdownOptions[]>([]);

  const buildReportOptions = (reports: ZipMetadata[]) => {
    const filtered = reports.filter((report) => report.file);

    isEmptyReport(filtered.length === 0);
    if (filtered.length === 0) return [];

    return [
      { label: "All", value: "all" },
      ...filtered.map((report) => ({ label: report.name, value: report.id })),
    ];
  };

  useEffect(() => {
    const reloadReports = async (reportType: string) => {
      setIsLoading(true);
      const result = await getReportByType(reportType);
      const list = buildReportList(result);
      setReports(list);
      setReportOptions(buildReportOptions(list));
      setIsLoading(false);
    };
    reloadReports(ReportType.RHTP);
  }, []);

  useEffect(() => {
    setStateOptions([
      dropdownEmptyOption,
      ...reports.map((report) => ({
        label: StateNames[report.state as keyof typeof StateNames],
        value: report.state,
      })),
    ]);
    setReportOptions(buildReportOptions(reports));
    setSelectedState("");
    setSelectedReports([]);
  }, [modalOpen]);

  const onStateChange = (evt: { target: { value: string } }) => {
    const newState = evt.target.value;

    setSelectedState(newState);
    setSelectedReports([]);

    const filteredReports = reports.filter(
      (report) => report.state === newState
    );

    //if no state is selected,, display all reports
    setReportOptions(
      buildReportOptions(newState === "" ? reports : filteredReports)
    );
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

  const OnExport = async () => {
    setIsExporting(true);
    const files = reports.filter((report) =>
      selectedReports.includes(report.id)
    );

    const newFiles = files.map((file) => ({
      reportId: file.id,
      state: file.state,
      fileId: file.file?.fileId!,
    }));

    await getZipFile<{
      files: { reportId: string; state: string; fileId: string }[];
    }>(`/reports/${ReportType.RHTP}/zip`, { files: newFiles });
    setIsExporting(false);
    setModalOpen(false);
  };

  return (
    <PageTemplate>
      <Box>
        <Heading as="h1" id="Exporteader" variant="h1" tabIndex={-1}>
          Export RHTP Files and Data
        </Heading>
        <Text>
          Instructions go here that need to be seen at all times. Provide
          details and context to help the user complete this page.
        </Text>
      </Box>
      {isLoading ? (
        <Flex justify="center">
          <Spinner size="md" />
        </Flex>
      ) : (
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
      )}
      <Modal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        content={modalData}
        onConfirmHandler={OnExport}
        submitting={isExporting}
        disableConfirm={emptyReport}
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
            disabled={emptyReport}
          ></MultiSelect>
          {emptyReport && (
            <Text color="error">
              {`No use of funds found in ${StateNames[selectedState as keyof typeof StateNames]} reports`}
            </Text>
          )}
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
