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

const formatCheckpoints = (checkpoints: CheckpointShape[]) => {
  return checkpoints.map((checkpoint) => ({
    label: checkpoint.label,
    id: checkpoint.id,
    completed: false,
    ...(checkpoint.attachable && { attachments: [] }),
  }));
};

const checkpointOptions = (checkpoints: CheckpointShape[]) => {
  return {
    label: "Checkpoint #",
    options: checkpoints
      .filter((checkpoint) => checkpoint.attachable)
      .map((checkpoint) => ({ label: checkpoint.label, value: checkpoint.id })),
  };
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

  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue = answer ?? formatCheckpoints(checkpoints);
  const [displayValue, setDisplayValue] = useState(initialDisplayValue);
  const stageOption = {
    label: "Stage",
    options: [{ label: `${stage} ${label}`, value: id }],
  };

  const header = [
    "#",
    "Checkpoint",
    "Check if Complete",
    "Attachments",
    "Actions",
  ];

  const rows = [];
  for (var i = 0; i < displayValue.length; i++) {
    const { id, completed, label, attachments } = displayValue[i];
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

  const onChangeHandler = (id: string) => {
    const newValue = [...displayValue];
    for (var i = 0; i < newValue.length; i++) {
      if (newValue[i].id == id) newValue[i].completed = !newValue[i].completed;
    }
    updateElement({ answer: newValue });
  };

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
    <Flex gap="1.25rem" flexDirection="column">
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
                <Button variant="unstyled" onClick={() => removeAttachment()}>
                  <Image src={cancelIcon} alt="Remove" />
                </Button>
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
        dropdowns={[stageOption, checkpointOptions(checkpoints)]}
        saveToReport={saveToReport}
      ></UploadModal>
    </Flex>
  );
};
