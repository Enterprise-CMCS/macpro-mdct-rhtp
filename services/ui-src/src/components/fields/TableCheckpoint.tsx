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
  Text,
  Flex,
} from "@chakra-ui/react";
import {
  DropdownOptions,
  ElementType,
  InitiativeAnswerProp,
  TableCheckpointTemplate,
  UploadListProp,
} from "types";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import addIconPrimary from "assets/icons/add/icon_add_blue.svg";
import commentIcon from "assets/icons/comment/icon_comment.svg";
import { Dropdown, Label } from "@cmsgov/design-system";
import { useContext, useEffect, useState } from "react";
import { UploadModal } from "components/modals/UploadModal";
import { useParams } from "react-router";
import { useStore } from "utils";
import { downloadFile } from "utils/other/upload";
import { checkpointsList } from "verbiage/checkpoints";
import { ReportAutosaveContext } from "components/report/ReportAutosaveProvider";
import { PageElementProps } from "components/report/Elements";
import { setAnswerInElement } from "utils/state/reportLogic/reportActions";
import { attachmentTableId } from "../../constants";
import { CommentModal } from "components/modals/CommentModal";

type TableShape = {
  stage: number;
  label: string;
  checkpoints: {
    id: string;
    label: string;
    attachable: boolean;
  }[];
  rows: {
    id: string;
    stageNo: string;
    label: string;
    file: { name: string; fileId: string; size: number };
  }[];
};

/** Formatting the the data from the elements into renderable rows for the table */
const buildRows = (
  stage: number,
  values: {
    label: string;
    id: string;
    attachments: UploadListProp[] | undefined;
  }[]
) => {
  return values.reduce((prev: any[], curr, index) => {
    const { id, label, attachments } = curr;
    const row = {
      id,
      stageNo: `${stage}.${index + 1}`,
      label,
    };
    if (attachments) {
      const copy = [...attachments];
      prev.push({ ...row, file: copy.shift() ?? {} });
      copy.forEach((file) =>
        prev.push({ id, stageNo: "", label: "", completed: undefined, file })
      );
    } else {
      prev.push(row);
    }
    return prev;
  }, []);
};

const buildTables = (answers: InitiativeAnswerProp[]) => {
  return checkpointsList.map((list) => {
    const { stage, label, checkpoints, id } = list;
    const values = checkpoints.map((checkpoint) => {
      const files = answers
        .filter(
          (answer) =>
            answer.stage === id && answer.checkpoints === checkpoint.id
        )
        .map((upload) => upload.attachment);
      return {
        label: checkpoint.label,
        id: checkpoint.id,
        attachments: checkpoint.attachable ? files : undefined,
      };
    });
    const rows = buildRows(stage, values);
    return { stage, label, checkpoints, rows };
  });
};

const getFilesFromTable = (tables: TableShape[], checkpoints: string) => {
  return tables
    .flatMap((tables) => tables.rows)
    .filter((row) => row.id === checkpoints && row.file.fileId)
    .map((filter) => filter.file);
};

const header = [
  "#",
  "Checkpoint",
  "Check if Complete",
  "Attachments",
  "Actions",
];

