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
  "C.3. CON - Medical Inpatient",
  "C.3. CON - Day Services",
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

export const cmsEvaluationStatusDefault = {
  label: "Not yet evaluated",
  value: "Not yet evaluated",
};

export const cmsCommitmentFulfilled = {
  label: "Commitment fulfilled",
  value: "Commitment fulfilled",
};

export const cmsCommitmentAbandoned = {
  label: "Commitment abandoned",
  value: "Commitment abandoned",
};

export const getDropdownOptions = (label: string) => {
  switch (label) {
    case "B.2. Presidential Fitness Test":
      return [
        cmsCommitmentAbandoned,
        {
          label:
            "0 Points: A State does not require schools to reestablish the Presidential Fitness Test",
          value:
            "0 Points: A State does not require schools to reestablish the Presidential Fitness Test",
        },
        {
          label:
            "100 Points: A State requires schools to reestablish the Presidential Fitness Test that is aligned with federal guidance associated with Executive Order 14327",
          value:
            "100 Points: A State requires schools to reestablish the Presidential Fitness Test that is aligned with federal guidance associated with Executive Order 14327",
        },
      ];
    case "B.3. SNAP Food Restriction Waiver Policy":
      return [
        cmsCommitmentAbandoned,
        {
          label:
            "0 Points: State has no pending or approved USDA SNAP food restriction waiver prohibiting the purchase of non-nutritious items or no pending State bill requiring a food restriction waiver be submitted to USDA",
          value:
            "0 Points: State has no pending or approved USDA SNAP food restriction waiver prohibiting the purchase of non-nutritious items or no pending State bill requiring a food restriction waiver be submitted to USDA",
        },
        {
          label:
            "25 Points: State with active bill in the State legislative process",
          value:
            "25 Points: State with active bill in the State legislative process",
        },
        {
          label:
            "50 Points: State bill was passed to submit a USDA food restriction waiver",
          value:
            "50 Points: State bill was passed to submit a USDA food restriction waiver",
        },
        {
          label:
            "75 Points: State submitted a waiver prohibiting the purchase of non-nutritious items in SNAP and waiver is in processing with USDA",
          value:
            "75 Points: State submitted a waiver prohibiting the purchase of non-nutritious items in SNAP and waiver is in processing with USDA",
        },
        {
          label:
            "100 Points: USDA approved State waiver prohibiting the purchase of non-nutritious items in SNAP",
          value:
            "100 Points: USDA approved State waiver prohibiting the purchase of non-nutritious items in SNAP",
        },
      ];
    case "B.4. Nutrition Continuing Medical Education":
      return [
        cmsCommitmentAbandoned,
        {
          label:
            "0 Points: States that have no requirement for nutrition to be included in continuing medical education (CME) for physicians as well as no pending State bill requiring nutrition to be included in CME for physicians",
          value:
            "0 Points: States that have no requirement for nutrition to be included in continuing medical education (CME) for physicians as well as no pending State bill requiring nutrition to be included in CME for physicians",
        },
        {
          label:
            "25 Points: States with an active bill in the State legislative process or regulation proposed",
          value:
            "25 Points: States with an active bill in the State legislative process or regulation proposed",
        },
        {
          label:
            "75 Points: State bill requiring nutrition to be included in CME for physicians was passed or regulation finalized but not yet implemented or enforced",
          value:
            "75 Points: State bill requiring nutrition to be included in CME for physicians was passed or regulation finalized but not yet implemented or enforced",
        },
        {
          label:
            "100 Points: Requirement for nutrition to be included in CME for physicians is currently in place and enforced",
          value:
            "100 Points: Requirement for nutrition to be included in CME for physicians is currently in place and enforced",
        },
      ];
    case "C.3. Overall CON Score":
      return [
        cmsCommitmentAbandoned,
        {
          label:
            "0 Points: 100 score from Cicero report for States with universal CONs for all facility categories",
          value:
            "0 Points: 100 score from Cicero report for States with universal CONs for all facility categories",
        },
        {
          label:
            "25 Points: 80-99 score from Cicero report for States with stringent CONs across facility categories",
          value:
            "25 Points: 80-99 score from Cicero report for States with stringent CONs across facility categories",
        },
        {
          label:
            "50 Points: 45-79 score from the Cicero report for States with moderate CONs across facility categories",
          value:
            "50 Points: 45-79 score from the Cicero report for States with moderate CONs across facility categories",
        },
        {
          label:
            "75 Points: 1-44 score from Cicero report for States with limited CONs across facility categories",
          value:
            "75 Points: 1-44 score from Cicero report for States with limited CONs across facility categories",
        },
        {
          label:
            "100 Points: 0 score from Cicero report for States with no CONs across facility categories",
          value:
            "100 Points: 0 score from Cicero report for States with no CONs across facility categories",
        },
      ];
    case "C.3. CON - Behavioral Outpatient":
    case "C.3. CON - Medical Outpatient":
    case "C.3. CON - Behavioral Inpatient":
    case "C.3. CON - Imaging":
    case "C.3. CON - Medical Inpatient":
    case "C.3. CON - Day Services":
    case "C.3. CON - Long-term Care Facilities":
    case "C.3. CON - Ancillaries":
    case "C.3. CON - Other":
      return [
        cmsCommitmentAbandoned,
        { label: "Restricted", value: "Restricted" },
        {
          label: "Unrestricted",
          value: "Unrestricted",
        },
      ];
    case "D.2. Physician - Medical Licensure Compact":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: Not a Member State",
          value: "0 Points: Not a Member State",
        },
        {
          label:
            "50 Points: Interstate Medical Licensure Compact (IMLC) member State issuing non-State of Principal Licensure (SPL) licenses only OR compact legislation introduced (towards serving as SPL)",
          value:
            "50 Points: Interstate Medical Licensure Compact (IMLC) member State issuing non-State of Principal Licensure (SPL) licenses only OR compact legislation introduced (towards serving as SPL)",
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
          label:
            "100 Points: IMLC Member State serving as SPL (State of principal license)",
          value:
            "100 Points: IMLC Member State serving as SPL (State of principal license)",
        },
      ];
    case "D.2. Nurse - Nurse Licensure Compact":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: Not a Member State",
          value: "0 Points: Not a Member State",
        },
        {
          label: "50 Points: Pending NLC legislation",
          value: "50 Points: Pending NLC legislation",
        },
        {
          label: "75 Points: NLC legislation enacted; implementation phase",
          value: "75 Points: NLC legislation enacted; implementation phase",
        },
        {
          label: "100 Points: NLC state",
          value: "100 Points: NLC state",
        },
      ];
    case "D.2. Psychology - PSYPACT":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: non-PSYPACT participating",
          value: "0 Points: non-PSYPACT participating",
        },
        {
          label: "50 Points: PSYPACT legislation introduced",
          value: "50 Points: PSYPACT legislation introduced",
        },
        {
          label:
            "75 Points: Enacted PSYPACT legislation practice; implementation phase",
          value:
            "75 Points: Enacted PSYPACT legislation practice; implementation phase",
        },
        {
          label: "100 Points: PSYPACT participating",
          value: "100 Points: PSYPACT participating",
        },
      ];
    case "D.2. Physician Assistant - PA Compact":
      return [
        cmsCommitmentAbandoned,
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
          label:
            "100 Points: Legislation enacted to become a PA Compact member – State is a compact member",
          value:
            "100 Points: Legislation enacted to become a PA Compact member – State is a compact member",
        },
      ];
    case "D.2. EMS - EMS Compact":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: Not a Member State",
          value: "0 Points: Not a Member State",
        },
        {
          label: "100 Points: Is-a-licensure compact member of the EMS Compact",
          value: "100 Points: Is-a-licensure compact member of the EMS Compact",
        },
      ];
    case "D.3. PA - Scope of Practice":
      return [
        cmsCommitmentAbandoned,
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
      ];
    case "D.3. NP - Scope of Practice":
      return [
        cmsCommitmentAbandoned,
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
      ];
    case "D.3. Pharmacist - Overall Score":
      return [
        cmsCommitmentAbandoned,
        {
          label:
            "0 Points: 0-3 score from Cicero report for States with restricted authority",
          value:
            "0 Points: 0-3 score from Cicero report for States with restricted authority",
        },
        {
          label:
            "50 Points: 4-7 score from Cicero report for States with Formulary-Based Authority",
          value:
            "50 Points: 4-7 score from Cicero report for States with Formulary-Based Authority",
        },
        {
          label:
            "100 Points: 8-10 score from Cicero report for States with full authority",
          value:
            "100 Points: 8-10 score from Cicero report for States with full authority",
        },
      ];
    case "D.3. Pharmacist - Drug Administration":
      return [
        cmsCommitmentAbandoned,
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
      ];
    case "D.3. Pharmacist - Lab Testing":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: Restricted Authority (Narrow CLIA-Waived List)",
          value: "0 Points: Restricted Authority (Narrow CLIA-Waived List)",
        },
        {
          label: "1 Point: CLIA-Waived Authority",
          value: "1 Point: CLIA-Waived Authority",
        },
        {
          label: "2 Points: Full Authority",
          value: "2 Points: Full Authority",
        },
      ];
    case "D.3. Pharmacist - Independent Prescribing":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: Restricted Authority",
          value: "0 Points: Restricted Authority",
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
      ];
    case "D.3. Dental Hygienist - Overall Score":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: Restricted Scope of Practice (0-2 types tasks)",
          value: "0 Points: Restricted Scope of Practice (0-2 types tasks)",
        },
        {
          label:
            "50 Points: Semi Restricted Scope of Practice (3-5 types tasks)",
          value:
            "50 Points: Semi Restricted Scope of Practice (3-5 types tasks)",
        },
        {
          label: "100 Points: Unrestricted Scope of Practice (6-8 types tasks)",
          value: "100 Points: Unrestricted Scope of Practice (6-8 types tasks)",
        },
      ];
    case "D.3. Dental Hygienist - Dental Hygiene Diagnosis":
    case "D.3. Dental Hygienist - Prescriptive Authority":
    case "D.3. Dental Hygienist - Supervision of Dental Assistants":
    case "D.3. Dental Hygienist - Direct Medicaid Reimbursement":
    case "D.3. Dental Hygienist - Dental Hygiene Treatment Planning":
    case "D.3. Dental Hygienist - Provision of Sealants":
    case "D.3. Dental Hygienist - Direct Access to Prophylaxis":
      return [
        cmsCommitmentAbandoned,
        {
          label: "Allowable Task",
          value: "Allowable Task",
        },
        {
          label: "Unallowable Task",
          value: "Unallowable Task",
        },
      ];
    case "D.3. Dental Hygienist - Local Anesthesia":
      return [
        cmsCommitmentAbandoned,
        {
          label: "General",
          value: "General",
        },
        {
          label: "Direct",
          value: "Direct",
        },
        {
          label: "Indirect",
          value: "Indirect",
        },
      ];
    case "E.3. Short-term, limited-duration insurance (STLDI)":
      return [
        cmsCommitmentAbandoned,
        {
          label:
            "0 Points: STLDI plans are restricted in the State beyond the latest federal guidance",
          value:
            "0 Points: STLDI plans are restricted in the State beyond the latest federal guidance",
        },
        {
          label:
            "100 Points: STLDI plans are not restricted in the State beyond the latest federal guidance",
          value:
            "100 Points: STLDI plans are not restricted in the State beyond the latest federal guidance",
        },
      ];
    case "F.1. Medicaid Payment for Store and Forward":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: No payment",
          value: "0 Points: No payment",
        },
        {
          label:
            "50 Points: Only reimbursing Communication Technology Based Services (CTBS)",
          value:
            "50 Points: Only reimbursing Communication Technology Based Services (CTBS)",
        },
        {
          label: "100 Points: Reimbursed",
          value: "100 Points: Reimbursed",
        },
      ];
    case "F.1. Medicaid Payment for Remote Patient Monitoring (RPM)":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: No payment",
          value: "0 Points: No payment",
        },
        {
          label: "100 Points: Reimbursed",
          value: "100 Points: Reimbursed",
        },
      ];
    case "F.1. In-State Licensing Requirement Exception":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: No exceptions are in place",
          value: "0 Points: No exceptions are in place",
        },
        {
          label: "100 Points: Exceptions are in place",
          value: "100 Points: Exceptions are in place",
        },
      ];

    case "F.1. Medicaid Payment for at Least One Form of Live Video":
      return [
        cmsCommitmentAbandoned,
        { label: "0 Points: No payment", value: "0 Points: No payment" },
        { label: "100 Points: Reimbursed", value: "100 Points: Reimbursed" },
      ];
    case "F.1. Telehealth License/Registration Process (including special licenses)":
      return [
        cmsCommitmentAbandoned,
        {
          label: "0 Points: No registration process in place",
          value: "0 Points: No registration process in place",
        },
        {
          label: "100 Points: Registration process is in place",
          value: "100 Points: Registration process is in place",
        },
      ];
    default:
      return [];
  }
};
