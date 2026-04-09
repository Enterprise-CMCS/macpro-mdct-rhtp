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
  const { state, pageId } = useParams();
  const { report, setAnswers } = useStore();
  const { autosave } = useContext(ReportAutosaveContext);
  const year = report?.year.toString();
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

  if (!state || !year || !pageId) {
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
    setTables(newTables);
    setFiles(getFilesFromTable(newTables, selection.checkpoints));
  }, [report]);

  const onCheckboxeHandler = (id: string) => {
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

  const onUploadDelete = (file: UploadListProp) => {
    writeToReport(file.fileId);
  };

  const writeToReport = (newValue: UploadListProp[] | string) => {
    if (!report) return;
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
    //setting an answer and saving are split, we have to run autosave after if we want it saved to the report
    setAnswerInElement<InitiativeAnswerProp[]>(
      report,
      "initiative-attachments",
      attachmentTableId,
      generateAnswer,
      setAnswers
    );
    autosave();
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
                          )!.checked
                        }
                        onChange={() => onCheckboxeHandler(row.id)}
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
                        onClick={() => downloadFile(year, state, row.file)}
                      >
                        {row.file.name}
                      </Button>
                    ) : (
                      "Not applicable"
                    )}
                  </Td>
                  <Td>
                    {"file" in row && row.file.fileId && (
                      <Button
                        variant="unstyled"
                        onClick={() => writeToReport(row.file.fileId)}
                        aria-label={`Remove ${row.file.name}`}
                      >
                        <Image src={cancelIcon} alt="Remove" />
                      </Button>
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
        year={year}
        answer={files}
        id={attachmentTableId}
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
        saveToReport={writeToReport}
        deleteFromReport={onUploadDelete}
      ></UploadModal>
    </Stack>
  );
};