export const TableCheckpoint = (
  props: PageElementProps<TableCheckpointTemplate>
) => {
  const { answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isCommentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<UploadListProp>();
  const { state, pageId } = useParams();
  const { report, setAnswers } = useStore();
  const { id, type: reportType } = report!;
  const { autosave } = useContext(ReportAutosaveContext);
  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue =
    answer ??
    checkpointsList.flatMap((list) =>
      list.checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        checked: false,
      }))
    );
  const [tables, setTables] = useState<TableShape[]>([]);
  const [stageOption, setStageOption] = useState<DropdownOptions[]>([]);
  const [checkpointOption, setCheckpointOption] = useState<DropdownOptions[]>(
    []
  );
  const [selection, setSelection] = useState<{
    stage: string;
    checkpoints: string;
  }>({ stage: "", checkpoints: "" });
  const [files, setFiles] = useState<UploadListProp[]>([]);
  const [attachments, setAttachments] = useState<InitiativeAnswerProp[]>([]);

  if (!state || !id || !reportType || !pageId) {
    console.error("Can't retrieve uploads with missing state, year or id");
    return;
  }

  //This is for generating the stage options when the page loads
  useEffect(() => {
    setStageOption(
      checkpointsList.map((checks) => ({
        label: `${checks.stage} ${checks.label}`,
        value: checks.id,
      }))
    );
  }, []);

  //This populates the uploaded area of the uploads modal when the dropdown selection has changed
  useEffect(() => {
    const { checkpoints } = selection;
    setFiles(getFilesFromTable(tables, checkpoints));
  }, [selection]);

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
    setFiles(getFilesFromTable(newTables, selection.checkpoints));
  }, [report]);

  const onCheckboxHandler = (id: string) => {
    const newValue = [...initialDisplayValue];
    const checkbox = newValue.find((value) => value.id === id);
    if (checkbox) checkbox.checked = !checkbox.checked;
    props.updateElement({ answer: newValue });
  };

  const onChangeHandler = (stageId: string) => {
    const checkpoints =
      checkpointsList
        .find((checks) => checks.id === stageId)
        ?.checkpoints.filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id })) ?? [];

    setCheckpointOption(checkpoints);
    setSelection({ stage: stageId, checkpoints: checkpoints[0].value });
  };

  const formatUploads = (uploads: UploadListProp[]) => {
    return uploads.map((file) => ({
      initiatives: [pageId],
      ...selection,
      comments: [],
      attachment: file,
      status: "Under Review", //TODO: update status when status has been added to initiatives
    }));
  };

  const deleteFromReport = (file: UploadListProp) => {
    handleFileAddDelete(file.fileId);
  };

  const onCommentClick = (file: UploadListProp) => {
    setSelectedFile(file);
    setCommentsOpen(true);
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
        const index = answer.findIndex(
          (item) => item.attachment.fileId == newValue
        );
        const newInitiatives = answer[index].initiatives.filter(
          (id) => id != pageId
        );
        answer[index].initiatives = newInitiatives;
        return [...answer];
      } else {
        return [...answer, ...formatUploads(newValue)];
      }
    };
    writeToAttachmentsTable(generateAnswer);
  };

  return (
    <Stack gap="1.25rem" width="100%">
      {tables.map((table, tableIndex) => (
        <Stack key={`checkpoint-${tableIndex}`} gap="1.25rem">
          <Label>{`Stage ${table.stage}: ${table.label}`}</Label>
          <Text>To upload attachments, click the button below.</Text>
          <Button
            aria-label="Upload attachments"
            variant="outline"
            alignSelf="flex-start"
            leftIcon={<Image src={addIconPrimary} />}
            onClick={() => {
              setModalOpen(true);
              onChangeHandler(stageOption[tableIndex].value);
            }}
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
                          onClick={() => handleFileAddDelete(row.file.fileId)}
                          aria-label={`Remove ${row.file.name} from checkpoint ${row.label}`}
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
        state={state}
        answer={files}
        id={id}
        reportType={reportType}
        selections={
          <>
            <Dropdown
              name={"stage"}
              label={"Stage"}
              options={stageOption}
              value={selection?.stage}
              onChange={(event) => onChangeHandler(event.target.value)}
            ></Dropdown>
            <Dropdown
              name={"checkpoint"}
              label={"Checkpoint #"}
              options={checkpointOption}
              value={selection?.checkpoints}
              onChange={(dropdown) => {
                const value = dropdown.target.value;
                setSelection({ ...selection, checkpoints: value });
              }}
            ></Dropdown>
          </>
        }
        saveToReport={handleFileAddDelete}
        deleteFromReport={deleteFromReport}
      ></UploadModal>
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
        disabled={props.disabled}
      />
    </Stack>
  );
};
