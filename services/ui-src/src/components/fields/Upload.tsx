import { Box, Button, List, ListItem, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFileDownloadUrl,
  getUploadedFiles,
  recordFileInDatabaseAndGetUploadUrl,
  uploadFileToS3,
} from "utils/other/fileApi";

type uploadListData = {
  name: string;
  size: number;
  fileId: string;
};

export const Upload = ({
  year,
  id: uploadId,
}: {
  year: string;
  id: string;
}) => {
  const [_isDragOver, setIsDragOver] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>();
  const [uploadedFiles, setUploadedFiles] = useState<uploadListData[]>();
  const { state } = useParams();

  const acceptedFileTypes = [
    ".ppt",
    ".pdf",
    ".doc",
    ".docx",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  useEffect(() => {
    retrieveUploadedFiles();
  }, []);

  useEffect(() => {
    if (filesToUpload && filesToUpload.length > 0) {
      const fetchData = async () =>
        await onUploadFiles().then((response) => {
          console.log(response);
          const listData = filesToUpload.map((file) => {
            return { name: file.name, size: file.size, fileId: "" };
          });

          setUploadedFiles([...(uploadedFiles ?? []), ...listData]);
          setFilesToUpload([]);
        });
      fetchData();
    }
  }, [filesToUpload]);

  const downloadFile = async (fileId: string) => {
    window.location.href = await getFileDownloadUrl(year, state!, fileId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    //filter to only accepted file types
    const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file != null);

    const prevFiles = filesToUpload ?? [];
    setFilesToUpload([...prevFiles, ...files]);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files;
      setFilesToUpload([...(filesToUpload ?? []), ...file]);
    }
  };

  const onRemove = (index: number) => {
    if (!filesToUpload) return;

    const files = [...filesToUpload];
    files.splice(index, 1);
    setFilesToUpload(files);
  };

  const retrieveUploadedFiles = async () => {
    const uploadedFiles = await getUploadedFiles(year, state!, uploadId);
    const listData = uploadedFiles.map((file) => {
      return { name: file.filename, size: 0, fileId: file.fileId };
    });
    setUploadedFiles(listData);
  };

  const onUploadFiles = async () => {
    if (!year || !state) {
      throw new Error("Undefined year or state parameter");
    }
    const files = filesToUpload ?? [];
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const presignedPostData = await recordFileInDatabaseAndGetUploadUrl(
        year,
        state,
        uploadId,
        file,
      );
      await uploadFileToS3(presignedPostData, file);
    }
  };

  return (
    <VStack sx={sx.container} gap="1rem" alignItems="flex-start">
      <div>
        <Text sx={sx.uploadedLabel}>Select a file or files to upload</Text>
        <Text sx={sx.uploadedSubLabel}>
          {" "}
          Supported formats: JPEG, PNG, PDF, CSV, Word, PPT
        </Text>
      </div>
      <Box
        sx={sx.uploadBox}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        width="100%"
      >
        <span>
          Drag files here or
          <label id="drop-zone">
            Choose from folder
            <input
              type="file"
              id="file-input"
              multiple
              accept={acceptedFileTypes.join(",")}
              onChange={onFileChange}
            />
          </label>
        </span>
      </Box>
      <Text sx={sx.uploadedLabel}>Selected Files</Text>
      <List variant="upload">
        {filesToUpload?.map((file, fileIdx) => (
          <ListItem>
            <VStack>
              <Button variant="link">{file?.name}</Button>
              <span>{file.size} KB</span>
            </VStack>
            <Button variant="unstyled" onClick={() => onRemove(fileIdx)}>
              x
            </Button>
          </ListItem>
        ))}
      </List>
      <div>
        <Text sx={sx.uploadedLabel}>Uploaded Files</Text>
        <Text sx={sx.uploadedSubLabel}>
          These files have been attached to the stage and checkpoint selected
          above.
        </Text>
      </div>
      <List variant="upload">
        {uploadedFiles?.map((file, fileIdx) => (
          <ListItem>
            <VStack>
              <Button variant="link" onClick={() => downloadFile(file.fileId)}>
                {file?.name}
              </Button>
              <span>{file.size} KB</span>
            </VStack>
            <Button variant="unstyled" onClick={() => onRemove(fileIdx)}>
              x
            </Button>
          </ListItem>
        ))}
      </List>
    </VStack>
  );
};

const sx = {
  container: {
    h2: {
      margin: "1.5rem 0",
      fontWeight: "700",
    },
  },

  uploadedLabel: {
    marginBottom: ".50rem",
    fontWeight: "600",
  },

  uploadedSubLabel: {
    fontSize: "14px",
  },

  uploadBox: {
    display: "flex",
    flexDir: "column",
    border: "1px dashed #0071bc",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",

    span: {
      display: "flex",
      margin: ".50rem",
    },

    label: {
      paddingLeft: ".25rem",
      marginBlock: 0,
      color: "#0071bc",
      textDecoration: "underline",
      fontWeight: "700",
    },

    "#file-input": {
      display: "none",
    },
  },
};
