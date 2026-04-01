// oxlint-disable unicorn/no-useless-switch-case
// disabling this rule so we explicitly see how each commitment maps

export const STATE_POLICY_COMMITMENT_NAMES = [
  "B.2. Presidential Fitness Test",
  "B.3. SNAP Food Restriction Waiver Policy",
  "B.4. Nutrition Continuing Medical Education",
  "C.3. Overall CON Score",
  "C.3. CON - Behavioral Outpatient",
  "C.3. CON - Medical Outpatient",
  "C.3. CON - Behavioral Inpatient",
  "C.3. CON - Imaging",
  "C.3. CON - Long-term Care Facilities",
  "C.3. CON - Ancillaries",
  "C.3. CON - Other",
  "D.2. Physician - Medical Licensure Compact",
  "D.2. Nurse - Nurse Licensure Compact",
  "D.2. Psychology - PSYPACT",
  "D.2. Physician Assistant - PA Compact",
  "D.2. EMS - EMS Compact",
  "D.3. Dental Hygienist - Dental Hygiene Diagnosis",
  "D.3. Dental Hygienist - Prescriptive Authority",
  "D.3. Dental Hygienist - Supervision of Dental Assistants",
  "D.3. Dental Hygienist - Direct Medicaid Reimbursement",
  "D.3. Dental Hygienist - Dental Hygiene Treatment Planning",
  "D.3. Dental Hygienist - Provision of Sealants",
  "D.3. Dental Hygienist - Direct Access to Prophylaxis",
  "D.3. PA - Scope of Practice",
  "D.3. NP - Scope of Practice",
  "D.3. Pharmacist - Overall Score",
  "D.3. Pharmacist - Drug Administration",
  "D.3. Pharmacist - Lab Testing",
  "D.3. Pharmacist - Independent Prescribing",
  "D.3. Dental Hygienist - Overall Score",
  "D.3. Dental Hygienist - Local Anesthesia",
  "E.3. Short-term, limited-duration insurance (STLDI)",
  "F.1. Medicaid Payment for Store and Forward",
  "F.1. Medicaid Payment for Remote Patient Monitoring (RPM)",
  "F.1. In-State Licensing Requirement Exception",
  "F.1. Medicaid Payment for at Least One Form of Live Video",
  "F.1. Telehealth License/Registration Process (including special licenses)",
];

