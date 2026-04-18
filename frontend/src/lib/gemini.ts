/**
 * Gemini AI Utility for Professional Ecosystem Analysis
 * This handles AI matching, profile optimization, and content suggestions.
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.5-flash"; // Using the latest high-performance flash model

export async function calculateJobMatch(profile: any, job: any) {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API Key missing. Falling back to mock scoring.");
    return Math.floor(Math.random() * (98 - 75 + 1)) + 75;
  }

  try {
    const prompt = `
      You are an expert technical recruiter. Analyze the match between this professional profile and the job description.
      
      User Profile:
      - Skills: ${profile.skills?.join(", ")}
      - Experience: ${profile.experience?.length} roles
      - Headline: ${profile.headline}
      
      Job Requirements:
      - Title: ${job.title}
      - Skills Needed: ${job.skills?.join(", ")}
      - Description Snippet: ${job.description}
      
      Return ONLY a JSON object with:
      1. score: (0-100 integer)
      2. reasoning: (1 sentence why)
      3. missing_skills: (array of strings)
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);
    return result;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return { score: 85, reasoning: "Fallback score due to API error.", missing_skills: [] };
  }
}
