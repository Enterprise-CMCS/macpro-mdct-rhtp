import { useState } from "react";
import { useFlags } from "launchdarkly-react-client-sdk";
import { Link as RouterLink } from "react-router";
import { Stack, Box, Button, Spinner, Image } from "@chakra-ui/react";
import { submittableMetricsSelector } from "utils/state/selectors";
import { submitReport, useStore, reportBasePath } from "utils";
import { createZipFile } from "utils/other/zip";
import { SubmitReportModal } from "./SubmitReportModal";
import lookupIconPrimary from "assets/icons/search/icon_search_primary.svg";
import whitePDFPrimary from "assets/icons/pdf/icon_pdf_white.svg";
import { ReportStatus } from "@rhtp/shared";

export const SubmissionBar = () => {
  const { report, user, setModalComponent, setModalOpen, updateReport } =
    useStore();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const submittableMetrics = useStore(submittableMetricsSelector);

  if (!report) {
    return null;
  }

  const isPdfActive = useFlags()?.viewPdf;
  const isSubmitted = report.status === ReportStatus.SUBMITTED;

  const onSubmit = async () => {
    setModalOpen(false);
    setSubmitting(true);
    const submittedReport = await submitReport(report);
    updateReport(submittedReport);
    setSubmitting(false);
  };

  const modal = SubmitReportModal(
    () => setModalOpen(false),
    onSubmit,
    report.type!
  );

  const displayModal = () => {
    setModalComponent(modal, "Are you sure you want to submit?");
  };

  return (
    <Stack
      direction="row"
      width="100%"
      display="flex"
      justifyContent="space-between"
      mt={5}
    >
      <Box>
        {isPdfActive && (
          <Button
            as={RouterLink}
            to={reportBasePath(report) + "/export"}
            target="_blank"
            colorScheme="blue"
            variant={isSubmitted ? "primary" : "outline"}
            marginRight="spacer4"
            leftIcon={
              <Image src={isSubmitted ? whitePDFPrimary : lookupIconPrimary} />
            }
          >
            {isSubmitted ? "Download" : "Review"} PDF
          </Button>
        )}
        <Button
          colorScheme="blue"
          variant={isSubmitted ? "outline" : "link"}
          fontWeight="bold"
          onClick={() => createZipFile(report)}
        >
          ZIP Files
        </Button>
      </Box>
      {user?.userIsEndUser && !isSubmitted && (
        <Button
          alignSelf="flex-end"
          onClick={async () => displayModal()}
          disabled={!submittableMetrics?.submittable || submitting}
        >
          {submitting && <Spinner size="sm" marginRight="spacer2" />}
          {`Submit ${report.type} Report`}
        </Button>
      )}
    </Stack>
  );
};
