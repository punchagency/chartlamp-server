import { z } from "zod";
import { PageExtractionSchema } from "./structuredOutputs/global"; // from earlier

// Assuming pagesExtracted is an array of parsed page JSONs
async function combinePagesToFhir(
  pagesExtracted: z.infer<typeof PageExtractionSchema>[]
) {
  let patientData: any = null;
  const encounters: any[] = [];
  const conditions: any[] = [];
  const diagnosticReports: any[] = [];
  const claims: any[] = [];

  for (const page of pagesExtracted) {
    if (page.patient && !patientData) {
      patientData = page.patient;
    }
    if (page.encounters) {
      encounters.push(...page.encounters);
    }
    if (page.conditions) {
      conditions.push(...page.conditions);
    }
    if (page.diagnosticReports) {
      diagnosticReports.push(...page.diagnosticReports);
    }
    if (page.claims) {
      claims.push(...page.claims);
    }
  }

  if (!patientData) {
    throw new Error("No patient data found across pages.");
  }

  // Now build FHIR resources
  const patientResource = {
    resourceType: "Patient",
    id: "patient-1",
    name: [{ text: patientData.name }],
    birthDate: patientData.dob,
    gender: patientData.gender,
    address: patientData.address ? [{ text: patientData.address }] : undefined,
  };

  const encounterResources = encounters.map((encounter, index) => ({
    resourceType: "Encounter",
    id: `encounter-${index + 1}`,
    status: "finished",
    class: {
      code: "AMB",
    },
    subject: {
      reference: `Patient/${patientResource.id}`,
    },
    period: {
      start: encounter.date,
    },
    type: [
      {
        text: encounter.type,
      },
    ],
  }));

  const conditionResources = conditions.map((condition, index) => ({
    resourceType: "Condition",
    id: `condition-${index + 1}`,
    subject: {
      reference: `Patient/${patientResource.id}`,
    },
    code: {
      text: condition.description,
      coding: condition.code
        ? [
            {
              system: "http://hl7.org/fhir/sid/icd-10",
              code: condition.code,
            },
          ]
        : undefined,
    },
    onsetDateTime: condition.onsetDate,
  }));

  const diagnosticReportResources = diagnosticReports.map((report, index) => ({
    resourceType: "DiagnosticReport",
    id: `report-${index + 1}`,
    status: "final",
    code: {
      text: report.testName,
    },
    result: [
      {
        display: report.result,
      },
    ],
    subject: {
      reference: `Patient/${patientResource.id}`,
    },
    effectiveDateTime: report.date,
    performer: report.performer ? [{ display: report.performer }] : undefined,
  }));

  const claimResources = claims.map((claim, index) => ({
    resourceType: "Claim",
    id: `claim-${index + 1}`,
    status: "active",
    type: {
      coding: [
        {
          code: "professional",
        },
      ],
    },
    use: "claim",
    patient: {
      reference: `Patient/${patientResource.id}`,
    },
    created: claim.claimDate,
    diagnosis: claim.diagnosisRelated
      ? [
          {
            sequence: 1,
            diagnosisCodeableConcept: {
              text: claim.diagnosisRelated,
            },
          },
        ]
      : undefined,
    total: claim.amount
      ? {
          value: claim.amount,
          currency: "USD",
        }
      : undefined,
  }));

  // Combine into a FHIR Bundle
  const bundle = {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      { resource: patientResource },
      ...encounterResources.map((resource) => ({ resource })),
      ...conditionResources.map((resource) => ({ resource })),
      ...diagnosticReportResources.map((resource) => ({ resource })),
      ...claimResources.map((resource) => ({ resource })),
    ],
  };

  return bundle;
}
