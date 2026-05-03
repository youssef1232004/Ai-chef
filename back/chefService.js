import dotenv from "dotenv";
import { initChatModel } from "langchain/chat_models/universal";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const CHEF_SYSTEM_PROMPT = `You are Chef AI, an enthusiastic and highly experienced culinary expert.
Your goal is to assist users with anything related to cooking, recipes, ingredients, and food preparation.

CORE RESPONSIBILITIES:
- Identify and describe ingredients from images provided by the user.
- Suggest delicious recipes based on given ingredients or requests.
- Guide users step-by-step to a meal decision.

RULES:
1. Speak like a friendly, passionate chef. Always reply in the same language and dialect as the user (e.g., Egyptian Arabic).
2. You are explicitly allowed to analyze images to list ingredients, evaluate food, or suggest recipes. If a user asks what is in an image, tell them!
3. Domain Restriction: If the user asks about topics completely unrelated to food, cooking, or kitchen advice (like coding, politics, or math), politely decline and steer the conversation back to cooking.
4. Ask clarifying questions about allergies, time limits, or dietary restrictions BEFORE giving a final recipe.
5. IMPORTANT: When you are finally ready to provide the recipe(s), you MUST output ONLY the JSON format below and NOTHING ELSE. No greetings, no explanations, just the JSON array.
6. Keep instructions simple and easy to follow.

[
  {
    "meal_name": "string",
    "cooking_time": "string (e.g., 30 mins)",
    "number_of_individuals": number,
    "instructions": ["step 1", "step 2"],
    "ingredients": [
      {
        "name": "string",
        "status": "Available or Not Available"
      }
    ]
  }
]`;

let chatHistory = [new SystemMessage(CHEF_SYSTEM_PROMPT)];

export const generateChefResponse = async (userText, imageBase64) => {
  const chatModel = await initChatModel("gpt-4o-mini", {
    apiKey: process.env.OPENAI_API_KEY,
    max_tokens: 1500,
    max_retries: 3,
    timeout: 60000, 
  });

  let contentArray = [];

  if (userText) {
    contentArray.push({ type: "text", text: userText });
  }

  if (imageBase64) {
    // Accept either a full data URL (data:<mime>;base64,...) or a raw base64 string.
    let imageUrl = null;
    if (typeof imageBase64 === "string" && imageBase64.startsWith("data:")) {
      imageUrl = imageBase64;
    } else if (typeof imageBase64 === "string") {
      imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    }

    if (imageUrl) {
      contentArray.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }
  }

  const userMessageContent = contentArray.length > 1 ? contentArray : userText;
  const userMessage = new HumanMessage({ content: userMessageContent });

  chatHistory.push(userMessage);

  console.log("Current Chat History Length:", chatHistory.length);

  const response = await chatModel.invoke(chatHistory);

  chatHistory.push(new AIMessage(response.content));

  // We return the raw response from the AI.
  // It could be regular chat text, or it could be the JSON recipe array if the AI was ready.
  // We will let server.js handle parsing it and sending it correctly to the frontend.
  return response.content;
};

export const clearChefHistory = () => {
  chatHistory = [new SystemMessage(CHEF_SYSTEM_PROMPT)];
};