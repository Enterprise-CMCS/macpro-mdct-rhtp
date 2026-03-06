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
import { downloadFile } from "utils/other/upload";
import { currentPageSelector } from "utils/state/selectors";

const formatCheckpoints = (checkpoints: CheckpointShape[]) => {
  return checkpoints.map((checkpoint) => ({
    label: checkpoint.label,
    id: checkpoint.id,
    completed: false,
    ...(checkpoint.attachable && { attachments: [] }),
  }));
};

const checkpointOptions = (stage: number, checkpoints: CheckpointShape[]) => {
  return {
    label: "Checkpoint #",
    options: checkpoints
      .map((checkpoint, index) => ({
        ...checkpoint,
        label: `${stage}.${index} ${checkpoint.label}`,
      }))
      .filter((checkpoint) => checkpoint.attachable)
      .map((checkpoint) => ({ label: checkpoint.label, value: checkpoint.id })),
  };
};

const buildRows = (stage: number, values: CheckpointAnswerShape[]) => {
  const rows = [];
  for (var i = 0; i < values.length; i++) {
    const { id, completed, label, attachments } = values[i];
    const stageNo = `${stage}.${i + 1}`;
    const row = {
      id,
      stageNo,
      completed,
      label,
    };
    if (attachments) {
      rows.push({ ...row, file: attachments[0] ?? {} });
      for (var j = 1; j < attachments.length; j++) {
        rows.push({
          id,
          stageNo: "",
          label: "",
          completed: undefined,
          file: attachments[j],
        });
      }
    } else {
      rows.push(row);
    }
  }

  return rows;
};

export const TableCheckpoint = (
  props: PageElementProps<TableCheckpointTemplate>
) => {
  const { id, checkpoints, label, stage, answer } = props.element;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { updateElement } = props;

  const { state } = useParams();
  const { report } = useStore();
  const year = report?.year.toString();
  const currentPage = useStore(currentPageSelector);

  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue = answer ?? formatCheckpoints(checkpoints);
  const [displayValue, setDisplayValue] = useState(initialDisplayValue);
  const stageOption = {
    label: "Stage",
    options: [{ label: `${stage} ${label}`, value: id }],
  };

  // console.log(currentPage);

  const header = [
    "#",
    "Checkpoint",
    "Check if Complete",
    "Attachments",
    "Actions",
  ];

  const rows = buildRows(stage, displayValue);

  const onChangeHandler = (id: string) => {
    const newValue = [...displayValue];
    for (var i = 0; i < newValue.length; i++) {
      if (newValue[i].id == id) newValue[i].completed = !newValue[i].completed;
    }
    updateElement({ answer: newValue });
  };

  /** TO DO: Add function once upload delete is working */
  const removeAttachment = () => {};

  const onModalClose = () => {
    setModalOpen(false);
  };

  const saveToReport = (uploads: UploadListProp[], options: string[]) => {
    const newValue = [...displayValue];
    const checkpoint = newValue.findIndex((value) => value.id == options[1]);

    if (checkpoint >= 0) {
      newValue[checkpoint].attachments = uploads;
      updateElement({ answer: newValue });
    }
  };

  if (!state || !year) {
    console.error("Can't retrieve uploads with missing state or year");
    return;
  }

  return (
    <Flex gap="1.25rem" flexDirection="column" width="100%">
      <Label>{`Stage ${stage}: ${label}`}</Label>
      <Text>To upload attachments, click the button below.</Text>
      <Button
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
          {rows.map((row, index) => (
            <Tr>
              <Td>{row.stageNo}</Td>
              <Td>{row.label}</Td>
              <Td>
                {row.completed != undefined ? (
                  <Checkbox
                    isChecked={row.completed}
                    onChange={() => onChangeHandler(row.id)}
                  ></Checkbox>
                ) : (
                  <></>
                )}
              </Td>
              <Td>
                {"file" in row ? (
                  <Button
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
                  <Button variant="unstyled" onClick={() => removeAttachment()}>
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
        answer={[]}
        id={"test"}
        dropdowns={[stageOption, checkpointOptions(stage, checkpoints)]}
        saveToReport={saveToReport}
      ></UploadModal>
    </Flex>
  );
};
