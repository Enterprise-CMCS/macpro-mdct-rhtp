import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import { Text, Button, Stack, Heading, Image } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useEffect, useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { useParams } from "react-router-dom";
import { parseHtml, useStore } from "utils";
import {
  retrieveUploadedFiles,
  UploadListProp,
  uploadListRender,
} from "utils/other/upload";
import { deleteUploadedFile, getFileDownloadUrl } from "utils/other/fileApi";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { label, helperText, id } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<UploadListProp[]>([]);

  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  const downloadFile = async (file: UploadListProp) => {
    window.location.href = parseHtml(
      await getFileDownloadUrl(year, state!, file.fileId)
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await retrieveUploadedFiles(year, state, id).then((response) => {
      setFiles(response);
    });
  };

  const onModalClose = () => {
    setModalOpen(false);
    //get upload list again when modal is closed
    fetchData();
  };

  const onRemove = async (file: UploadListProp) => {
    /** TO DO: Fix file deletion from s3 bucket */
    await deleteUploadedFile(year, state, file.fileId);
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h5">{label}</Heading>
      {helperText && <Text>{helperText}</Text>}
      {uploadListRender(files ?? [], onRemove, downloadFile)}
      <Button
        width="fit-content"
        onClick={() => setModalOpen(true)}
        variant="outline"
        leftIcon={<Image src={addIconPrimary} />}
      >
        Add attachment
      </Button>
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        id={id}
        state={state}
        year={year}
      ></UploadModal>
    </Stack>
  );
};
