import { useEffect, useState, SubmitEvent } from "react";
import { Alert, Modal } from "components";
import {
  Dropdown as CmsdsDropdownField,
  DropdownOption,
} from "@cmsgov/design-system";
import { Spinner, Flex } from "@chakra-ui/react";
import {
  createReport,
  getReportsForState,
} from "utils/api/requestMethods/report";
import {
  AlertTypes,
  CreateReportOptions,
  isReportType,
  LiteReport,
  ReportStatus,
} from "@rhtp/shared";

const verbiage = {
  addReportHeader: "Add new RHTP submission",
  copyReportHeader: "Copy RHTP submission",
  copyInputLabel:
    "If you want to copy an existing report, select one (optional)",
  copyInputHint:
    "This will pre-populate any fields you’ve added and any settings you’ve applied but will not copy quarterly financial data.",
};

const defaultCopyOption = {
  label: "-- Select an option --",
  value: "",
};

export const AddEditReportModal = ({
  activeState,
  reportType,
  modalDisclosure,
  reportHandler,
}: Props) => {
  if (!isReportType(reportType)) return null;

  const [formData, setFormData] = useState({ copyFromReportId: undefined });
  const [errorAlert, setErrorAlert] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [isFirstReport, setIsFirstReport] = useState<boolean>(true);
  const [copyOptions, setCopyOptions] = useState<DropdownOption[]>([
    defaultCopyOption,
  ]);

  useEffect(() => {
    (async () => {
      const newCopyOptions: DropdownOption[] = copyOptions;
      const reports = await getReportsForState(reportType, activeState);
      reports.map((report: LiteReport) => {
        if (report.status === ReportStatus.SUBMITTED) {
          newCopyOptions.push({ label: report.name, value: report.id });
        }
      });
      setCopyOptions(newCopyOptions);
      setIsFirstReport(newCopyOptions.length === 1);
    })();
  }, []);

  const onChange = (event: { target: { name: string; value: string } }) => {
    const { name, value } = event.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
  };

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setSubmitting(true);

    const reportOptions: CreateReportOptions = {
      copyFromReportId: formData.copyFromReportId,
    };

    try {
      await createReport(reportType, activeState, reportOptions);
      await reportHandler(reportType, activeState);
      modalDisclosure.onClose();
    } catch (error: any) {
      const errorMessage =
        error.message?.split(" - ").at(-1) || "Unknown error";
      setErrorAlert(errorMessage);
    }

    setSubmitting(false);
  };

  return (
    <Modal
      formId="addEditReportModal"
      modalDisclosure={modalDisclosure}
      content={{
        heading: `${isFirstReport ? verbiage.addReportHeader : verbiage.copyReportHeader}`,
        actionButtonText: submitting ? <Spinner size="md" /> : "Save",
        closeButtonText: "Cancel",
      }}
      disableConfirm={submitting}
    >
      <form id="addEditReportModal" onSubmit={onSubmit}>
        <Flex direction="column" gap="2rem">
          {errorAlert !== undefined ? (
            <Alert status={AlertTypes.ERROR} title="Failed to create report">
              {errorAlert}
            </Alert>
          ) : null}
          {!isFirstReport && (
            <CmsdsDropdownField
              name="copyFromReportId"
              label={verbiage.copyInputLabel}
              hint={verbiage.copyInputHint}
              onChange={onChange}
              value={formData.copyFromReportId}
              options={copyOptions}
            />
          )}
        </Flex>
      </form>
    </Modal>
  );
};

interface Props {
  activeState: string;
  reportType: string;
  selectedReport?: LiteReport;
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  reportHandler: (reportType: string, activeState: string) => void;
}
