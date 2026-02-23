import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import { Text, Button, Stack, Heading, Image } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useEffect, useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { useParams } from "react-router-dom";
import { useStore } from "utils";
import {
  retrieveUploadedFiles,
  UploadListProp,
  uploadListRender,
} from "utils/other/upload";
import { deleteUploadedFile, getFileDownloadUrl } from "utils/other/fileApi";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>,
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
    window.location.href = await getFileDownloadUrl(year, state!, file.fileId);
  };

  const fetchData = async () => {
    await retrieveUploadedFiles(year, state, id).then((response) => {
      setFiles(response);
    });
  };

  fetchData();

  const onModalClose = () => {
    setModalOpen(false);
    fetchData();
    //reload uploads when
  };

  const onRemove = async (id: string, file: UploadListProp) => {
    await deleteUploadedFile(year, state, file.fileId);
  };

  return (
    <Stack gap="1.5rem">
      <Heading variant="h5">{label}</Heading>
      {helperText && <Text>{helperText}</Text>}
      {uploadListRender(files ?? [], onRemove, downloadFile)}
      <Button
        onClick={() => setModalOpen(!isModalOpen)}
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
