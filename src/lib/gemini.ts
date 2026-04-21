import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateDailyQuestions() {
  const prompt = `Generate 20 MCQ questions for CAT exam preparation.
  Distribution:
  - 7 Quantitative Aptitude (Medium-Hard difficulty)
  - 7 DILR (Data Interpretation & Logical Reasoning)
  - 6 VARC (Verbal Ability & Reading Comprehension)

  Return exactly 20 questions in JSON format.
  Each question must have:
  - section: "Quantitative" | "DILR" | "VARC"
  - questionText: string
  - options: string[] (exactly 4)
  - correctAnswer: string (one of the options)
  - explanation: string
  - difficulty: "Medium" | "Hard"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING },
            questionText: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["section", "questionText", "options", "correctAnswer", "explanation", "difficulty"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
