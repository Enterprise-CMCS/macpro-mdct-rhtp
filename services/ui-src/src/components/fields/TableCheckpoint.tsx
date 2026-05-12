import {
  Stack,
  Button,
  Checkbox,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Image,
  Flex,
} from "@chakra-ui/react";
import {
  AttachmentStatus,
  ElementType,
  InitiativeAnswerProp,
  TableCheckpointTemplate,
  UploadListProp,
  AlertTypes,
  InitiativeComment,
} from "@rhtp/shared";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import addGray from "assets/icons/add/icon_add_gray.svg";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { Dropdown, Label } from "@cmsgov/design-system";
import { useContext, useEffect, useState } from "react";
import { UploadModal } from "components/modals/UploadModal";
import { useParams } from "react-router";
import { useStore } from "utils";
import {
  canDeleteAttachment,
  downloadFile,
  removeFile,
} from "utils/other/upload";
import {
  checkpointAttachableOptions,
  checkpointList,
  getStageIdByCheckpointId,
  stageList,
} from "verbiage/checkpoints";
import { ReportAutosaveContext } from "components/report/ReportAutosaveProvider";
import { PageElementProps } from "components/report/Elements";
import { setAnswerInElement } from "utils/state/reportLogic/reportActions";
import { attachmentTableId } from "../../constants";
import { CommentModal } from "components/modals/CommentModal";
import { Alert } from "components";

type TableShape = {
  stage: number;
  label: string;
  checkpoints: {
    id: string;
    checkpointNumber: string;
    label: string;
    attachable: boolean;
  }[];
  rows: {
    id: string;
    stageNo: string;
    label: string;
    file: UploadListProp;
    status: AttachmentStatus;
    comments: InitiativeComment[];
  }[];
};

/** Formatting the the data from the elements into renderable rows for the table */
const buildRows = (
  values: {
    label: string;
    id: string;
    checkpointNumber: string;
    attachments:
      | {
          file: UploadListProp;
          status: AttachmentStatus;
          comments: InitiativeComment[];
        }[]
      | undefined;
  }[]
) => {
  return values.reduce((prev: any[], curr) => {
    const { id, checkpointNumber, label, attachments } = curr;
    const row = {
      id,
      stageNo: checkpointNumber,
      label,
    };
    if (attachments) {
      const copy = [...attachments];
      const { file, status, comments } = copy.shift() || {};
      prev.push({
        ...row,
        file: file ?? {},
        status: status ?? "",
        comments: comments ?? [],
      });
      copy.forEach(({ file, status, comments }) =>
        prev.push({
          id,
          stageNo: "",
          label: "",
          completed: undefined,
          file,
          status,
          comments,
        })
      );
    } else {
      prev.push(row);
    }
    return prev;
  }, []);
};

const buildTables = (answers: InitiativeAnswerProp[]) => {
  return stageList.map((list) => {
    const { stage, label, checkpoints, id } = list;
    const values = checkpoints.map((checkpoint) => {
      const files = answers
        .filter(
          (answer) => answer.stage === id && answer.checkpoint === checkpoint.id
        )
        .map((upload) => ({
          file: upload.attachment,
          status: upload.status,
          comments: upload.comments,
        }));
      return {
        label: checkpoint.label,
        id: checkpoint.id,
        attachments: checkpoint.attachable ? files : undefined,
        checkpointNumber: checkpoint.checkpointNumber,
      };
    });
    const rows = buildRows(values);
    return { stage, label, checkpoints, rows };
  });
};

const getFilesFromTable = (tables: TableShape[], checkpoint: string) => {
  return tables
    .flatMap((tables) => tables.rows)
    .filter((row) => row.id === checkpoint && row.file.fileId)
    .map((filter) => filter.file);
};

const header = [
  "#",
  "Checkpoint",
  "Ready for CMS Review",
  "Attachments",
  "Status",
  "Actions",
];

