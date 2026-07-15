import { Box, Button, Heading, Image, Stack, Text } from "@chakra-ui/react";
import {
  AlertTypes,
  UploadListProp,
  UseOfFundsAttachmentTemplate,
} from "@rhtp/shared";
import { PageElementProps } from "./Elements";
import { Fragment, useState } from "react";
import addIcon from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import { bytesToKiloBytes, useStore } from "utils";
import { UploadModal } from "components/modals/UploadModal";
import {
  uploadListRender,
  downloadFile,
  removeFile,
} from "utils/other/fileUtils";
import { Modal } from "components/modals/Modal";
import { Alert } from "components/alerts/Alert";
import { notAnsweredText } from "../../constants";

export const UseOfFundsAttachmentElement = (
  props: PageElementProps<UseOfFundsAttachmentTemplate>
) => {
  const { disabled, element, updateElement } = props;
  const { report } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const { id, state, type: reportType } = report!;
  const { answer, label } = element;
  const files = answer ?? [];

  const saveToReport = (newFiles: UploadListProp[]) => {
    updateElement({ answer: newFiles });
  };

  const onDeleteModalOpen = () => {
    setDeleteModalOpen(true);
  };

  const onDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  const onRemove = () => {
    updateElement({ answer: [] });
    removeFile(reportType, state, id, files[0]);
    onDeleteModalClose();
  };

  const isDisabled = () => {
    return disabled || files.length > 0;
  };

  return (
    <Fragment>
      <Button
        variant={"outline"}
        onClick={() => {
          setModalOpen(true);
        }}
        disabled={isDisabled()}
        leftIcon={<Image src={isDisabled() ? addGray : addIcon} />}
      >
        Add Use of Funds
      </Button>
      <UploadModal
        modalDisclosure={{
          isOpen: modalOpen,
          onClose: () => {
            setModalOpen(false);
          },
        }}
        modalHeading={"Add Use of Funds"}
        answer={files}
        saveToReport={saveToReport}
        deleteFromReport={onRemove}
        subLabel={{
          uploaded: "This file has been uploaded to the use of funds page.",
        }}
        multiple={false}
      ></UploadModal>
      {files.length > 0 && (
        <Heading as="h2" fontWeight="bold" marginBottom="-0.5rem">
          {label}
        </Heading>
      )}
      {uploadListRender(
        reportType,
        state,
        id,
        files,
        onDeleteModalOpen,
        downloadFile
      )}

      <Modal
        modalDisclosure={{
          isOpen: deleteModalOpen,
          onClose: onDeleteModalClose,
        }}
        onConfirmHandler={onRemove}
        content={{
          heading: "Delete Use of Funds",
          actionButtonText: "Delete",
        }}
      >
        <Alert status={AlertTypes.WARNING} title="Warning">
          Deleting this attachment will remove it from the Use of Funds page.
        </Alert>
        <Box mt={"spacer3"} mb={"spacer_half"}>
          <Text sx={sx.uploadedLabel}>File</Text>
        </Box>
        {uploadListRender(
          reportType,
          state,
          id,
          files,
          onRemove,
          downloadFile,
          true // hide remove icon in delete modal
        )}
      </Modal>
    </Fragment>
  );
};

// The pdf rendering of UseOfFundsAttachmentElement component
export const UseOfFundsAttachmentElementExport = (
  element: UseOfFundsAttachmentTemplate
) => {
  if (element.answer && element.answer.length > 0) {
    const name = element.answer[0].name;
    const size = element.answer[0].size;
    return (
      <Stack>
        <Box>{name}</Box>
        <Box color="gray">{bytesToKiloBytes(size)} KB</Box>
      </Stack>
    );
  } else {
    return notAnsweredText;
  }
};

const sx = {
  uploadedLabel: {
    marginBottom: ".50rem",
    fontWeight: "600",
  },
};
