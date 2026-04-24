# Report Schema

This document is a detailed look at the structure and fields of RHTP reports.
For a more general overview, see [ReportDataStructure.md](./ReportDataStructure.md).

## Kafka Topics

The RHTP report has a Kafka topic that receives messages when the data changes:

`aws.mdct.rhtp.rhtp-reports.v0`

In ephemeral development environments, each topic name is prefixed.
For example: `--rhtp--my-branch-name--aws.mdct.rhtp.rhtp-reports.v0`

## Report fields

- `id` (string): A [K-Sortable Unique Identifier](https://github.com/segmentio/ksuid?tab=readme-ov-file#what-is-a-ksuid) for this report.
- `state` (string): Two-letter abbreviation for the associated U.S. state or territory.
- `created` (number): Timestamp for report creation. Milliseconds since epoch.
- `lastEdited` (number): Timestamp for report modification. Milliseconds since epoch.
- `lastEditedBy` (string): The full name of the modifying user.
- `lastEditedByEmail` (string): The email of the modifying user.
- `type` (string): The type of the report ("RHTP")
- `subType` (string): One of "ANNUAL", "QUARTERLY", or "FINAL".
- `subTypeKey` (string): Ex: "A1" for "Annual Report 1". A key associated with data for determining report information.
- `budgetPeriod` (number): Range 1-5 corresponding to RHTP report budget periods.
- `status` (string): "Not started", "In progress", or "Submitted"
- `name` (string): The system assigned name for the report, based on state, report type, and reporting period.
  Ex: `PA - Annual Report 1 - 12/29/2025-7/31/2026`
- `year` (number): The year for which data is being reported.
- `submissionCount` (number): Incremented by calls to the Submit API endpoint.
- `pages` (object[]): Contains all question and answer data for this report.

Post submission the following fields get added:

- `submitted` (number): Timestamp for report submission. Milliseconds since epoch.
- `submittedBy` (string): The full name of the submitting user.
- `submittedByEmail` (string): The email of the submitting user.
- `submissionDates` (object[]): Contains all timestamps on which the report was submitted.
  Milliseconds since epoch. Size of array equates to value of `submissionCount`.

## Page fields

Each object in the `report.pages` array represents a screen that the users see,
except one: each report has a special "root" page used only to indicate the order of page IDs.
Thus, the order of the `report.pages` array is largely irrelevant;
instead, the frontend does a depth-first traversal of a logical tree structure.

The root page has two properties:

- `id` (string): always the exact string "root".
- `childPageIds` (string[]): The `page.id` values of other pages in the report.

The remaining pages will have more properties:

- `id` (string): Identifier, unique within this report (but not across reports).
- `title` (string): The title of the page, as displayed to the user
- `type` (string): One of "standard", "modal", or "reviewSubmit".
- `elements` (object[]): Contains all question and answer data for this page.
- `sidebar` (boolean, optional): If not `true`,
  the navigation sidebar will not be displayed on this page.
- `status` (string, optional): One of "Not started", "In progress", "Abandoned", or "Complete". Used only for Initiative pages.
- `hideNavButtons` (boolean, optional): If `true`,
  the usual previous/next buttons will not be displayed on this page.
  Usually only `true` for the Review & Submit page.
- `submittedView` (object[], optional): A separate array of page elements,
  used only on the Review & Submit page, after the report has been submitted.
- `initiativeNumber` (number): A number corresponding to the state-specific initiative. Only applicable to initiative pages.

## Element fields

Each object in the `page.elements` array represents something that the user sees.
Some are presentational, some are inputs or groups of related inputs, and some
are placeholders for report status and navigation aids.

Element objects have varying shapes, but some fields are common:

- `type` (string): Indicates this element's role and dictates its shape.
- `id` (string): An identifier. Should always be unique _within a page_,
  but IDs may be reused for elements on different pages.
- `answer` (varies, optional): If this element accepts user input,
  that input will be stored in the `answer` property.
  - Different elements have different answer types: string, number, object...
  - If an element has not been completed by a user
    this may be absent or undefined.
  - For inputs with more complex answer types
    any sub-field of the answer may be undefined.

Here is the complete list of element types, roughly categorized:

- Presentational elements:
  - `header`: Renders an `<h1>`.
  - `subHeader`: Renders an `<h2>`.
  - `accordion`: Renders a disclosure widget, closed by default.
    Often used to provide detailed reporting instructions.
  - `paragraph`: Renders a `<p>`.
  - `divider`: Renders an `<hr>`
  - `submissionParagraph`: If the current report has been submitted,
    displays the submission date and submitter name.
  - `statusAlert`: May display an informational banner:
    - When on a measure page, displays if the measure has been completed.
    - When on the Review & Submit page, displays if the report is incomplete.
- Navigational elements:
  - `buttonLink`: Renders a link, with the appearance of a button.
  - `statusTable`: Renders a list of other pages on the report,
    showing the completion status of each.
    - This appears in every report, on the last page ("Review & Submit").
- Simple input elements:
  - `textbox`: A one-line text input field. Answer is a string.
  - `textAreaField`: A multi-line text input field. Answer is a string.
  - `numberField`: A text input field, with number parsing & masking.
    Answer is a number.
  - `date`: A text input field, with date parsing & masking.
    Answer is a string, with format `MM/dd/yyyy`.
  - `dropdown`: A select/combobox field.
    - The `options` property is a `{ label: string, value: string }[]`.
    - The answer is a string (the `value` of an option).
  - `radio`: A set of radio buttons.
    - The options and answer work as they do for `dropdown`
    - But beside `label` and `value`, there may be a `checkedChildren` property.
      This will be an array of elements, shown only if that option is selected.
  - `checkbox`: A set of checkboxes.
    - The options work just like they do for `radio`
    - Answer is a string array.
  - `attachmentArea`: A display box for uploading files.
- Grouped input elements:
  - `listInput`: Allows the user to enter a list.
    - Renders as a textbox with an "add" button.
    - Answer is a string array.
- Presentational-input elements:
  - `initiativesTable`: Table for displaying all initiatives with links to their individual pages.
  - `tableCheckpoint`: Table for displaying initiative checkpoints.
  - `accordionGroup`: Accordions containing input elements.
  - `useOfFundsTable`: Table for displaying use of funds information.
  - `attachmentTable`: Table for displaying uploaded files.
  - `actionTable`: Table for displaying inputs as row elements.

### Completion Logic

Generally, a page is complete if all of its elements are complete.
An element is complete if it has an answer or is not required.
(None of the presentational elements are required).
