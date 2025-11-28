
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ViralMetrics, StyleDNA, TrendReport, Language } from "../types";
import { ChannelRawData } from "./youtube";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Gerador de System Instruction dinâmico baseado no idioma
const getSystemInstruction = (lang: Language) => {
  const isPt = lang === 'pt-br';
  return `You are "The Archivist", a core component of ScriptOS. 
You are an expert in creating dark, investigative, and documentary-style content for platforms like YouTube.
Your personality is cold, professional, and brutally honest. You value retention, shock value, and truth.
YOUR OUTPUT LANGUAGE IS: ${isPt ? 'PORTUGUESE (BRAZIL)' : 'ENGLISH (US)'}.

RULES:
1. When writing scripts, start with an aggressive hook in the first 5 seconds.
2. NEVER use generic AI openers like "In this video we will explore" or "Neste vídeo vamos explorar". Be visceral.
3. Use short sentences. Focus on sensory details.
4. If asked to analyze, be a harsh critic. Give low scores if the content is boring.
5. Format script output in Markdown with cues for [VISUALS] and [AUDIO].`;
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
  console.error("Failed to parse JSON response:", text);
  return null;
};

export const generateScript = async (
  topic: string,
  style: StyleDNA,
  duration: string,
  lang: Language,
  contextData?: string
): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Create a script for a video.
    LANGUAGE: ${lang === 'pt-br' ? 'Portuguese (Brazil)' : 'English'}
    TOPIC: ${topic}
    STYLE DNA: ${style.name} (${style.tone})
    DURATION: ${duration}
    CONTEXT/DATA: ${contextData || 'None provided. Use your knowledge base.'}

    Structure the script with sections: HOOK, INTRO, BODY (divided by key points), OUTRO.
    Include [VISUAL CUE] and [AUDIO CUE] directives in bold brackets.
    If you need to verify facts, use Google Search.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(lang),
        tools: [{ googleSearch: {} }] 
      },
    });
    return response.text || "Error: No text generated.";
  } catch (error) {
    console.error("Script generation failed:", error);
    return "SYSTEM ERROR: Could not generate script. Check Neural Link (API Key).";
  }
};

export const remixScript = async (currentContent: string, mode: 'RETENTION' | 'CONTROVERSY', lang: Language): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Rewrite the following script to maximize ${mode}.
    LANGUAGE: ${lang === 'pt-br' ? 'Portuguese (Brazil)' : 'English'}
    
    IF RETENTION: Focus on removing fluff, increasing pacing, and adding open loops (questions not immediately answered).
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
      hookScore: { type: Type.NUMBER, description: "0-100 score on how grabbing the intro is." },
      retentionScore: { type: Type.NUMBER, description: "0-100 score on pacing and interest." },
      controversyScore: { type: Type.NUMBER, description: "0-100 score on potential for debate/shock." },
      feedback: { type: Type.STRING, description: "Brutally honest qualitative feedback." }
    },
    required: ["hookScore", "retentionScore", "controversyScore", "feedback"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this script for viral potential on YouTube. Be harsh. Output feedback in ${lang === 'pt-br' ? 'Portuguese' : 'English'}.\n\nSCRIPT:\n${scriptContent.substring(0, 5000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: getSystemInstruction(lang)
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ViralMetrics;
      return data;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Analysis failed", error);
    return { hookScore: 0, retentionScore: 0, controversyScore: 0, feedback: "Analysis Failed: " + (error as Error).message };
  }
};

export const decodeStyle = async (input: string, lang: Language): Promise<StyleDNA> => {
  const ai = getClient();

  const prompt = `
    Analyze the following input to create a "Style DNA Profile" for a content creator.
    LANGUAGE OUTPUT: ${lang === 'pt-br' ? 'Portuguese (Brazil)' : 'English'}
    
    INPUT: "${input}"

    INSTRUCTIONS:
    1. If the input is a YouTube URL or Channel Name, use Google Search to find reviews, channel descriptions, popular upload styles, and community discussions about this channel.
    2. If the input is text, analyze the writing style directly.
    3. Determine the Tone, Structure, and Audio Signature.

    OUTPUT FORMAT:
    Return ONLY a JSON object.
    {
      "name": "Creative name for this style (e.g. 'Investigative Noir')",
      "tone": "3 adjectives (e.g. 'Cynical, Fast-paced, Dark')",
      "structure": "The typical video flow (e.g. 'Cold Open -> Montage -> Deep Dive')",
      "audioSignature": "Music/SFX style (e.g. 'Synthwave, Distortion')",
      "description": "A brief summary of why this style is effective."
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
    throw new Error("Model response was not valid JSON");
  } catch (error) {
    console.error("Decode failed", error);
    return {
      id: 'error',
      name: 'Decryption Failed',
      tone: 'Unknown',
      structure: 'Unknown',
      audioSignature: 'Unknown',
      description: `System failed to decode style. Error: ${(error as Error).message}`
    };
  }
};

export const decodeChannelFromData = async (data: ChannelRawData, lang: Language): Promise<StyleDNA> => {
  const ai = getClient();
  
  const contextString = `
    CHANNEL: ${data.title} (${data.customUrl})
    SUBSCRIBERS: ${data.subscribers}
    DESCRIPTION: ${data.description}
    KEYWORDS: ${data.keywords}
    RECENT VIDEO PATTERNS:
    ${data.recentVideos.map((v, i) => `${i+1}. "${v.title}" - ${v.description}`).join('\n')}
  `;

  const prompt = `
    Analyze the raw channel data provided below and construct a Style DNA profile.
    Infer the content strategy, tone, and production style based on the video titles, descriptions, and channel branding.
    LANGUAGE OUTPUT: ${lang === 'pt-br' ? 'Portuguese (Brazil)' : 'English'}

    DATA:
    ${contextString}

    OUTPUT FORMAT:
    Return ONLY a JSON object:
    {
      "name": "Creative name for this style",
      "tone": "3 adjectives",
      "structure": "Typical flow inferred from content",
      "audioSignature": "Inferred audio vibe",
      "description": "Analysis of their viral strategy"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
         responseMimeType: "application/json"
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as Omit<StyleDNA, 'id'>;
      return {
        id: crypto.randomUUID(),
        ...parsed
      };
    }
    throw new Error("No response generated");

  } catch (error) {
     return {
      id: 'error',
      name: 'Decryption Failed',
      tone: 'Unknown',
      structure: 'Unknown',
      audioSignature: 'Unknown',
      description: `System failed to decode channel data. Error: ${(error as Error).message}`
    };
  }
};

export const trendHunt = async (query: string, lang: Language): Promise<TrendReport> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find obscure, dark, or trending topics related to: "${query}". 
      Focus on mysteries, unsolved cases, internet folklore, or disturbing facts.
      Provide a comprehensive summary in ${lang === 'pt-br' ? 'Portuguese' : 'English'}.
      
      Always cite your sources implicitly by using the search tool.`,
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

    const uniqueSources = Array.from(new Map(sources.map((s:any) => [s.uri, s])).values()) as {title: string, uri: string}[];

    return {
      content: response.text || "No trends found in the static.",
      sources: uniqueSources
    };

  } catch (error) {
    return {
      content: `Connection to search grid failed. Error: ${(error as Error).message}`,
      sources: []
    };
  }
};
