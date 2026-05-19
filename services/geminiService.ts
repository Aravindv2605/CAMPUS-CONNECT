import { GoogleGenerativeAI } from "@google/generative-ai";

// Groq for text - free and no limits
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Gemini for images only
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Text responses via Groq (free, no limits)
export async function getAIResponse(prompt: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are CampusConnect AI, a helpful and friendly campus assistant for college students. Help with courses, assignments, exams, fees, timetable, events, and campus life. Keep responses concise and use emojis occasionally."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1024,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices[0]?.message?.content || "Sorry, I could not process that.";
}

// Image responses via Gemini
export async function generateResponseFromImage(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            },
            {
              type: "text",
              text: prompt || "What does this image show?"
            }
          ]
        }
      ],
      max_tokens: 1024,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Groq vision error");
  return data.choices[0]?.message?.content || "Sorry, I could not process that image.";
}