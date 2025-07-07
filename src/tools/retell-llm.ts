import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import Retell from "retell-sdk";

import {
  CreateRetellLLMInputSchema,
  GetRetellLLMInputSchema,
  UpdateRetellLLMInputSchema,
  UpdateRetellLLMStatesInputSchema,
} from "../schemas/index.js";
import {
  transformRetellLLMInput,
  transformUpdateRetellLLMInput,
  transformUpdateRetellLLMStatesInput,
  transformRetellLLMOutput,
} from "../transformers/index.js";
import { createToolHandler } from "./utils.js";

export const registerRetellLLMTools = (
  server: McpServer,
  retellClient: Retell
) => {
  server.tool(
    "list_retell_llms",
    "Lists all Retell LLMs",
    {},
    createToolHandler(async () => {
      const llms = await retellClient.llm.list();
      return llms.map(transformRetellLLMOutput);
    })
  );

  server.tool(
    "create_retell_llm",
    "Creates a new Retell LLM",
    CreateRetellLLMInputSchema.shape,
    createToolHandler(async (data) => {
      const createLLMDto = transformRetellLLMInput(data);
      const llm = await retellClient.llm.create(createLLMDto);
      return transformRetellLLMOutput(llm);
    })
  );

  server.tool(
    "get_retell_llm",
    "Gets a Retell LLM by ID",
    GetRetellLLMInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const llm = await retellClient.llm.retrieve(data.llmId);
        if (!llm) {
          throw new Error(`Retell LLM with ID ${data.llmId} not found`);
        }
        return transformRetellLLMOutput(llm);
      } catch (error: any) {
        console.error(`Error getting Retell LLM: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_retell_llm",
    "Updates an existing Retell LLM",
    UpdateRetellLLMInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        const llmId = data.llmId;
        const updateLLMDto = transformUpdateRetellLLMInput(data);
        const updatedLLM = await retellClient.llm.update(llmId, updateLLMDto);
        return transformRetellLLMOutput(updatedLLM);
      } catch (error: any) {
        console.error(`Error updating Retell LLM: ${error.message}`);
        throw error;
      }
    })
  );

  server.tool(
    "update_retell_llm_states",
    "Updates states and starting state of a Retell LLM",
    UpdateRetellLLMStatesInputSchema.shape,
    createToolHandler(async (data) => {
      const stateNames = data.states.map((s: any) => s.name);
      if (!stateNames.includes(data.startingState)) {
        throw new Error(
          "startingState must match one of the provided state names"
        );
      }
      const updateDto = transformUpdateRetellLLMStatesInput(data);
      const updatedLLM = await retellClient.llm.update(data.llmId, updateDto);
      return transformRetellLLMOutput(updatedLLM);
    })
  );

  server.tool(
    "delete_retell_llm",
    "Deletes a Retell LLM",
    GetRetellLLMInputSchema.shape,
    createToolHandler(async (data) => {
      try {
        await retellClient.llm.delete(data.llmId);
        return {
          success: true,
          message: `Retell LLM ${data.llmId} deleted successfully`,
        };
      } catch (error: any) {
        console.error(`Error deleting Retell LLM: ${error.message}`);
        throw error;
      }
    })
  );
};
