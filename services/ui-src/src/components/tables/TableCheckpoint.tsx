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
import { CheckpointShape, TableCheckpointTemplate } from "types";
import cancelIcon from "assets/icons/cancel/icon_cancel_primary.svg";
import { Label } from "@cmsgov/design-system";
import { useState } from "react";

const formatCheckpoints = (checkpoints: CheckpointShape[]) => {
  return checkpoints.map((checkpoint) => ({
    label: checkpoint.label,
    id: checkpoint.id,
    completed: false,
  }));
};

export const TableCheckpoint = (
  props: PageElementProps<TableCheckpointTemplate>
) => {
  const { checkpoints, label, stage, answer } = props.element;

  //if there is answer on load, we need to build the shape from the checkpoints data
  const initialDisplayValue = answer ?? formatCheckpoints(checkpoints);
  const [displayValue, setDisplayValue] = useState(initialDisplayValue);

  const header = [
    "#",
    "Checkpoint",
    "Check if Complete",
    "Attachments",
    "Actions",
  ];

  const onChangeHandler = (id: string) => {
    const newValue = [...displayValue];
    for (var i = 0; i < newValue.length; i++) {
      if (newValue[i].id == id) newValue[i].completed = !newValue[i].completed;
    }
    props.updateElement({ answer: newValue });
  };

  return (
    <Flex gap="1.25rem" flexDirection="column">
      <Label>{`Stage ${stage}: ${label}`}</Label>
      <Text>To upload attachments, click the button below.</Text>
      <Button variant="outline" alignSelf="flex-start">
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
          {displayValue.map((checkpoint, index) => (
            <Tr>
              <Td>
                {stage}.{index + 1}
              </Td>
              <Td>{checkpoint.label}</Td>
              <Td>
                <Checkbox
                  isChecked={checkpoint.completed}
                  onChange={() => onChangeHandler(checkpoint.id)}
                ></Checkbox>
              </Td>
              <Td>fake attachment</Td>
              <Td>
                <Button variant="unstyled">
                  <Image src={cancelIcon} alt="Remove" />
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