export const TableCheckpoint = (
  props: PageElementProps<TableCheckpointTemplate>
) => {
  const { disabled } = props;
  const { answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<UploadListProp>();
  const { pageId } = useParams();
  const { report, setAnswers } = useStore();
  const { id, state, type: reportType } = report!;
  const { autosave } = useContext(ReportAutosaveContext);
  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue =
    answer ??
    checkpointList.map((checkpoint) => ({
      id: checkpoint.id,
      checked: false,
    }));
  const [tables, setTables] = useState<TableShape[]>([]);
  const [checkpoint, setCheckpoint] = useState("");
  const [files, setFiles] = useState<UploadListProp[]>([]);
  const [attachments, setAttachments] = useState<InitiativeAnswerProp[]>([]);

  const [modalMode, setModalMode] = useState<"Upload" | "Delete">("Upload");
  const actionButtonText = {
    Upload: "Done",
    Delete: "Delete",
  };
  const modalHeading = {
    Upload: "Upload Initiative Attachments",
    Delete: "Delete Attachment",
  };

  if (!state || !id || !reportType || !pageId) {
    console.error("Can't retrieve uploads with missing state, year or id");
    return;
  }

  //This populates the uploaded area of the uploads modal when the dropdown selection has changed
  useEffect(() => {
    if (modalMode === "Upload") {
      setFiles(getFilesFromTable(tables, checkpoint));
    } else if (modalMode === "Delete") {
      setFiles(selectedFile ? [selectedFile] : []);
    }
  }, [checkpoint]);

  //Updates when the report has been updated, so when a file has been added or removed from the table
  useEffect(() => {
    const attachments = report?.pages
      .flatMap((page) => page.elements)
      .find((element) => element?.type === ElementType.AttachmentTable)?.answer;

    const files =
      attachments?.filter((data) => data.initiatives.includes(pageId)) ?? [];

    const newTables = buildTables(files);
    setAttachments(attachments || []);
    setTables(newTables);
    setFiles(getFilesFromTable(newTables, checkpoint));
  }, [isCommentsOpen, report]);

  const onCheckboxHandler = (id: string) => {
    const newValue = [...initialDisplayValue];
    const checkbox = newValue.find((value) => value.id === id);
    if (checkbox) checkbox.checked = !checkbox.checked;
    props.updateElement({ answer: newValue });
  };

  const formatUploads = (uploads: UploadListProp[]) => {
    return uploads.map((file) => ({
      initiatives: [pageId],
      stage: getStageIdByCheckpointId(checkpoint),
      checkpoint,
      comments: [],
      attachment: file,
      status: AttachmentStatus.PENDING_REVIEW,
    }));
  };

  const deleteFromReport = (file: UploadListProp) => {
    handleFileAddDelete(file.fileId);
    removeFile(reportType, state, id, file);
  };

  const onCommentClick = (file: UploadListProp) => {
    setSelectedFile(file);
    setCommentsOpen(true);
  };

  const onAddClick = () => {
    setCheckpoint("");
    setModalMode("Upload");
    setModalOpen(true);
  };

  const onDeleteClick = (selectedFile: any) => {
    setModalMode("Delete");
    setModalOpen(true);
    setSelectedFile(selectedFile);

    const fullSelectedFile = attachments.find(
      ({ attachment }) => attachment.fileId === selectedFile.fileId
    );
    setCheckpoint(fullSelectedFile?.checkpoint ?? "");
  };

  const handleCommentSave = (data: { answer: InitiativeAnswerProp[] }) => {
    writeToAttachmentsTable(() => data.answer);
  };

  const writeToAttachmentsTable = (generateAnswer: (answer: any) => any) => {
    if (!report) return;
    setAnswerInElement<InitiativeAnswerProp[]>(
      report,
      "initiative-attachments",
      attachmentTableId,
      generateAnswer,
      setAnswers
    );
    autosave();
  };

  const handleFileAddDelete = (newValue: UploadListProp[] | string) => {
    //the type of element being passed in determines whether it's an add or remove
    const generateAnswer = (answer: InitiativeAnswerProp[]) => {
      //if it's a string, we're removing a file
      if (typeof newValue === "string") {
        const newAnswer = answer.filter(
          (item) => item.attachment.fileId !== newValue
        );
        return [...newAnswer];
      } else {
        return [...answer, ...formatUploads(newValue)];
      }
    };
    writeToAttachmentsTable(generateAnswer);
  };

  const onModalSubmit = () => {
    if (modalMode === "Delete") {
      deleteFromReport(selectedFile!);
    }
    setModalOpen(false);
  };

  return (
    <Stack gap="1.25rem" width="100%">
      {tables.map((table, tableIndex) => (
        <Stack key={`checkpoint-${tableIndex}`} gap="1.25rem">
          <Label>{`Stage ${table.stage}: ${table.label}`}</Label>
          <Button
            aria-label="Upload attachments"
            variant="outline"
            alignSelf="flex-start"
            leftIcon={<Image src={disabled ? addGray : addIconPrimary} />}
            onClick={onAddClick}
            disabled={disabled}
          >
            Upload attachments
          </Button>
          <Table variant="metric" key={table.label}>
            <Thead>
              <Tr>
                {header.map((item) => (
                  <Th key={item}>{item}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {table.rows.map((row, rowIndex) => (
                <Tr key={`checkpoint-row-${rowIndex}`}>
                  <Td>{row.stageNo}</Td>
                  <Td>{row.label}</Td>
                  <Td>
                    {row.label != "" ? (
                      <Checkbox
                        aria-label={`Check if ${row.label} is complete`}
                        isChecked={
                          initialDisplayValue.find(
                            (value) => value.id === row.id
                          )?.checked
                        }
                        onChange={() => onCheckboxHandler(row.id)}
                        disabled={disabled}
                      ></Checkbox>
                    ) : (
                      <></>
                    )}
                  </Td>
                  <Td>
                    {"file" in row ? (
                      <Button
                        aria-label={`Download ${row.file.name}`}
                        variant="link"
                        onClick={() =>
                          downloadFile(reportType, state, id, row.file)
                        }
                      >
                        {row.file.name}
                      </Button>
                    ) : (
                      "Not applicable"
                    )}
                  </Td>
                  <Td>{row.status}</Td>
                  <Td>
                    {"file" in row && row.file.fileId && (
                      <Flex>
                        <Button
                          variant="link"
                          onClick={() => onCommentClick(row.file)}
                          aria-label={`Comment on ${row.file.name}`}
                        >
                          <Image
                            src={commentIcon}
                            alt="Comment"
                            minWidth="26px"
                          />
                        </Button>
                        <Button
                          variant="unstyled"
                          onClick={() => {
                            onDeleteClick(row.file);
                          }}
                          aria-label={`Remove ${row.file.name} from checkpoint ${row.label}`}
                          disabled={
                            !canDeleteAttachment(row.status, row.comments) ||
                            disabled
                          }
                        >
                          <Image src={cancelIcon} alt="Remove" />
                        </Button>
                      </Flex>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Stack>
      ))}
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: () => setModalOpen(false),
        }}
        answer={files}
        selections={
          <>
            {modalMode === "Delete" ? (
              <Alert status={AlertTypes.WARNING} title="Warning">
                Deleting attachment will remove it from all initiatives, stages
                and checkpoints below.
              </Alert>
            ) : null}
            <Dropdown
              name={"checkpoint"}
              label={"Which stage/checkpoint does this attachment apply to?"}
              options={checkpointAttachableOptions}
              value={checkpoint}
              onChange={(event) => setCheckpoint(event.target.value)}
              disabled={modalMode === "Delete"}
            />
          </>
        }
        saveToReport={handleFileAddDelete}
        deleteFromReport={deleteFromReport}
        actionButtonText={actionButtonText[modalMode]}
        modalHeading={modalHeading[modalMode]}
        uploadAreaHidden={modalMode === "Delete"}
        uploadedSubLabel={
          "These files have been attached to the stage and checkpoint selected above."
        }
        onModalSubmit={onModalSubmit}
      />
      <CommentModal
        modalDisclosure={{
          isOpen: isCommentsOpen,
          onClose: () => {
            setCommentsOpen(false);
          },
        }}
        updateElement={handleCommentSave}
        selectedFile={selectedFile}
        allFiles={attachments}
      />
    </Stack>
  );
};
