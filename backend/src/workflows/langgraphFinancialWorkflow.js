import { StateGraph, START, END } from "@langchain/langgraph";
import { getMemory } from "../memory/userProfileMemory.js";
import { goalPlanningAgent } from "../agents/goalPlanningAgent.js";
import { financialHealthAgent } from "../agents/financialHealthAgent.js";

const memoryNode = async (state) => {
  return {
    ...state,
    memory: getMemory(),
    executedAgents: [...state.executedAgents, "Memory Agent"],
  };
};

const budgetNode = async (state) => {
  const { income = 0, expenses = 0, emi = 0 } = state.memory;
  const savings = income - expenses - emi;

  return {
    ...state,
    savings,
    budgetReply: `Monthly savings: ₹${savings}`,
    executedAgents: [...state.executedAgents, "Budget Agent"],
  };
};

const goalNode = async (state) => {
  const goalResult = goalPlanningAgent(state.memory);

  return {
    ...state,
    goalReply: goalResult.reply,
    executedAgents: [...state.executedAgents, "Goal Planning Agent"],
  };
};

const healthNode = async (state) => {
  const healthResult = financialHealthAgent(state.memory);

  return {
    ...state,
    healthReply: healthResult.reply,
    executedAgents: [...state.executedAgents, "Financial Health Agent"],
  };
};

const finalNode = async (state) => {
  return {
    ...state,
    finalReply: `
LangGraph Multi-Agent Workflow Executed:

${state.executedAgents.map((agent) => `✅ ${agent}`).join("\n")}

Financial Summary:
Income: ₹${state.memory.income || 0}
Expenses: ₹${state.memory.expenses || 0}
EMI: ₹${state.memory.emi || 0}
Savings: ₹${state.savings || 0}

Goal Plan:
${state.goalReply}

Health Score:
${state.healthReply}

Final Recommendation:
Based on your profile, continue saving regularly and allocate part of your savings toward your financial goal.
`,
  };
};

const workflow = new StateGraph({
  channels: {
    message: null,
    memory: null,
    savings: null,
    budgetReply: null,
    goalReply: null,
    healthReply: null,
    finalReply: null,
    executedAgents: null,
  },
});

workflow.addNode("memoryNode", memoryNode);
workflow.addNode("budgetNode", budgetNode);
workflow.addNode("goalNode", goalNode);
workflow.addNode("healthNode", healthNode);
workflow.addNode("finalNode", finalNode);

workflow.addEdge(START, "memoryNode");
workflow.addEdge("memoryNode", "budgetNode");
workflow.addEdge("budgetNode", "goalNode");
workflow.addEdge("goalNode", "healthNode");
workflow.addEdge("healthNode", "finalNode");
workflow.addEdge("finalNode", END);

const app = workflow.compile();

export const runLangGraphFinancialWorkflow = async (message) => {
  const result = await app.invoke({
    message,
    executedAgents: [],
  });

  return {
    agent: "LangGraph Multi-Agent Workflow",
    reply: result.finalReply,
  };
};