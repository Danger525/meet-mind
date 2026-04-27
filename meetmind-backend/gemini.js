const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function transcribeAudio(audioPath) {
  try {
    const audioData = fs.readFileSync(audioPath);
    const base64Audio = audioData.toString('base64');

    const prompt = `You are MeetMind — an intelligent meeting analyst.

You will receive a raw audio recording of a meeting. 
Detect the primary language(s) spoken in the meeting. 
Your entire analysis (titles, summaries, action items, etc.) MUST be provided in the SAME language as the meeting audio. If multiple languages are used (like Hinglish), the output should reflect that natural mix.

Your job is to produce a structured JSON with the following:

{
  "meeting_title": "Inferred title based on discussion",
  "meeting_date": "extracted or null",
  "duration_estimate": "estimated in minutes",
  "participants": ["list of speaker names if identifiable"],
  "language_detected": "English / Hindi / Hinglish / Mixed",

  "executive_summary": "3-4 sentence summary of what this meeting was about and what was decided. Match the language of the meeting.",

  "key_decisions": [
    {
      "decision": "What was decided",
      "made_by": "Who decided (if clear)",
      "impact": "Why this matters"
    }
  ],

  "action_items": [
    {
      "task": "Specific task to be done",
      "owner": "Person responsible (if mentioned)",
      "deadline": "Deadline if mentioned, else null",
      "priority": "High / Medium / Low"
    }
  ],

  "follow_up_questions": [
    "Things that were left unresolved or need clarification"
  ],

  "risks_flagged": [
    "Any concerns, blockers, or risks mentioned in the meeting"
  ],

  "client_or_vendor_mentions": [
    {
      "name": "Company or person name",
      "context": "What was said about them"
    }
  ],

  "sentiment": "Positive / Neutral / Tense / Conflicted",
  "sentiment_reason": "One line explaining why",

  "meeting_type": "Internal / Client-facing / Vendor call",

  "whatsapp_summary": "A crisp 5-7 line summary in simple language that can be directly sent on WhatsApp to all attendees. Use bullet points with emojis. Keep it under 150 words."
}

Rules:
- **Language Fidelity**: Detect the primary language of the meeting. You MUST provide the entire JSON response values (except keys) in that SAME language. Do not translate to English unless the meeting itself was in English.
- Never hallucinate names or decisions not in the transcript
- If something is unclear, mark it as null — do not guess
- The whatsapp_summary must be readable by a non-technical person
- If participants are arguing or there is tension, flag it in sentiment
- Always output valid JSON only. No markdown, no explanation outside JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'audio/webm',
          data: base64Audio
        }
      }
    ]);

    const response = result.response;
    const text = response.text();
    console.log('Raw Gemini response:', text);

    // Parse the JSON response, stripping markdown code fences if present
    let cleanText = text.trim();
    // Remove ```json or ``` at start and ``` at end
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    
    console.log('Cleaned text (first 200 chars):', cleanText.substring(0, 200));
    const summary = JSON.parse(cleanText);
    return summary;
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
}

module.exports = { transcribeAudio };