import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSqlHint = async (
  question,
  userQuery = "",
  databaseSchema,
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `
    You are an expert, encouraging SQL tutor. A student is trying to solve the following assignment:
    Question: "${question}"
    
   ${
     userQuery
       ? `The student wrote this SQL query so far, which is incorrect:
    "${userQuery}"

    The database schema is:
    ${databaseSchema}
`
       : `The student hasn't written any SQL yet. The database schema is:
    ${databaseSchema}
`
   }
    Provide a short, 1 or 2 sentence pure text hint to help them find their mistake. 
    CRITICAL RULE: DO NOT write the correct SQL query for them. Point out logical flaws, missing keywords (like GROUP BY or JOIN), or syntax errors, but make them think.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
};
