import { z } from "zod";
import { PatientSchema } from "./patient";
import { EncounterSchema } from "./encounter";
import { ConditionSchema } from "./condition";
import { ClaimSchema } from "./claim";

export const BundleSchema = z.object({
  resourceType: z.literal("Bundle"),
  type: z.string(),
  entry: z.array(
    z.object({
      resource: z.union([
        PatientSchema,
        EncounterSchema,
        ConditionSchema,
        ClaimSchema,
      ]),
    })
  ),
});

export type Bundle = z.infer<typeof BundleSchema>;
