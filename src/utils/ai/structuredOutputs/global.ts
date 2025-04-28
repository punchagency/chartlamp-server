import { z } from "zod";

export const MedicalRecordSchema = z.object({
  diseaseName: z.array(z.string()),
  diagnosis: z.array(z.string()),
  amountSpent: z.string(),
  providerName: z.string(),
  doctorName: z.string(),
  medicalNote: z.string(),
  date: z.string(),
});

export const PageExtractionSchema = z.object({
  patient: z
    .object({
      name: z.string().optional(),
      dob: z.string().optional(), // ISO 8601 date
      gender: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),

  encounters: z
    .array(
      z.object({
        date: z.string().optional(), // ISO date
        type: z.string().optional(), // e.g., "Consultation", "Emergency Visit"
        provider: z.string().optional(), // Doctor name
        location: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .optional(),

  conditions: z
    .array(
      z.object({
        code: z.string().optional(), // ICD-10 code if available
        description: z.string(),
        onsetDate: z.string().optional(), // ISO date
      })
    )
    .optional(),

  diagnosticReports: z
    .array(
      z.object({
        testName: z.string(),
        result: z.string(),
        date: z.string().optional(), // ISO date
        performer: z.string().optional(), // Lab name
      })
    )
    .optional(),

//   medications: z
//     .array(
//       z.object({
//         name: z.string(),
//         dosage: z.string().optional(),
//         frequency: z.string().optional(),
//       })
//     )
//     .optional(),

  claims: z
    .array(
      z.object({
        claimDate: z.string().optional(), // ISO date
        amount: z.number().optional(),
        diagnosisRelated: z.string().optional(), // short diagnosis title
      })
    )
    .optional(),
});
