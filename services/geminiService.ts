
import { GoogleGenAI, Type } from "@google/genai";
import { Account, Split } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development if the API key isn't set.
  // In a real deployed environment, the key should always be present.
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const splitSchema = {
  type: Type.OBJECT,
  properties: {
    accountId: {
      type: Type.STRING,
      description: 'The ID of the account for this split.',
    },
    amount: {
      type: Type.NUMBER,
      description: 'The amount. Use a positive number for debits and a negative number for credits. The sum of all splits must be zero.',
    },
  },
  required: ['accountId', 'amount'],
};

export const suggestTransactionSplits = async (
  description: string,
  accounts: Account[]
): Promise<Partial<Split>[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = 'gemini-2.5-flash';

  const systemInstruction = `You are an expert accountant integrated into an accounting app.
Your task is to categorize a transaction based on its description into a standard chart of accounts.
The user will provide a transaction description and a list of their available accounts.
You must suggest the correct debit and credit splits for the transaction.
A transaction usually involves one expense/income account and one asset/liability account.
For example, for "Groceries from store", you might debit "Expenses:Food:Groceries" and credit "Assets:Checking Account".
Ensure the total of debits equals the total of credits (the sum of all split amounts must be zero).
Return the response as a JSON array of split objects that strictly follows the provided schema. Do not include markdown backticks or any other text outside the JSON.`;
  
  const usableAccounts = accounts
    .filter(a => !a.placeholder)
    .map(a => `- ${a.name} (ID: ${a.id})`)
    .join('\n');
  
  const prompt = `
Transaction Description: "${description}"

Available Accounts:
${usableAccounts}

Suggest the transaction splits based on the description.
`;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: splitSchema,
          },
          temperature: 0.1,
        }
    });
    
    const jsonString = response.text;
    const suggestedSplits = JSON.parse(jsonString);

    if (Array.isArray(suggestedSplits)) {
        // Validate the structure of the returned objects
        return suggestedSplits.filter(s => typeof s.accountId === 'string' && typeof s.amount === 'number');
    }

    return [];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestions from AI. Please check the transaction description and your API key.");
  }
};
