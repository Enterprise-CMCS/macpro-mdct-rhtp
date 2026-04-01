import { ElementType, PageType } from "@rhtp/shared";
import {
  getDropdownOptions,
  STATE_POLICY_COMMITMENT_NAMES,
} from "../constants";
import { buildStatePolicyCommitments } from "../state-policy-commitments";

const sampleCommitmentName = STATE_POLICY_COMMITMENT_NAMES[0];

describe("test state policy commitment functions", () => {
  test("buildStatePolicyCommitments()", () => {
    const page = buildStatePolicyCommitments("PA");
    expect(page).toEqual(
      // expected page
      expect.objectContaining({
        id: "state-policy-commitments",
        title: "State Policy Commitments",
        type: PageType.Standard,
        sidebar: true,
        // expected elements
        elements: expect.arrayContaining([
          expect.objectContaining({
            type: ElementType.AccordionGroup,
            id: "state-policy-commitments-group",
            // expected accordion groups
            accordions: expect.arrayContaining([
              expect.objectContaining({
                label: sampleCommitmentName,
                // expected accordion fields
                children: expect.arrayContaining([
                  expect.objectContaining({
                    type: ElementType.Dropdown,
                    id: "commitment-status",
                    label: "Current Status",
                    // expected dropdown options
                    options: expect.arrayContaining([
                      { label: "Not yet started", value: "Not yet started" },
                      {
                        label: "Commitment abandoned",
                        value: "Commitment abandoned",
                      },
                    ]),
                  }),
                ]),
              }),
            ]),
            required: true,
          }),
        ]),
      })
    );
  });

  test.each(STATE_POLICY_COMMITMENT_NAMES)(
    "getDropdownOptions() returns two options minimum for all commitments",
    (commitmentName) => {
      const options = getDropdownOptions(commitmentName);
      expect(options).toEqual(
        // all known commitments have these options
        expect.arrayContaining([
          { label: "Not yet started", value: "Not yet started" },
          {
            label: "Commitment abandoned",
            value: "Commitment abandoned",
          },
        ])
      );
    }
  );

  test("getDropdownOptions() for unknown name returns empty array", () => {
    const options = getDropdownOptions("test does not exist");
    expect(options).toEqual([]);
  });
});
