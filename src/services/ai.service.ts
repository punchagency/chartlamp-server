import {
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";


 export class AIService {
  private gpt35Model: ChatOpenAI;
  private gpt4Model: ChatOpenAI;

  constructor(apiKey: string) {
    // Initialize GPT-3.5 for simpler tasks
    this.gpt35Model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-3.5-turbo",
      temperature: 0.4,
    });

    // Initialize GPT-4o for complex medical tasks
    this.gpt4Model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o",
      temperature: 0.4,
    });
  }

  getPreConfiguredModel(modelName: string) {
    if (modelName === "gpt-3.5-turbo") {
      return this.gpt35Model;
    }
    return this.gpt4Model;
  }
}

export const aiService = new AIService(process.env.OPENAI_API_KEY as string);
