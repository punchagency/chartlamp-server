import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { z } from "zod";
import { aiService } from "../../services/ai.service";
import { MedicalRecordSchema } from "./structuredOutputs/global";

export interface RawReport {
  pageId: string;
  pageNumber: number;
  date: string;
  amountSpent: string;
  providerName: string;
  doctorName: string;
  medicalNote: string;
  diseaseName: string[];
  diagnosis: string[];
  chunk: string;
}

export type MedicalRecordResponse = z.infer<typeof MedicalRecordSchema>;

const memory = new ConversationSummaryBufferMemory({
  llm: new ChatOpenAI({
    temperature: 0.2,
    modelName: "gpt-3.5-turbo",
  }),
  memoryKey: "medical_record_history",
  maxTokenLimit: 2000,
});

const parser = StructuredOutputParser.fromZodSchema(MedicalRecordSchema);
const formatInstructions = parser.getFormatInstructions();

const prompt = new PromptTemplate({
  inputVariables: ["chunk", "medical_record_history", "format_instructions"],
  template: `
You are analyzing a patient's medical document page-by-page and extracting structured information in JSON.

Conversation so far:
{medical_record_history}

Current page content:
{chunk}

{format_instructions}

❗️ Instructions:
- Ignore any "Yes/No" questions, checkboxes, or form-like fields.
- Focus on extracting clean structured data.

Respond ONLY in JSON format.
`,
});

const model = aiService.getPreConfiguredModel("gpt-3.5-turbo");

const chain = RunnableSequence.from([
  {
    chunk: (input) => input.pageText,
    medical_record_history: async () => {
      const mem = await memory.loadMemoryVariables({});
      return mem.medical_record_history || "";
    },
    format_instructions: () => formatInstructions,
  },
  prompt,
  model,
  parser,
]);

// 🔄 Main Function
export async function extractMedicalRecordFromPdf(
  pages: {
    pageText: string;
    pageNumber: number;
    _id: string;
  }[]
) {
  const results = [];

  for (const page of pages) {
    try {
      console.log("Page number input", page.pageNumber, page.pageText.slice(0, 5));
      const response = await chain.invoke({ pageText: page.pageText });

      // console.log("response 1", JSON.stringify(response, null, 2));

      // Save this context into memory
      await memory.saveContext(
        { input: page.pageText },
        { output: JSON.stringify(response) }
      );

      results.push({
        ...response,
        pageId: page._id,
        pageNumber: page.pageNumber,
        chunk: page.pageText,
      });
      console.log("Page number response", page.pageNumber);
    } catch (error) {
      console.log("extractMedicalRecordFromPdf", error);
    }
  }

  return results; // or post-process to merge
}
