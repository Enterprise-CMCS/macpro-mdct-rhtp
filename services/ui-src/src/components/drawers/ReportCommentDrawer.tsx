import { useEffect, useState } from "react";
import {
  TextField,
  Dropdown,
  DropdownChangeObject,
  DropdownOption,
  ChoiceList,
} from "@cmsgov/design-system";
import {
  Box,
  Divider,
  Heading,
  Text,
  Spinner,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Image,
  Flex,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { Modal } from "../modals/Modal";
import {
  InitiativeAnswerProp,
  UploadListProp,
  AttachmentStatus,
  ReportStatus,
  UserRoles,
  FileStatusOptions,
  Report,
  ReportType,
  CommentType,
  Comment,
  isCompleteStatus,
} from "@rhtp/shared";
import { acceptReport, releaseReport, useStore } from "utils";
import { useFlags } from "launchdarkly-react-client-sdk";
import {
  createComment,
  getComments,
} from "utils/api/requestMethods/commentMethods";
import closeIcon from "assets/icons/close/icon_close_primary.svg";
import lockIcon from "assets/icons/icon_lock.svg";

const AdminReportStatusOptions = [
  ReportStatus.SUBMITTED,
  ReportStatus.ACCEPTED,
  "Unlock",
];

export const ReportCommentDrawer = ({
  modalDisclosure,
  selectedReport,
  reloadReports,
}: ReportCommentProps) => {
  const { name, status } = selectedReport;
  const { userIsAdmin } = useStore().user ?? {};
  // Can only modify dropdown if report is submitted and is admin user
  const disabled = status !== ReportStatus.SUBMITTED || !userIsAdmin;
  const initialValues: {
    comment: string;
    status: string;
  } = {
    comment: "",
    status: status,
  };
  const [displayValue, setDisplayValue] = useState(initialValues);
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const statuses = new Set([...AdminReportStatusOptions, status]);
    const statusOptions = [];
    for (const status of statuses.values()) {
      statusOptions.push({
        label: status,
        value: status,
      });
    }
    setStatusOptions(statusOptions);
  }, []);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement> | DropdownChangeObject
  ) => {
    const { name, value } = event.target;
    setDisplayValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async () => {
    setSubmitting(true);

    if (displayValue.status === "Unlock") {
      await releaseReport(selectedReport);
      reloadReports(ReportType.RHTP);
    } else if (
      displayValue.status === ReportStatus.ACCEPTED &&
      displayValue.status !== status
    ) {
      await acceptReport(selectedReport);
      reloadReports(ReportType.RHTP);
    }

    modalDisclosure.onClose();
    setSubmitting(false);
  };

  return (
    <Modal
      modalDisclosure={modalDisclosure}
      content={{
        heading: `Add comment to ${name || "report"}`,
        actionButtonText: "Save",
      }}
      onConfirmHandler={onSubmit}
      submitting={submitting}
    >
      <Dropdown
        label="Status"
        name="status"
        onChange={onChange}
        options={statusOptions}
        value={displayValue.status}
        disabled={disabled}
      />
    </Modal>
  );
};

interface ReportCommentProps {
  modalDisclosure: {
    isOpen: boolean;
    onClose: () => void;
  };
  selectedReport: Report;
  reloadReports: Function;
}
