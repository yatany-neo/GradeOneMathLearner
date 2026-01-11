
import { GoogleGenAI, Type } from "@google/genai";
import { MathProblem } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateProblem = async (category: string): Promise<MathProblem> => {
  const prompt = `你是一位中国资深小学一年级数学老师。请根据目录 "${category}" 生成一道适合一年级学生（6-7岁）的数学练习题。
  要求：
  1. 题目生动有趣，常结合生活场景（如：水果、小动物、文具）。
  2. 选项必须包含4个，其中一个是正确答案。
  3. 如果是加减法，数值控制在20以内。如果是人民币，注意单位（元、角、分）。
  4. 提供详细、通俗易懂的解析，用孩子能听懂的话。
  5. 语言为中文。`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          explanation: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["question", "options", "answer", "explanation"]
      },
    },
  });

  return JSON.parse(response.text || "{}");
};
