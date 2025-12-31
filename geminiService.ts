
import { GoogleGenAI } from "@google/genai";

/**
 * Generates encouraging academic remarks based on subject scores.
 */
export const generateReportRemarks = async (studentName: string, scores: any[]) => {
  // Initialize AI client right before the call as per recommended practices
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Based on the following scores for student ${studentName}, generate a 2-sentence encouraging academic remark for a school report card: ${JSON.stringify(scores)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Keep up the hard work!";
  } catch (error) {
    console.error("AI remark generation failed:", error);
    return "Consistently showing good progress across all subjects.";
  }
};

/**
 * Drafts a professional school announcement for WhatsApp.
 */
export const draftWhatsAppAnnouncement = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a professional but friendly school WhatsApp announcement message about: ${topic}. Include emojis.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `Announcement: ${topic}`;
  } catch (error) {
    console.error("AI announcement generation failed:", error);
    return `📢 Important Update: ${topic}. Please check the notice board for details.`;
  }
};
