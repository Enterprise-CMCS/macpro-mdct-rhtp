import { Comment } from "@rhtp/shared";
import { Box, Heading, Text, Image, Flex } from "@chakra-ui/react";
import lockIcon from "assets/icons/icon_lock.svg";
import { TextField } from "@cmsgov/design-system";

export const PreviousComments = ({
  comments,
  userIsAdmin,
}: {
  comments: Comment[];
  userIsAdmin: boolean;
}) => {
  return (
    <Box marginTop={"spacer2"}>
      <Heading as={"h3"} fontWeight={"bold"}>
        Previous Comments
      </Heading>
      {comments.map((comment, index) => (
        <Box
          marginTop={"spacer4"}
          key={`previous-comment-${index}`}
          gap={"spacer1"}
          display="flex"
          alignItems="left"
          flexDirection="column"
        >
          <Flex alignItems={"center"} gap={"spacer2"}>
            <Text fontWeight={"heading_md"}>{comment.author}</Text>
            <Text fontSize={"heading_md"} color={"gray_dark"}>
              {new Date(comment.created).toLocaleString()}
            </Text>
          </Flex>

          {comment.statusChange && (
            <Text fontWeight={"body_sm"} color={"gray_dark"}>
              Status changed to: {comment.statusChange}
            </Text>
          )}
          {userIsAdmin &&
            (comment.isInternal ? (
              <Flex alignItems="center" gap="spacer1">
                <Image src={lockIcon} alt="lock icon" sx={sx.icon} />
                <Text fontWeight={"body_sm"} color={"gray_dark"}>
                  CMS Internal
                </Text>
              </Flex>
            ) : (
              <Text fontWeight={"body_sm"} color={"gray_dark"}>
                Shared with State
              </Text>
            ))}
          {comment.comment !== "" && (
            <TextField
              id={`previous-comment-${index}`}
              name={`previous-comment-${index}`}
              label={""}
              value={comment.comment}
              disabled={true}
              multiline
              style={
                {
                  "--text-input__background-color--disabled": comment.isInternal
                    ? "#e6f9fd"
                    : "",
                } as React.CSSProperties
              }
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

const sx = {
  icon: {
    boxSize: "16px",
  },
};
