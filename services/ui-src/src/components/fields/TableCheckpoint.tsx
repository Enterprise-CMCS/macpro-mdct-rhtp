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
  CheckpointAnswerShape,
  CheckpointShape,
  TableCheckpointTemplate,
  UploadListProp,
} from "types";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { Label } from "@cmsgov/design-system";
import { useState } from "react";
import { UploadModal } from "components/modals/UploadModal";
import { useParams } from "react-router-dom";
import { useStore } from "utils";
import {
  downloadFile,
  removeFile,
  retrieveUploadedFiles,
} from "utils/other/upload";

/** This builds a default data structure for the checkpoint table if there's no answer set */
const formatCheckpoints = (checkpoints: CheckpointShape[]) => {
  return checkpoints.map((checkpoint) => ({
    label: checkpoint.label,
    id: checkpoint.id,
    completed: false,
    ...(checkpoint.attachable && { attachments: [] }),
  }));
};

/** Builds the dropdowns for the checkpoint in the uploads modal */
const uploadDropdownOptions = (
  id: string,
  stage: number,
  label: string,
  checkpoints: CheckpointShape[]
) => {
  return [
    {
      label: "Stage",
      options: [{ label: `${stage} ${label}`, value: id }],
    },
    {
      label: "Checkpoint #",
      options: checkpoints
        .map((checkpoint, index) => ({
          ...checkpoint,
          label: `${stage}.${index + 1} ${checkpoint.label}`,
        }))
        .filter((checkpoint) => checkpoint.attachable)
        .map((checkpoint) => ({
          label: checkpoint.label,
          value: checkpoint.id,
        })),
    },
  ];
};

/** Formatting the the data from the elements into renderable rows for the table */
const buildRows = (stage: number, values: CheckpointAnswerShape[]) => {
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
  const { id, checkpoints, label, stage, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();

  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue = answer ?? formatCheckpoints(checkpoints);
  const [uploadId, setUploadId] = useState<string>(initialDisplayValue[0].id);
  const [files, setFiles] = useState<UploadListProp[]>(
    initialDisplayValue[0].attachments ?? []
  );

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  const rows = buildRows(stage, initialDisplayValue);

  const onCheckboxeHandler = (id: string) => {
    const newValue = [...initialDisplayValue];
    for (var i = 0; i < newValue.length; i++) {
      if (newValue[i].id == id) newValue[i].completed = !newValue[i].completed;
    }
    props.updateElement({ answer: newValue });
  };

  const onDropdownHandler = (change: string) => {
    setUploadId(change);
    if (answer) {
      const data = answer.filter((data) => data.id === change);
      if (data.length > 0) {
        setFiles(data[0].attachments ?? []);
      }
    }
  };

  const onModalClose = () => {
    setModalOpen(false);
  };

  const saveToReport = (uploads: UploadListProp[], dropdownValue: string) => {
    const newValue = [...initialDisplayValue];
    const checkpoint = newValue.findIndex((value) => value.id == dropdownValue);

    if (checkpoint !== -1) {
      newValue[checkpoint].attachments = uploads;
      props.updateElement({ answer: newValue });
      setFiles(newValue[checkpoint].attachments);
    }
  };

  const removeAttachment = async (file: UploadListProp) => {
    const onRemove = () =>
      retrieveUploadedFiles(year, state, uploadId).then((response) => {
        saveToReport(response, uploadId);
      });
    await removeFile(file, year, state, onRemove);
  };

  return (
    <Flex gap="1.25rem" flexDirection="column" width="100%">
      <Label>{`Stage ${stage}: ${label}`}</Label>
      <Text>To upload attachments, click the button below.</Text>
      <Button
        aria-label="Upload attachments"
        variant="outline"
        alignSelf="flex-start"
        onClick={() => setModalOpen(true)}
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
          {rows.map((row) => (
            <Tr>
              <Td>{row.stageNo}</Td>
              <Td>{row.label}</Td>
              <Td>
                {row.completed != undefined ? (
                  <Checkbox
                    aria-label={`Check if ${row.label} is complete`}
                    isChecked={row.completed}
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
      <UploadModal
        modalDisclosure={{
          isOpen: isModalOpen,
          onClose: onModalClose,
        }}
        state={state}
        year={year}
        answer={files}
        id={uploadId}
        dropdowns={uploadDropdownOptions(id, stage, label, checkpoints)}
        onChangeExpanded={onDropdownHandler}
        saveToReport={saveToReport}
      ></UploadModal>
    </Flex>
  );
};
