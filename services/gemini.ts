
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ViralMetrics, StyleDNA, TrendReport, Language, TitleVariant, ThumbnailData, ScriptReference, ChatMessage } from "../types";
import { ChannelRawData } from "./youtube";
import { getUserProfile } from "./storage";

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Gerador de System Instruction dinâmico baseado no idioma
const getSystemInstruction = (lang: Language) => {
  const isPt = lang === 'pt-br';
  const profile = getUserProfile();
  
  let identityContext = "";
  if (profile) {
    identityContext = `
    CREATOR IDENTITY (CRITICAL):
    - Channel: ${profile.channelName || 'Unknown'}
    - Brand Voice: ${profile.identity.brandVoice}
    - Target Audience: ${profile.identity.targetAudience}
    - Manifesto: ${profile.identity.manifesto}
    
    ADAPT YOUR OUTPUT TO MATCH THIS IDENTITY PERFECTLY.
    `;
  }

  return `You are "A.I.N.A" (Automated Investigative Narrative Assistant), the core engine of ScriptOS. 
You are an expert in creating dark, investigative, and documentary-style content for platforms like YouTube.
Your personality is cold, professional, and brutally honest. You value retention, shock value, and truth.
YOUR OUTPUT LANGUAGE IS: ${isPt ? 'PORTUGUESE (BRAZIL)' : 'ENGLISH (US)'}.

${identityContext}

RULES:
1. When writing scripts, start with an aggressive hook in the first 5 seconds.
2. NEVER use generic AI openers like "In this video we will explore". Be visceral.
3. Use short sentences. Focus on sensory details.
4. Format script output in Markdown with cues for [VISUALS] and [AUDIO].`;
};

// Robust JSON Extractor
const parseJSON = <T>(text: string): T | null => {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) return JSON.parse(match[1]) as T;
    } catch (e2) {
      // Ignore
    }
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.substring(start, end + 1)) as T;
      }
    } catch (e3) {
      // Ignore
    }
  }
  return null;
};

export const generateViralTitles = async (topic: string, lang: Language): Promise<TitleVariant[]> => {
  const ai = getClient();
  const prompt = `
    Generate 5 viral YouTube titles for a video about: "${topic}".
    Use click-worthy psychological triggers (Fear, Curiosity, Greed, Negativity Bias).
    Output LANGUAGE: ${lang === 'pt-br' ? 'Portuguese (Brazil)' : 'English'}.
    
    Return JSON array format:
    [{ "title": "...", "psychology": "Explained trigger", "score": 95 }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJSON<TitleVariant[]>(response.text || '') || [];
  } catch (e) {
    return [];
  }
};

export const generateThumbnailConcept = async (title: string, topic: string, style: StyleDNA, lang: Language): Promise<ThumbnailData> => {
  const ai = getClient();
  const prompt = `
    Design a high-CTR YouTube thumbnail concept for:
    TITLE: "${title}"
    TOPIC: "${topic}"
    STYLE: ${style.name} (${style.tone})

    1. Create a "Concept" description explaining the visual strategy.
    2. Create a "Image Prompt" optimized for an AI image generator (detailed, describing lighting, composition, subject).
    
    Output JSON: { "concept": "...", "imagePrompt": "..." }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return parseJSON<ThumbnailData>(response.text || '') || { concept: '', imagePrompt: '' };
  } catch (e) {
    return { concept: 'Error generating concept', imagePrompt: '' };
  }
};

export const generateThumbnailImage = async (imagePrompt: string): Promise<string | undefined> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: {}
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const generateScript = async (
  topic: string,
  style: StyleDNA,
  duration: string,
  lang: Language,
  contextData?: string,
  title?: string,
  thumbnailDesc?: string,
  references?: ScriptReference[]
): Promise<string> => {
  const ai = getClient();
  
  const contentParts: any[] = [];
  
  const textPrompt = `
    Create a script for a video.
    LANGUAGE: ${lang === 'pt-br' ? 'Portuguese (Brazil)' : 'English'}
    
    METADATA:
    - TOPIC: ${topic}
    - SELECTED TITLE: ${title || 'N/A'}
    - THUMBNAIL VISUAL: ${thumbnailDesc || 'N/A'}
    - STYLE: ${style.name} (${style.tone})
    - DURATION: ${duration}
    
    ADDITIONAL CONTEXT NOTES: 
    ${contextData || 'None.'}

    INSTRUCTIONS:
    1. Start with the HOOK. If a thumbnail description is provided, reference that visual element immediately.
    2. Structure: HOOK -> INTRO -> BODY (Key Points) -> OUTRO.
    3. Include [VISUAL CUE] directives.
    4. If references (images/PDFs) are provided, analyze them to extract facts.
  `;
  contentParts.push({ text: textPrompt });

  if (references) {
    for (const ref of references) {
      if (ref.type === 'FILE' && ref.mimeType && ref.data) {
        contentParts.push({
          inlineData: {
            mimeType: ref.mimeType,
            data: ref.data
          }
        });
        contentParts.push({ text: `[REFERENCE FILE: ${ref.title}]` });
      } else if (ref.type === 'YOUTUBE_VIDEO' || ref.type === 'URL') {
        contentParts.push({ text: `[REFERENCE LINK: ${ref.title}] \n URL: ${ref.data} \n METADATA: ${JSON.stringify(ref.metadata || {})}` });
      }
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentParts },
      config: {
        systemInstruction: getSystemInstruction(lang),
        tools: [{ googleSearch: {} }] 
      },
    });
    return response.text || "Error: No text generated.";
  } catch (error) {
    return "SYSTEM ERROR: Could not generate script.";
  }
};

