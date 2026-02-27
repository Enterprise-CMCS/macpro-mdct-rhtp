import { AttachmentAreaTemplate } from "types";
import { PageElementProps } from "components/report/Elements";
import { Text, Button, Stack, Heading, Image, Spinner } from "@chakra-ui/react";
import { UploadModal } from "components/modals/UploadModal";
import { useEffect, useState } from "react";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import { useParams } from "react-router-dom";
import { useStore } from "utils";
import {
  downloadFile,
  retrieveUploadedFiles,
  UploadListProp,
  uploadListRender,
} from "utils/other/upload";
import { deleteUploadedFile } from "utils/api/requestMethods/upload";

export const AttachmentArea = (
  props: PageElementProps<AttachmentAreaTemplate>
) => {
  const { label, helperText, id } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<UploadListProp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await retrieveUploadedFiles(year, state, id).then((response) => {
      setFiles(response);
      setLoading(false);
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
      {loading ? (
        <Spinner size="sm"></Spinner>
      ) : (
        uploadListRender(files ?? [], year, state, onRemove, downloadFile)
      )}
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
