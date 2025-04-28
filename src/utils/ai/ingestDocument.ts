import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { aiService } from "../../services/ai.service";
import { z } from "zod";

const extractionSchema = z.object({
  patientName: z.string(),
  dob: z.string(),
  diagnosis: z.string(),
  encounterDate: z.string(),
  tests: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(extractionSchema);
const formatInstructions = parser.getFormatInstructions();

const model = aiService.getPreConfiguredModel("gpt-3.5-turbo");

const extractPrompt = new PromptTemplate({
  inputVariables: ["pageText", "format_instructions"],
  template: `
You are an assistant that extracts important medical information from clinical documents.

Given the page text below, extract only the following items if present:
- Patient name
- Date of birth
- Diagnosis
- Encounter date
- Test results
- Medications
- Billing information

Respond in this format (only include what you find):

{format_instructions}

Page Text:
{pageText}
  `,
});

export const simpleExtractChain = RunnableSequence.from([
  {
    format_instructions: () => formatInstructions,
  },
  extractPrompt,
  model,
  parser,
]);