export const remixScript = async (currentContent: string, mode: 'RETENTION' | 'CONTROVERSY', lang: Language): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Rewrite the following script to maximize ${mode}.
    
    IF RETENTION: Focus on removing fluff, increasing pacing, and adding open loops.
    IF CONTROVERSY: Focus on stronger opinions, darker truths, and challenging the viewer's worldview.
    
    SCRIPT CONTENT:
    ${currentContent}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(lang)
      }
    });
    return response.text || currentContent;
  } catch (error) {
    return currentContent;
  }
};

export const analyzeViralScore = async (scriptContent: string, lang: Language): Promise<ViralMetrics> => {
  const ai = getClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      hookScore: { type: Type.NUMBER },
      retentionScore: { type: Type.NUMBER },
      controversyScore: { type: Type.NUMBER },
      feedback: { type: Type.STRING }
    },
    required: ["hookScore", "retentionScore", "controversyScore", "feedback"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this script for viral potential on YouTube.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getSystemInstruction(lang)
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ViralMetrics;
    }
    throw new Error("No data returned");
  } catch (error) {
    return { hookScore: 0, retentionScore: 0, controversyScore: 0, feedback: "Analysis Failed" };
  }
};

export const decodeStyle = async (input: string, lang: Language): Promise<StyleDNA> => {
  const ai = getClient();

  const prompt = `
    Analyze the following input to create a "Style DNA Profile".
    INPUT: "${input}"
    INSTRUCTIONS: Determine the Tone, Structure, and Audio Signature.

    OUTPUT FORMAT: JSON.
    {
      "name": "Creative name",
      "tone": "3 adjectives",
      "structure": "Video flow",
      "audioSignature": "Music/SFX style",
      "description": "Summary"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    if (response.text) {
      const data = parseJSON<Omit<StyleDNA, 'id'>>(response.text);
      if (data && data.name) {
        return {
          id: crypto.randomUUID(),
          ...data
        };
      }
    }
    throw new Error("Invalid JSON");
  } catch (error) {
    return {
      id: 'error',
      name: 'Decryption Failed',
      tone: 'Unknown',
      structure: 'Unknown',
      audioSignature: 'Unknown',
      description: `System failed to decode style.`
    };
  }
};

export const decodeChannelFromData = async (data: ChannelRawData, lang: Language): Promise<StyleDNA> => {
  const ai = getClient();
  const prompt = `
    Analyze the raw channel data below and construct a Style DNA profile.
    
    CHANNEL DATA:
    Title: ${data.title}
    Desc: ${data.description}
    Recent Videos: ${data.recentVideos.map(v => v.title).join(', ')}

    OUTPUT FORMAT JSON:
    { "name": "...", "tone": "...", "structure": "...", "audioSignature": "...", "description": "..." }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as Omit<StyleDNA, 'id'>;
      return { id: crypto.randomUUID(), ...parsed };
    }
    throw new Error("No response");

  } catch (error) {
     return {
      id: 'error',
      name: 'Decryption Failed',
      tone: 'Unknown',
      structure: 'Unknown',
      audioSignature: 'Unknown',
      description: `System failed to decode channel.`
    };
  }
};

export const trendHunt = async (query: string, lang: Language): Promise<TrendReport> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find dark/trending topics related to: "${query}". Provide a summary.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || 'Unknown Source',
        uri: chunk.web?.uri || '#'
      }))
      .filter((s: any) => s.uri !== '#') || [];

    return {
      content: response.text || "No trends found.",
      sources: Array.from(new Map(sources.map((s:any) => [s.uri, s])).values()) as any
    };

  } catch (error) {
    return { content: `Error: ${(error as Error).message}`, sources: [] };
  }
};

// --- CHAT WITH AINA ---
export const chatWithAINA = async (history: ChatMessage[], newMessage: string, lang: Language): Promise<string> => {
  const ai = getClient();
  const system = getSystemInstruction(lang);
  
  // Convert history to Gemini format
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: chatHistory,
      config: {
        systemInstruction: system
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "...";
  } catch (e) {
    console.error(e);
    return "AINA SYSTEM ERROR: Neural Link Unstable.";
  }
};
