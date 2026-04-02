import {
  Flex,
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
import { PageElementProps } from "components/report/Elements";
import {
  InitiativeAnswerProp,
  TableCheckpointTemplate,
  UploadListProp,
} from "types";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { Dropdown, Label } from "@cmsgov/design-system";
import { useEffect, useState } from "react";
import { UploadModal } from "components/modals/UploadModal";
import { useParams } from "react-router-dom";
import { useStore } from "utils";
import { downloadFile, Options } from "utils/other/upload";
import { checkpointsList } from "verbiage/checkpoints";

/** Formatting the the data from the elements into renderable rows for the table */
const buildRows = (
  stage: number,
  values: {
    label: string;
    id: string;
    completed: boolean;
    attachments: UploadListProp[] | undefined;
  }[]
) => {
  return values.reduce((prev: any[], curr, index) => {
    const { id, completed, label, attachments } = curr;
    const row = {
      id,
      stageNo: `${stage}.${index + 1}`,
      completed,
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
        completed: false,
        attachments: checkpoint.attachable ? files : undefined,
      };
    });
    const rows = buildRows(stage, values);
    return { stage, label, checkpoints, rows };
  });
};

const header = [
  "#",
  "Checkpoint",
  "Check if Complete",
  "Attachments",
  "Actions",
];

type TableShape = {
  stage: number;
  label: string;
  checkpoints: {
    id: string;
    label: string;
    attachable: boolean;
  }[];
  rows: any[];
};

export const TableCheckpoint = (
  props: PageElementProps<TableCheckpointTemplate>
) => {
  console.log(props);

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { state, pageId } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();
  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue = checkpointsList.flatMap((list) =>
    list.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      completed: false,
    }))
  );
  const uploadId = "initiative-attachments-table";
  const [tables, setTables] = useState<TableShape[]>([]);
  const [stageOption, setStageOption] = useState<Options[]>([]);
  const [checkpointOption, setCheckpointOption] = useState<Options[]>([]);
  const [selection, setSelection] = useState<{
    stage: string;
    checkpoint: string;
  }>({ stage: "", checkpoint: "" });
  const [files, setFiles] = useState<UploadListProp[]>([]);

  if (!state || !year || !pageId) {
    console.error("Can't retrieve uploads with missing state, year or id");
    return;
  }

  useEffect(() => {
    const attachments = report?.pages
      .flatMap((page) => page.elements)
      .find((element) => element?.type === "attachmentTable")?.answer;

    const files =
      attachments?.filter((data) => data.initiatives.includes(pageId)) ?? [];

    setTables(buildTables(files));

    setStageOption(
      checkpointsList.map((checks) => ({
        label: `${checks.stage} ${checks.label}`,
        value: checks.id,
      }))
    );
    setCheckpointOption(
      checkpointsList[0].checkpoints
        .filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id }))
    );
    setSelection({
      stage: checkpointsList[0].id,
      checkpoint: checkpointsList[0].checkpoints[0].id,
    });
  }, []);

  useEffect(() => {
    const { checkpoint } = selection;
    const filtered = tables
      .flatMap((tables) => tables.rows)
      .filter((row) => row.id === checkpoint && row.file.fileId)
      .map((filter) => filter.file);

    setFiles(filtered);
  }, [selection]);

  const onCheckboxeHandler = (id: string) => {
    const newValue = [...initialDisplayValue];
    for (var i = 0; i < newValue.length; i++) {
      if (newValue[i].id == id) newValue[i].completed = !newValue[i].completed;
    }
  };

  const onChangeHandler = (value: string) => {
    const checkpoints =
      checkpointsList
        .find((checks) => checks.id === value)
        ?.checkpoints.filter((checks) => checks.attachable)
        .map((check) => ({ label: check.label, value: check.id })) ?? [];

    setCheckpointOption(checkpoints);
    setSelection({ stage: value, checkpoint: checkpoints[0].value });
  };

  const onModalClose = () => {
    setModalOpen(false);
  };

  const saveToReport = (uploads: UploadListProp[]) => {
    console.log(uploads);
  };

  const removeAttachment = async (file: UploadListProp) => {
    console.log(file);
  };

  return (
    <Flex gap="1.25rem" flexDirection="column" width="100%">
      {tables.map((table, tableIndex) => (
        <>
          <Label>{`Stage ${table.stage}: ${table.label}`}</Label>
          <Text>To upload attachments, click the button below.</Text>
          <Button
            aria-label="Upload attachments"
            variant="outline"
            alignSelf="flex-start"
            onClick={() => {
              setModalOpen(true);
              onChangeHandler(stageOption[tableIndex].value);
            }}
          >
            Upload attachments
          </Button>
          <Table variant="metric">
            <Thead>
              <Tr>
                {header.map((item) => (
                  <Th>{item}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {table.rows.map((row) => (
                <Tr>
                  <Td>{row.stageNo}</Td>
                  <Td>{row.label}</Td>
                  <Td>
                    {row.label != "" ? (
                      <Checkbox
                        aria-label={`Check if ${row.label} is complete`}
                        isChecked={false}
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
                        onClick={() => removeAttachment(row.file)}
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
        </>
      ))}
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        state={state}
        year={year}
        answer={files}
        id={uploadId}
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
              value={selection?.checkpoint}
              onChange={(dropdown) => {
                const value = dropdown.target.value;
                setSelection({ ...selection, checkpoint: value });
              }}
            ></Dropdown>
          </>
        }
        saveToReport={saveToReport}
      ></UploadModal>
    </Flex>
  );
};
