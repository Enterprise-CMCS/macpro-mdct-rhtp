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
import { dropdownEmptyOption } from "../../../../../shared/src/utils/constants";
import { MultiSelect } from "components/forms/Multiselect";
import { ElementType, Report, ReportType, UploadListProp } from "@rhtp/shared";
import { getReportByType } from "utils";
import { getZipFile2 } from "utils/other/fileUtils";

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    heading: string;
    subHeading?: string;
    actionButtonText: string;
    closeButtonText?: string;
  }>({ heading: "", actionButtonText: "Export", closeButtonText: "Cancel" });
  const [view, setView] = useState<"STATE" | "REPORTS" | undefined>();
  const [reports, setReports] = useState<
    { name: string; id: string; state: string; file?: UploadListProp }[]
  >([]);

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const [stateOptions, setStateOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [reportOptions, setReportOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    const reloadReports = async (reportType: string) => {
      setIsLoading(true);
      const result = await getReportByType(reportType);

      const list = buildReportList(result);
      setReports(list);

      setStateOptions([
        dropdownEmptyOption,
        ...result.map((report) => ({
          label: report.state,
          value: report.state,
        })),
      ]);

      setReportOptions([
        { label: "All", value: "all" },
        ...result.map((report) => ({ label: report.name, value: report.id })),
      ]);
      setIsLoading(false);
    };
    reloadReports(ReportType.RHTP);
  }, []);

  useEffect(() => {
    setStateOptions([
      dropdownEmptyOption,
      ...reports.map((report) => ({
        label: report.state,
        value: report.state,
      })),
    ]);

    setReportOptions([
      { label: "All", value: "all" },
      ...reports.map((report) => ({ label: report.name, value: report.id })),
    ]);
  }, []);

  const onStateChange = (evt: { target: { value: string } }) => {
    const newState = evt.target.value;
    setSelectedState(newState);
    setReportOptions([
      { label: "All", value: "all" },
      ...reports
        .filter((report) => report.state === newState)
        .map((option) => ({ label: option.name, value: option.id })),
    ]);
  };

  const onReportChange = (selected: string[]) => {
    if (!selectedReports.includes("all")) {
      if (selected.includes("all")) {
        setSelectedReports(reportOptions.map((option) => option.value));
        return;
      }
    } else {
      if (!selected.includes("all")) {
        setSelectedReports([]);
        return;
      } else {
        if (selected.length < reportOptions.length + 1) {
          setSelectedReports(
            selected.filter((selection) => selection !== "all")
          );
          return;
        }
      }
    }
    setSelectedReports(selected);
  };

  const export1 = () => {
    setModalData({
      ...modalData,
      heading: "Use of Funds: By Reports (includes All States)",
      subHeading:
        "Report includes all states. Select one or many reports to include in the download.",
    });
    setView("REPORTS");
    setModalOpen(true);
  };

  const export2 = () => {
    setModalData({
      ...modalData,
      heading: "Use of Funds: By State and Report(s) Export",
      subHeading:
        "Select one State and one or many reports to include in the download.",
    });
    setView("STATE");
    setModalOpen(true);
  };

  const OnExport = async () => {
    const files = reports.filter(
      (report) => report.file && report.file.fileId != undefined
    );

    const newFiles = files.map((file) => ({
      reportId: file.id,
      state: file.state,
      fileId: file.file?.fileId!,
    }));

    await getZipFile2(ReportType.RHTP, newFiles);
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
            export1
          )}
          {ExportCard(
            "Use of Funds: By State and Report(s)",
            "{Details about what is included in the export}",
            export2
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
