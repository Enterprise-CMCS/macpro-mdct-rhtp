import { FormEvent, useEffect, useState, ReactElement } from "react";
import { Modal } from "components";
import {
  TextField as CmsdsTextField,
  Dropdown as CmsdsDropdownField,
} from "@cmsgov/design-system";
import { Spinner, Flex, Text } from "@chakra-ui/react";
import {
  createReport,
  updateReport,
  getReportsForState,
} from "utils/api/requestMethods/report";
import {
  isReportType,
  LiteReport,
  ReportOptions,
  ReportStatus,
  ReportType,
} from "types";
import RhtpOptions from "./AddFormOptions/Options";
import { ErrorMessages } from "../../constants";

export type AddEditReportModalOptions = {
  verbiage: {
    reportName: string;
    yearSelect: string;
    nameHelperText: (state: string) => string;
    nameLabel: string;
    topText?: string;
    yearHelperText?: string;
  };
};

const buildModalOptions = (
  reportType: ReportType
): AddEditReportModalOptions => {
  const optionsByReportType: Record<ReportType, AddEditReportModalOptions> = {
    [ReportType.RHTP]: RhtpOptions,
  };
  return optionsByReportType[reportType];
};

export const AddEditReportModal = ({
  activeState,
  reportType,
  modalDisclosure,
  selectedReport,
  reportHandler,
}: Props) => {
  if (!isReportType(reportType)) return null;

  const dropdownYears = [{ label: "2026", value: "2026" }];
  const { verbiage } = buildModalOptions(reportType);

  const formDataForReport = (report: LiteReport | undefined) => ({
    reportTitle: report?.name ?? "",
    year: report?.year?.toString() ?? dropdownYears[0].value,
  });
  const initialFormData = formDataForReport(selectedReport);
  const [formData, setFormData] = useState(initialFormData);
  const [errorData, setErrorData] = useState({ reportTitle: "", year: "" });
  const [submitting, setSubmitting] = useState(false);
  const readOnly = selectedReport?.status === ReportStatus.SUBMITTED;
  const [reportTitleFieldDirtied, setReportTitleFieldDirtied] = useState(false);

  useEffect(() => {
    setFormData(formDataForReport(selectedReport));
    setReportTitleFieldDirtied(false);
  }, [selectedReport, modalDisclosure.isOpen]);

  useEffect(() => {
    if (!reportTitleFieldDirtied) return;
    setErrorMessage(formData.reportTitle).then((errorMessage) => {
      setErrorData((prevErrorData) => ({
        ...prevErrorData,
        reportTitle: errorMessage,
      }));
    });
  }, [formData.reportTitle]);

  const doesReportNameExist = async (value: string) => {
    let existingReports = await getReportsForState(reportType, activeState);
    const doesReportNameAlreadyExist = existingReports.some(
      (report) =>
        report.name === value &&
        report.year === Number(formData.year) &&
        report.id !== selectedReport?.id
    );

    return doesReportNameAlreadyExist;
  };

  const setErrorMessage = async (value: string): Promise<string> => {
    if (!value) {
      return ErrorMessages.requiredResponse;
    }
    const duplicateReportName = await doesReportNameExist(value);
    if (duplicateReportName) {
      return ErrorMessages.mustBeUniqueReportName;
    }
    return "";
  };

  const onChange = (evt: { target: { name: string; value: string } }) => {
    const { name, value } = evt.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
    setReportTitleFieldDirtied(true);
  };

  const onSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    const reportTitleError = await setErrorMessage(formData.reportTitle);
    const newErrorData = {
      reportTitle: reportTitleError,
      year: formData.year ? "" : ErrorMessages.requiredResponse,
    };
    setErrorData(newErrorData);
    const canSubmit =
      !newErrorData.reportTitle && !!formData.reportTitle && !!formData.year;
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);

    const userEnteredReportName = formData.reportTitle!;
    if (selectedReport) {
      if (userEnteredReportName) {
        selectedReport.name = userEnteredReportName;
      }
      await updateReport(selectedReport);
    } else {
      const reportOptions: ReportOptions = {
        name: userEnteredReportName,
        year: Number(formData.year),
      };
      await createReport(reportType, activeState, reportOptions);
      await reportHandler(reportType, activeState);
    }

    setSubmitting(false);
    modalDisclosure.onClose();
  };

  return (
    <Modal
      data-testid="add-edit-report-modal"
      formId="addEditReportModal"
      modalDisclosure={modalDisclosure}
      content={{
        heading: `${selectedReport ? "Edit" : "Add new"} ${
          verbiage.reportName
        }`,
        subheading: "",
        actionButtonText: submitting ? (
          <Spinner size="md" />
        ) : (
          `${selectedReport ? "Save" : "Start new"}`
        ),
        closeButtonText: "Cancel",
      }}
      disableConfirm={readOnly}
    >
      <form id="addEditReportModal" onSubmit={onSubmit}>
        <Flex direction="column" gap="2rem">
          {verbiage.topText && <Text>{verbiage.topText}</Text>}
          <CmsdsTextField
            name="reportTitle"
            label={verbiage.nameLabel}
            hint={verbiage.nameHelperText(activeState)}
            onChange={onChange}
            onBlur={() =>
              setErrorData({
                ...errorData,
                reportTitle: formData.reportTitle
                  ? ""
                  : ErrorMessages.requiredResponse,
              })
            }
            value={formData.reportTitle}
            errorMessage={errorData.reportTitle}
            disabled={readOnly}
          />
          <CmsdsDropdownField
            name="year"
            label={verbiage.yearSelect}
            hint={verbiage.yearHelperText ?? ""}
            onChange={onChange}
            value={formData.year}
            errorMessage={errorData.year}
            options={dropdownYears}
            disabled={!!selectedReport}
          />
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
