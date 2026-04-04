
import { GoogleGenAI, Type } from "@google/genai";
import { AIHubResponse, QuestionType } from "../types";

// Initialize AI Client lazily
let aiClient: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy_key_for_build') {
      console.error("GEMINI_API_KEY is missing. Please set it in your environment variables (e.g., Vercel).");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_for_build' });
  }
  return aiClient;
};

export const generateSurveyFromDescription = async (description: string, fileContext?: string): Promise<AIHubResponse> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    
    let prompt = `
      You are an expert M&E (Monitoring and Evaluation) consultant for NGOs in Rwanda.
      Create a comprehensive, expanded, and professional data collection survey based on the following requirement: "${description}".
      The survey should be culturally relevant and practical.
      Ensure the survey is highly detailed and contains a wide variety of questions (aim for at least 100 questions) covering all necessary aspects of the topic, such as demographics, core metrics, qualitative feedback, and field observations. Make sure the survey is applicable to all projects.
      Provide a title, a short description, and a list of questions.
      For 'type', strictly use one of: 'TEXT', 'MULTIPLE_CHOICE', 'NUMBER', 'DATE', 'BOOLEAN', 'CALCULATION', 'IMAGE', 'SIGNATURE'.
      Determine if each question should be mandatory (required) or optional.
      If a question requires a signature (e.g. Beneficiary's Signature, Consent), set type to 'SIGNATURE'.
      If a question requires calculation (e.g. Total Cost = Price * Quantity), set type to 'CALCULATION' and provide a 'formula' string referencing other questions by concept (e.g. 'Q1 * Q2').
      If a question requires an image upload (e.g. Take a photo of the site), set type to 'IMAGE'.
    `;

    if (fileContext) {
      prompt += `\n\nCONTEXT FROM UPLOADED DOCUMENT:\n${fileContext}\n\nUse the context above to tailor the questions specifically to the project described in the document.`;
    }

    const response = await getAiClient().models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful data scientist assistant for DataRW.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            surveyTitle: { type: Type.STRING },
            surveyDescription: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['TEXT', 'MULTIPLE_CHOICE', 'NUMBER', 'DATE', 'BOOLEAN', 'CALCULATION', 'IMAGE', 'SIGNATURE'] },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Only required if type is MULTIPLE_CHOICE"
                  },
                  required: { type: Type.BOOLEAN, description: "Whether the question is mandatory" },
                  formula: { type: Type.STRING, description: "Formula logic for CALCULATION type" }
                },
                required: ["text", "type", "required"]
              }
            }
          },
          required: ["surveyTitle", "surveyDescription", "questions"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIHubResponse;
    }
    
    throw new Error("No response text received from AI service.");

  } catch (error) {
    return {
      surveyTitle: "Sample Survey (AI Unavailable)",
      surveyDescription: "Could not connect to AI service. Here is a template.",
      questions: [
        { text: "Beneficiary Name", type: "TEXT", required: true },
        { text: "Age", type: "NUMBER", required: true },
        { text: "District", type: "MULTIPLE_CHOICE", options: [
          "Burera District", "Gakenke District", "Gicumbi District", "Musanze District", "Rulindo District",
          "Gisagara District", "Huye District", "Kamonyi District", "Muhanga District", "Nyamagabe District",
          "Nyanza District", "Nyaruguru District", "Ruhango District", "Bugesera District", "Gatsibo District",
          "Kayonza District", "Kirehe District", "Ngoma District", "Nyagatare District", "Rwamagana District",
          "Karongi District", "Ngororero District", "Nyabihu District", "Nyamasheke District", "Rubavu District",
          "Rusizi District", "Rutsiro District", "Gasabo District", "Kicukiro District", "Nyarugenge District"
        ], required: true },
        { text: "Beneficiary Signature", type: "SIGNATURE", required: true }
      ]
    };
  }
};

export const translateSurvey = async (surveyData: AIHubResponse, targetLanguage: string): Promise<AIHubResponse> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    const prompt = `
      Translate the following survey into ${targetLanguage}.
      Keep the technical structure (types, required status, formulas) exactly the same.
      Only translate the 'surveyTitle', 'surveyDescription', 'questions.text', and 'questions.options'.
      Return the result in the same JSON format.
      
      Survey Data: ${JSON.stringify(surveyData)}
    `;

    const response = await getAiClient().models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIHubResponse;
    }
    throw new Error("Translation failed");
  } catch (error) {
    return surveyData;
  }
};
