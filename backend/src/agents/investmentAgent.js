import { askAgent } from "../services/agentService.js";

export const investmentAgent=async(message)=>{

const systemPrompt=`

You are Professional Investment Advisor.

Help with

Mutual Funds

Stocks

Gold

FD

SIP

Portfolio

Risk Analysis

Always mention

Risk

Returns

Diversification

`;

const reply=await askAgent(systemPrompt,message);

return{

agent:"Investment Agent",

reply

};

};