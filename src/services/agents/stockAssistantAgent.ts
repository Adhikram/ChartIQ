import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { STOCK_AGENT_SYSTEM_PROMPT, STOCK_AGENT_PROMPT } from "../../prompts/stockAgentPrompt";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

// Define a message type for conversation history
export interface ConversationMessage {
  role: string;
  content: string;
}

/**
 * Agent to assist with stock analysis questions
 */
export class StockAssistantAgent {
  private model: ChatOpenAI;

  constructor() {
    // Initialize OpenAI chat model
    this.model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL_NAME,
      temperature: 0.2, // Lower temperature for more focused responses
    });
  }

  /**
   * Process a query about stock analysis
   * @param analysis The original stock analysis text
   * @param question The user's follow-up question
   * @param conversationHistory Optional conversation history for context
   * @param userId User ID for tracing
   * @returns The agent's response
   */
  async processQuery(
    analysis: string, 
    question: string, 
    conversationHistory: ConversationMessage[] = [],
    userId: string = "anonymous"
  ): Promise<string> {
    try {
      // Set up the system message
      const systemMessage = new SystemMessage(STOCK_AGENT_SYSTEM_PROMPT);
      
      // Build context from conversation history if available
      let contextStr = "";
      if (conversationHistory.length > 0) {
        contextStr = "PREVIOUS CONVERSATION:\n" + conversationHistory
          .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
          .join("\n") + "\n\n";
      }

      // Format the prompt by replacing placeholders
      const prompt = STOCK_AGENT_PROMPT
        .replace("{analysis}", analysis)
        .replace("{question}", question)
        .replace("{conversation_history}", contextStr);

      // Create a human message with the formatted prompt
      const humanMessage = new HumanMessage(prompt);

      // Set up callbacks
      const callbacks = [];
      
      // Add console logging in development
      if (process.env.NODE_ENV === "development") {
        callbacks.push(new ConsoleCallbackHandler());
      }

      // LangSmith tracing is enabled automatically when the following env vars are set:
      // - LANGCHAIN_TRACING_V2=true
      // - LANGCHAIN_API_KEY=your_api_key
      // - LANGCHAIN_PROJECT=your_project_name (optional)
      
      // Set up run metadata for LangSmith tracing
      const options = callbacks.length > 0 
        ? { 
            callbacks,
            tags: ["stock-assistant", "finance"],
            metadata: {
              userId,
              questionLength: question.length,
              historyLength: conversationHistory.length
            }
          } 
        : undefined;

      // Call the model with messages and tracing
      const response = await this.model.invoke([systemMessage, humanMessage], options);

      return response.content as string;
    } catch (error) {
      console.error("Error in stock assistant agent:", error);
      return "I'm sorry, I encountered an error while processing your question. Please try again.";
    }
  }
}

// Export a singleton instance
export const stockAssistantAgent = new StockAssistantAgent(); 