export const getDropdownOptions = (label: string) => {
  switch (label) {
    case "B.3. SNAP Food Restriction Waiver Policy":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "0 Points: No pending State legislation",
          value: "0 Points: No pending State legislation",
        },
        {
          label: "25 Points: Active bill in the State legislative process",
          value: "25 Points: Active bill in the State legislative process",
        },
        {
          label: "50 Points: State bill was passed to submit a USDA waiver",
          value: "50 Points: State bill was passed to submit a USDA waiver",
        },
        {
          label: "75 Points: Waiver is in processing with USDA",
          value: "75 Points: Waiver is in processing with USDA",
        },
        {
          label: "100 Points: USDA approved waiver",
          value: "100 Points: USDA approved waiver",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "B.4. Nutrition Continuing Medical Education":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "0 Points: No pending State legislation",
          value: "0 Points: No pending State legislation",
        },
        {
          label:
            "25 Points: Active bill in the State legislative process or regulation proposed",
          value:
            "25 Points: Active bill in the State legislative process or regulation proposed",
        },
        {
          label:
            "75 Points: State bill passed or regulation finalized but not yet implemented",
          value:
            "75 Points: State bill passed or regulation finalized but not yet implemented",
        },
        {
          label: "100 Points: Requirement in place and enforced",
          value: "100 Points: Requirement in place and enforced",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "C.3. Overall CON Score":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: Score of 100 on Cicero report methodology",
          value: "0 Points: Score of 100 on Cicero report methodology",
        },
        {
          label: "25 Points: Score of 80-99 on Cicero report methodology",
          value: "25 Points: Score of 80-99 on Cicero report methodology",
        },
        {
          label: "50 Points: Score of 45-79 on Cicero report methodology",
          value: "50 Points: Score of 45-79 on Cicero report methodology",
        },
        {
          label: "75 Points: Score of 1-44 on Cicero report methodology",
          value: "75 Points: Score of 1-44 on Cicero report methodology",
        },
        {
          label: "100 Points: Score of 0 on Cicero report methodology",
          value: "100 Points: Score of 0 on Cicero report methodology",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "C.3. CON - Behavioral Outpatient":
    case "C.3. CON - Medical Outpatient":
    case "C.3. CON - Behavioral Inpatient":
    case "C.3. CON - Imaging":
    case "C.3. CON - Long-term Care Facilities":
    case "C.3. CON - Ancillaries":
    case "C.3. CON - Other":
      return [
        { label: "Not yet started", value: "Not yet started" },
        { label: "In progress", value: "In progress" },
        { label: "CON restriction removed", value: "CON restriction removed" },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.2. Physician - Medical Licensure Compact":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label:
            "0 Points: Not a Member State and no pending State legislation",
          value:
            "0 Points: Not a Member State and no pending State legislation",
        },
        {
          label: "50 Points: IMLC member State issuing non-SPL licenses",
          value: "50 Points: IMLC member State issuing non-SPL licenses",
        },
        {
          label: "50 Points: Legislation introduced to become SPL",
          value: "50 Points: Legislation introduced to become SPL",
        },
        {
          label: "75 Points: IMLC passed; implementation phase",
          value: "75 Points: IMLC passed; implementation phase",
        },
        {
          label: "100 Points: IMLC member state serving as SPL",
          value: "100 Points: IMLC member state serving as SPL",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.2. Nurse - Nurse Licensure Compact":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label:
            "0 Points: Not a Member State and no pending State legislation",
          value:
            "0 Points: Not a Member State and no pending State legislation",
        },
        {
          label: "50 Points: Pending NLC legislation",
          value: "50 Points: Pending NLC legislation",
        },
        {
          label: "75 Points: NLC legislation enacted",
          value: "75 Points: NLC legislation enacted",
        },
        {
          label: "100 Points: NLC state",
          value: "100 Points: NLC state",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.2. Psychology - PSYPACT":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "0 Points: non-PSYPACT participating",
          value: "0 Points: non-PSYPACT participating",
        },
        {
          label: "50 Points: PSYPACT legislation introduced",
          value: "50 Points: PSYPACT legislation introduced",
        },
        {
          label: "75 Points: enacted PSYPACT legislation",
          value: "75 Points: enacted PSYPACT legislation",
        },
        {
          label: "100 Points: PSYPACT participating",
          value: "100 Points: PSYPACT participating",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.2. Physician Assistant - PA Compact":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label:
            "0 Points: No active legislation to become a PA Compact member",
          value:
            "0 Points: No active legislation to become a PA Compact member",
        },
        {
          label: "50 Points: Legislation filed to become a PA Compact member",
          value: "50 Points: Legislation filed to become a PA Compact member",
        },
        {
          label: "100 Points: Legislation enacted",
          value: "100 Points: Legislation enacted",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. PA - Scope of Practice":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: Reduced Scope of Practice",
          value: "0 Points: Reduced Scope of Practice",
        },
        {
          label: "50 Points: Moderate Scope of Practice",
          value: "50 Points: Moderate Scope of Practice",
        },
        {
          label: "75 Points: Advanced Scope of Practice",
          value: "75 Points: Advanced Scope of Practice",
        },
        {
          label: "100 Points: Optimal Scope of Practice",
          value: "100 Points: Optimal Scope of Practice",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. NP - Scope of Practice":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: Restricted Scope of Practice",
          value: "0 Points: Restricted Scope of Practice",
        },
        {
          label: "50 Points: Reduced Scope of Practice",
          value: "50 Points: Reduced Scope of Practice",
        },
        {
          label: "100 Points: Full Scope of Practice",
          value: "100 Points: Full Scope of Practice",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. Pharmacist - Overall Score":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: 0-3 score based on Cicero report methodology",
          value: "0 Points: 0-3 score based on Cicero report methodology",
        },
        {
          label: "50 Points: 4-7 score based on Cicero report methodology",
          value: "50 Points: 4-7 score based on Cicero report methodology",
        },
        {
          label: "100 Points: 8-10 score based on Cicero report methodology",
          value: "100 Points: 8-10 score based on Cicero report methodology",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. Pharmacist - Drug Administration":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: Restricted Authority",
          value: "0 Points: Restricted Authority",
        },
        {
          label: "1 Point: Formulary-Based Authority",
          value: "1 Point: Formulary-Based Authority",
        },
        {
          label: "2 Points: Full Authority",
          value: "2 Points: Full Authority",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. Pharmacist - Lab Testing":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: Restricted Authority",
          value: "0 Points: Restricted Authority",
        },
        {
          label: "1 Point: CLIA-Waived Authority",
          value: "1 Point: CLIA-Waived Authority",
        },
        {
          label: "2 Points: Full Authority",
          value: "2 Points: Full Authority",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. Pharmacist - Independent Prescribing":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 points: Restricted Authority",
          value: "0 points: Restricted Authority",
        },
        {
          label: "3 points: Formulary-Based Authority",
          value: "3 points: Formulary-Based Authority",
        },
        {
          label:
            "6 points: Full Authority Grounded in a Standard of Care Model",
          value:
            "6 points: Full Authority Grounded in a Standard of Care Model",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. Dental Hygienist - Overall Score":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "0 Points: Restricted Scope of Practice (0-2 types of tasks)",
          value: "0 Points: Restricted Scope of Practice (0-2 types of tasks)",
        },
        {
          label:
            "50 Points: Semi-Restricted Scope of Practice (3-5 types of tasks)",
          value:
            "50 Points: Semi-Restricted Scope of Practice (3-5 types of tasks)",
        },
        {
          label:
            "100 Points: Unrestricted Scope of Practice (6-8 types of tasks)",
          value:
            "100 Points: Unrestricted Scope of Practice (6-8 types of tasks)",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "D.3. Dental Hygienist - Local Anesthesia":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "Direct",
          value: "Direct",
        },
        {
          label: "Indirect",
          value: "Indirect",
        },
        {
          label: "General",
          value: "General",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "F.1. Medicaid Payment for Store and Forward":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "Only CTBS Reimbursement Implemented",
          value: "Only CTBS Reimbursement Implemented",
        },
        {
          label: "Full Implementation",
          value: "Full Implementation",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "F.1. Medicaid Payment for Remote Patient Monitoring (RPM)":
    case "F.1. In-State Licensing Requirement Exception":
      return [
        { label: "Not yet started", value: "Not yet started" },
        {
          label: "In Progress",
          value: "In Progress",
        },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    case "B.2. Presidential Fitness Test":
    case "D.2. EMS - EMS Compact":
    case "D.3. Dental Hygienist - Dental Hygiene Diagnosis":
    case "D.3. Dental Hygienist - Prescriptive Authority":
    case "D.3. Dental Hygienist - Supervision of Dental Assistants":
    case "D.3. Dental Hygienist - Direct Medicaid Reimbursement":
    case "D.3. Dental Hygienist - Dental Hygiene Treatment Planning":
    case "D.3. Dental Hygienist - Provision of Sealants":
    case "D.3. Dental Hygienist - Direct Access to Prophylaxis":
    case "E.3. Short-term, limited-duration insurance (STLDI)":
    case "F.1. Medicaid Payment for at Least One Form of Live Video":
      return [
        { label: "Not yet started", value: "Not yet started" },
        { label: "In progress", value: "In progress" },
        { label: "Implemented", value: "Implemented" },
        {
          label: "Commitment abandoned",
          value: "Commitment abandoned",
        },
      ];
    // TODO waiting to see what options are
    case "F.1. Telehealth License/Registration Process (including special licenses)":
    default:
      return [];
  }
};
