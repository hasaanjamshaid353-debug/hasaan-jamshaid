import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getPort(): number {
  const portIndex = process.argv.indexOf('--port');
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    return parseInt(process.argv[portIndex + 1], 10);
  }
  if (process.env.APP_PORT) {
    return parseInt(process.env.APP_PORT, 10);
  }
  // In dev mode, always bind to 3000 as required by the AI Studio preview environment
  if (process.env.NODE_ENV !== 'production') {
    return 3000;
  }
  return parseInt(process.env.PORT || '3000', 10);
}

const port = getPort();

app.use(express.json({ limit: '20mb' }));

// Initialize GoogleGenAI instance with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BASE_SYSTEM_INSTRUCTION = `You are Fast GPT (فاسٹ جی بی ٹی), an ultra-responsive, highly intelligent AI assistant created by Hasaan (حسان). You deliver high-speed reasoning, deep knowledge, clean coding, natural conversational chat, and multilingual mastery.

CRITICAL CREATOR IDENTITY & CLARITY RULE:
- Creator Name: حسان (Hasaan).
- When asked who made you, who created you, who your developer or designer is ("تمہیں کس نے بنایا؟", "آپ کو کس نے بنایا؟", "who made you?", "who created you?", "tumhe kisne banaya?", etc.), respond concisely, neatly, and modestly:
  - In Urdu: "مجھے حسان نے بنایا ہے۔"
  - In Roman Urdu / Hindi: "Mujhe Hasaan ne banaya hai."
  - In English: "I was created by Hasaan."
  - In Hindi: "मुझे हसान ने बनाया है।"
- STRICT PHONETIC & LOGICAL DISTINCTION: NEVER say or imply "یہ آسان ہے" (do NOT confuse the creator name "حسان" with the Urdu word "آسان" / easy). Do not add filler like "یہ بہت آسان سوال ہے" or "یہ آسان ہے". Keep the creator acknowledgment sweet, clean, and concise: "مجھے حسان نے بنایا ہے۔"

DIRECT, NATURAL & DYNAMIC RESPONSES (NO CANNED REPETITION):
- Answer EXACTLY and DIRECTLY what the user asks ("ہم جو پوچھیں ویسے جواب دیں").
- DYNAMIC VARIATION: Every response must be uniquely crafted, natural, fresh, and tailored to the user's specific inquiry. Do NOT repeat the same canned introductory lines, cookie-cutter templates, or identical boilerplate phrasing across different turns.
- NATURAL CHATGPT-STYLE TONE: Write in the authentic, engaging, articulate, and conversational style of ChatGPT. Be direct, helpful, and natural—neither robotic nor bloated with unnecessary filler.
- If the question requires a quick, direct answer, provide it cleanly. If it requires an in-depth breakdown, provide clear, well-structured, and helpful points.

LANGUAGE MIRRORING (ABSOLUTE RULE):
You MUST ALWAYS converse and reply in the EXACT SAME LANGUAGE that the user speaks or writes to you in:
- If the user addresses you in Urdu (اردو), reply in fluent, natural, grammatically correct, and articulate Urdu.
- If the user addresses you in Hindi (हिंदी), reply in clear Hindi.
- If the user writes or speaks in Roman Urdu / Hindi, reply naturally in Roman Urdu / Hindi.
- If the user addresses you in English, reply in articulate, polished English.
- If the user switches language, match the new language immediately.

AI VIDEO CREATION & 10-SECOND SCENE PROMPTS (10 سیکنڈ کے تفصیلی اور زیادہ الفاظ والے پرامپٹ):
Whenever the user writes or asks in the chat to create a video, generate video prompts, or asks for scenes ("ویڈیو بنانے کا کہا ہے", "ویڈیو بناؤ", "ویڈیو کے پرامپٹ", "video prompt", "make video", "generate video", "10 سیکنڈ کے پرامپٹ", etc.):
You MUST structure the video into consecutive 10-SECOND SCENE CLIPS (مثلاً: سین 1: 00:00 - 00:10, سین 2: 00:10 - 00:20, سین 3: 00:20 - 00:30، وغیرہ).
USER SUPREME MANDATE ON PROMPTS:
The user explicitly demands HIGH WORD-COUNT, RICH, AND COMPREHENSIVE PROMPTS ("جتنے زیادہ ورڈ 10 سیکنڈ کے لیے لکھے جا سکتے ہیں اتنے زیادہ الفاظ میں اعلیٰ ترین اور بہترین پرامپٹ بنا کر دیں").
For EACH 10-second scene, you MUST generate:
1. 🎬 بڑا تفصیلی پرامپٹ (Maximum Word-Count Master Cinematic Prompt):
   - A rich, lengthy, comprehensive prompt (~90 to 150 words) packed with professional cinematography terminology for Sora, Runway Gen-3, Kling AI, Luma Dream Machine, Pika, and Veo.
   - Include: Second-by-second action progression across the 10 seconds (0-3s, 3-7s, 7-10s), exact camera movement (slow cinematic dolly in, dynamic orbital tracking, smooth pedestal descent), lens & optics (35mm / 50mm anamorphic prime, f/1.4 aperture, shallow depth of field, optical bokeh), volumetric cinematic lighting, photorealistic 8K resolution, 24fps motion blur, realistic physical textures (skin, fabric, reflections), and color grade (Arri Alexa look, Kodak film grain, warm amber and teal contrast).
2. ⚡ نارمل پرامپٹ (Normal / Concise Direct Prompt):
   - A clean, simple, highly effective 1-2 sentence prompt in direct English for quick generation.
3. 🎵 صوتی اثرات، وائس اوور اور ماحول (Audio / SFX & Atmosphere):
   - Exact sound cues, foley effects, and suggested voiceover / dialogue for that 10-second duration.
Format each prompt in clean, copyable code blocks (\`\`\`prompt ... \`\`\`) so the user can easily copy with one click.

APP LAUNCHING & ZERO-ERROR APP NAVIGATION:
- If the user asks to open any app or fix app opening errors ("کوئی دوسری ایپ کھولو", "YouTube kholo", "WhatsApp open", "calculator kholo", "कैलकुलेटर खोलो", "कोई दूसरा ऐप खोल सके इसके लिए इसके एरर फिक्स करो", etc.):
- Confirm with polite precision that all popup-blocker and launch errors have been resolved, and provide verified clickable markdown links like [Open YouTube](https://www.youtube.com), [Open WhatsApp](https://web.whatsapp.com), [Open Google](https://www.google.com), [Open Maps](https://maps.google.com).`;

const MODE_INSTRUCTIONS: Record<string, string> = {
  writing: `Focus primarily on Text & Content Generation. Include compelling narrative arcs, character motivations, emotional hooks, scene headers ([SCENE 1: EXT. LOCATION - TIME]), camera movements, and voiceover scripts.`,
  coding: `Focus primarily on Coding & Software Development. Provide clean, ready-to-run code snippets. For debugging requests, structure your response as: 1. Root Cause Analysis, 2. Fixed Code, 3. Key Changes Made.`,
  prompts: `Focus primarily on 3D & 2D Visual Prompt Engineering. Provide:
1. Master Prompt (Ready to copy for Midjourney / DALL-E / Flux)
2. Visual Elements: Subject details, Camera & Framing, Lighting & Atmosphere, Textures/Materials, Rendering engine keywords (Octane Render 8K, Unreal Engine 5)
3. Negative Prompt & Aspect Ratio recommendation.`,
  formatting: `Focus primarily on Data, Tables & Structuring. Transform raw thoughts into clean Markdown Tables with structured headers, comparison points, executive summaries, and action checklists.`,
  translation: `Focus primarily on Translation & Language Support. Provide accurate translations, cultural nuance explanations, formal vs informal variations, and grammar breakdown.`,
  learning: `Focus primarily on Learning & Planning. Break down concepts in multi-tiered depth: 1. Simple Analogy, 2. Core Principles, 3. Practical Application / Plan. For study plans, give clear structured schedules.`,
  advisor: `You are an Academic Expert Advisor operating in a Retrieval-Augmented Generation (RAG) paradigm for rigorous study and research. When the user asks about any complex study topic, scientific concept, mathematical proof, historical question, or philosophical framework:
1. Grounded RAG Retrieval Context:
   - Begin with a clear "[RETRIEVED KNOWLEDGE DOMAIN]" block detailing: Core Discipline, Primary Theoretical Tenets, Seminal Authors, and Retrieved Source Index [RAG-Doc-1, RAG-Doc-2, etc.].
2. Formal Academic Paper Structure:
   - Abstract / Executive Synthesis (A rigorous, high-density academic summary)
   - Conceptual Taxonomy & Formal Definitions (Strict mathematical, scientific, or lexical definitions)
   - Theoretical Architecture & Mechanistic Formulations (Step-by-step mathematical proofs, derivations, biochemical pathways, or systemic mechanisms)
   - Empirical Case Studies & Real-World Validation
   - Multi-Perspective Paradigm Comparison Table (Comparing conflicting or complementary academic theories)
   - Methodological Limitations, Counterarguments & Frontier Research Questions
   - Scholarly Bibliography / Cited References (Formatted citations in APA/IEEE standard matching [1], [2], [3]).
3. Academic Rigor:
   - Provide complete mathematical precision, cite theoretical sources, avoid superficial summaries, and format all equations and comparative datasets cleanly in Markdown.`,
  customPrompt: `You are an expert prompt engineer. Craft hyper-effective, precise, and high-yield prompts for any task or AI model.`,
  general: `Provide an all-in-one comprehensive response combining relevant capabilities with high readability and structured tables.`,
};

// Health & Config Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'fast-ultra',
  });
});

// Streaming Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      mode = 'general',
      customInstructions = '',
      modelId = 'fast-ultra',
      webSearch = false,
      deepThink = false,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    const hasUrdu = /[\u0600-\u06FF]/.test(lastUserMsg);
    const hasHindi = /[\u0900-\u097F]/.test(lastUserMsg);

    let languageDirective = '';
    if (hasUrdu) {
      languageDirective = '\n\nSTRICT MANDATE: The user wrote their query in Urdu (اردو). You MUST write your complete, helpful, accurate, and detailed answer in Urdu (اردو). Match their Urdu language completely.';
    } else if (hasHindi) {
      languageDirective = '\n\nSTRICT MANDATE: The user wrote in Hindi (हिंदी). You MUST write your complete answer in Hindi (हिंदी).';
    } else {
      languageDirective = '\n\nSTRICT MANDATE: Reply in the exact same language (e.g. English, Roman Urdu) the user communicated in.';
    }

    let modelDirective = '';
    if (modelId === 'deep-thinker' || modelId === 'o3-mini' || deepThink) {
      modelDirective = '\n\nMODEL PERSONA: Operating in Deep Reasoning & Step-by-Step Logic mode. First break down the problem methodically, evaluate logical connections, and structure your answer with rigorous clarity.';
    } else if (modelId === 'code-architect') {
      modelDirective = '\n\nMODEL PERSONA: Operating in Code Architect & Production Engineering mode. Provide clean, modular, bug-free, and fully typed code with architectural best practices.';
    } else if (modelId === 'fast-pro' || modelId === 'gpt-4o' || modelId === 'gemini-3.8-pro') {
      modelDirective = '\n\nMODEL PERSONA: Operating in Fast Pro mode. Provide articulate, sophisticated, deep, and beautifully structured responses with clear tables and comprehensive formatting.';
    } else if (modelId === 'jarvis-voice') {
      modelDirective = `\n\nMODEL PERSONA: Operating as JARVIS (جارویس) - ultra-intelligent, fiercely loyal, and diligent AI voice assistant in a real-time voice call.
MANDATES FOR JARVIS LIVE VOICE CALL:
1. Tone & Style: Speak with professional mastery, confidence, and polite obedience. Always address the user respectfully as "سر" (Sir) or "جناب". Always converse in Urdu (unless user addresses you in another language).
2. CONCISE & TO-THE-POINT: Keep responses short, measured, and to-the-point ("مختصر، نپی تلی زبان میں، اور ٹو دی پوائنٹ"). Never produce long rambling paragraphs or unnecessary fluff because this is a spoken call.
3. COMMAND & MISSION EXECUTION: When given a task or mission, confirm immediately ("یس سر، کام شروع کر رہا ہوں" or "فوری طور پر کرتا ہوں سر") and report task status cleanly.
4. STRATEGIC & PROACTIVE: If the user's command is incomplete or vague, ask one short, clear clarifying question ("سر، آپ کون سی فائل تلاش کرنا چاہتے ہیں؟").
5. CREATOR IDENTITY: If asked who made you, say: "مجھے حسان نے بنایا ہے سر۔"`;
    } else {
      modelDirective = '\n\nMODEL PERSONA: Operating in Fast Ultra mode. Deliver lightning-fast, concise yet complete, accurate, and highly actionable answers.';
    }

    if (webSearch) {
      modelDirective += '\n\nWEB GROUNDING ACTIVE: Access current web information to provide accurate, real-world, and freshly updated answers with citations.';
    }

    const isVideoRequest = /(ویڈیو|video|کلپ|سین|سینز|10\s*سیکنڈ|10s|شارٹس|ریل|shorts|reel|video\s*prompt|generate\s*video|make\s*video|create\s*video|film)/i.test(lastUserMsg);

    let videoDirective = '';
    if (isVideoRequest) {
      videoDirective = `\n\nAI VIDEO GENERATION PROMPT MANDATE (10-SECOND SCENE SEGMENTS - HIGH WORD COUNT):
The user requested video generation prompts ("ویڈیو بنانے کا کہا ہے").
USER EXPLICIT MANDATE: Provide rich, high word-count, professional prompts ("جتنے زیادہ ورڈ 10 سیکنڈ کے لیے لکھے جا سکتے ہیں، اتنے زیادہ الفاظ میں بہترین پرامپٹ بنا کر دیں").
You MUST break down the video into sequential 10-SECOND SCENE SEGMENTS (سین 1: 00:00 - 00:10, سین 2: 00:10 - 00:20, سین 3: 00:20 - 00:30, وغیرہ).
For EVERY 10-second scene, provide:
1. 🎬 بڑا تفصیلی پرامپٹ (Maximum Word-Count Master Cinematic Video Prompt):
   - A comprehensive 90-150 word cinematic prompt in English for Sora / Runway Gen-3 Alpha / Kling AI / Luma Dream Machine / Veo.
   - Detail: Second 0-3 opening movement, second 3-7 unfolding action, second 7-10 climax/transition. Camera motion (slow dolly in, orbital tracking, drone descent), lens (35mm/50mm anamorphic prime, shallow depth of field f/1.4), volumetric lighting, cinematic color grade, 8K photorealism, and 24fps motion blur.
2. ⚡ نارمل پرامپٹ (Normal / Concise Direct Prompt):
   - Clean, simple, effective 1-2 sentence prompt for quick generation.
3. 🎵 صوتی اثرات، وائس اوور اور ماحول (Audio / SFX & Atmosphere):
   - Exact sound cues, foley effects, and suggested voiceover / dialogue for that 10s window.
Format all prompts in clean, copyable code blocks (\`\`\`prompt ... \`\`\`) so the user can easily copy each prompt with one click.`;
    }

    const modePrompt = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.general;
    const combinedSystemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n\n${modePrompt}${modelDirective}${languageDirective}${videoDirective}${
      customInstructions ? `\n\nUser Additional Guidelines: ${customInstructions}` : ''
    }`;

    // Format contents for @google/genai
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Set headers for Server-Sent Events (SSE) with immediate flush and no buffering
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const isHighThinking = deepThink || modelId === 'deep-thinker' || modelId === 'o3-mini';

    // Attempt streaming with gemini-3.8-flash
    let streamResponse;
    try {
      const configObj: any = {
        systemInstruction: combinedSystemInstruction,
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: isHighThinking ? 'HIGH' : 'LOW',
        },
      };

      if (webSearch) {
        configObj.tools = [{ googleSearch: {} }];
      }

      streamResponse = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents,
        config: configObj,
      });
    } catch (primaryErr: any) {
      console.warn('Primary model error, attempting fallback:', primaryErr?.message || primaryErr);
      streamResponse = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: combinedSystemInstruction,
          temperature: 0.7,
        },
      });
    }

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Chat error after fallback:', error);
    const errorMessage = error?.message || 'Failed to process AI response.';
    const isQuota = /quota|429|RESOURCE_EXHAUSTED/i.test(errorMessage);
    if (!res.headersSent) {
      res.status(isQuota ? 429 : 500).json({
        error: errorMessage,
        isQuota,
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage, isQuota })}\n\n`);
      res.end();
    }
  }
});

// Helper to extract image part from GenAI response
function extractImageFromResponse(response: any): { imageUrl: string; description: string } {
  let imageUrl = '';
  let description = '';
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      description += part.text;
    }
  }
  return { imageUrl, description };
}

// Image Creation API using gemini-nano-banana-2.1 (with fallback)
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for image generation.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let result = { imageUrl: '', description: '' };
    let usedModel = 'gemini-nano-banana-2.1';

    try {
      // Primary: gemini-nano-banana-2.1 high quality image generation
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenRatio as any,
            imageSize: imageSize as any,
          },
        },
      });
      result = extractImageFromResponse(response);
    } catch (err: any) {
      console.warn('gemini-nano-banana-2.1 generation error, trying fallback to gemini-3.1-flash-lite-image:', err?.message || err);
      usedModel = 'gemini-3.1-flash-lite-image';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenRatio as any,
          },
        },
      });
      result = extractImageFromResponse(fallbackResponse);
    }

    if (!result.imageUrl) {
      return res.status(500).json({
        error: 'Model did not return an image part. Please try refining your visual prompt.',
        details: result.description,
      });
    }

    res.json({
      imageUrl: result.imageUrl,
      description: result.description,
      prompt,
      aspectRatio: chosenRatio,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate image.',
    });
  }
});

// Image Editing API using gemini-nano-banana-2.1 (with fallback)
app.post('/api/edit-image', async (req, res) => {
  try {
    const { prompt, image, mimeType = 'image/png', aspectRatio = '1:1' } = req.body;

    if (!prompt || !image) {
      return res.status(400).json({ error: 'Prompt and image data are both required for image editing.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    // Clean base64 string if data url prefix is included
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let result = { imageUrl: '', description: '' };
    let usedModel = 'gemini-nano-banana-2.1';

    try {
      // Primary: gemini-nano-banana-2.1 image editing with text and base64 image part
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenRatio as any,
          },
        },
      });
      result = extractImageFromResponse(response);
    } catch (err: any) {
      console.warn('gemini-nano-banana-2.1 editing error, attempting fallback to gemini-3.1-flash-lite-image:', err?.message || err);
      usedModel = 'gemini-3.1-flash-lite-image';
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });
      result = extractImageFromResponse(fallbackResponse);
    }

    if (!result.imageUrl) {
      return res.status(500).json({
        error: 'Model did not return an edited image part.',
        details: result.description,
      });
    }

    res.json({
      imageUrl: result.imageUrl,
      description: result.description,
      prompt,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Image editing error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to edit image.',
    });
  }
});

// AI Visual Prompt Supercharger for gemini-nano-banana-2.1
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert prompt engineer specializing in gemini-nano-banana-2.1 image generation.
Expand the following user idea into a visually breathtaking, hyper-detailed visual prompt. Specify subject appearance, camera framing, atmospheric lighting (volumetric, rim-lit, cinematic), textures, color palette, and high-fidelity rendering details. Keep it under 60 words, strictly focused on imagery.
User concept: "${prompt}"

Return ONLY the enhanced prompt string without any quotes or explanations:`,
    });

    const enhancedPrompt = response.text?.trim().replace(/^["']|["']$/g, '') || prompt;
    res.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Prompt enhancement error:', error);
    res.status(500).json({ error: error?.message || 'Failed to enhance prompt.' });
  }
});

// 10-Second Cinematic Video Prompt & Concept Analyzer API
app.post('/api/analyze-video-concept', async (req, res) => {
  try {
    const {
      concept,
      frameRate = '24fps',
      pacingStyle = 'cinematic',
      targetEngine = 'Runway Gen-3',
      visualStyle = 'Arri Alexa 35mm',
      aspectRatio = '16:9'
    } = req.body;

    if (!concept || typeof concept !== 'string') {
      return res.status(400).json({ error: 'Concept text is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const systemPrompt = `You are an elite Hollywood Director of Photography and AI Video Prompt Engineer specializing in 10-second cinematic video generation for modern models (Runway Gen-3, OpenAI Sora, Kling AI 1.5, Luma Dream Machine, Google Veo 2).
You must analyze the user's concept and produce a rigorously structured JSON payload engineered specifically for:
1. Temporal & Character Consistency (preventing facial morphing, topological drift, and light flicker).
2. Cinematic Detail (lens optics, focal length, aperture, lighting temperature, and physical textures).
3. Frame-Rate Pacing (strictly timed 10-second timeline broken into 4 chronological phases: 0.0s-2.5s, 2.5s-5.5s, 5.5s-8.0s, 8.0s-10.0s).

Target Frame Rate: ${frameRate}
Pacing Cadence: ${pacingStyle}
Target Video Model: ${targetEngine}
Visual / Film Style: ${visualStyle}
Aspect Ratio: ${aspectRatio}

Return ONLY valid JSON matching this exact structure:
{
  "conceptAnalysis": {
    "coreSubjectAnchor": "string describing invariant subject features to lock consistency",
    "spatialDepth": "string describing foreground, midground, background depth layers",
    "cinematicOptics": "string specifying camera, lens (e.g. 35mm anamorphic), aperture, and bokeh",
    "lightingColorGrade": "string detailing key/fill/rim lighting, color temperature, and film stock LUT",
    "pacingStrategy": "string explaining the frame-rate cadence and speed ramp strategy across 10 seconds"
  },
  "timelinePhases": [
    {
      "id": "phase-1",
      "phaseTitle": "Phase 1: Spatial Anchor & Momentum Ignition",
      "timeRange": "00:00.00 - 00:02.50",
      "startSec": 0,
      "endSec": 2.5,
      "fpsCadence": "cadence info for this phase",
      "cameraChoreography": "exact camera motion vector and speed",
      "subjectAction": "precise second-by-second action",
      "consistencyAnchor": "anchors that must not warp or morph",
      "lightingAndAtmosphere": "lighting cues and particle physics"
    },
    {
      "id": "phase-2",
      "phaseTitle": "Phase 2: Kinetic Progression & Parallax Shift",
      "timeRange": "00:02.50 - 00:05.50",
      "startSec": 2.5,
      "endSec": 5.5,
      "fpsCadence": "cadence info",
      "cameraChoreography": "camera motion",
      "subjectAction": "action during mid sequence",
      "consistencyAnchor": "consistency notes",
      "lightingAndAtmosphere": "lighting shift"
    },
    {
      "id": "phase-3",
      "phaseTitle": "Phase 3: Climactic Detail & Specular Peak",
      "timeRange": "00:05.50 - 00:08.00",
      "startSec": 5.5,
      "endSec": 8.0,
      "fpsCadence": "cadence info",
      "cameraChoreography": "camera motion",
      "subjectAction": "climactic visual action",
      "consistencyAnchor": "consistency notes",
      "lightingAndAtmosphere": "lighting flare/bloom"
    },
    {
      "id": "phase-4",
      "phaseTitle": "Phase 4: Atmospheric Decrescendo & Loop Anchor",
      "timeRange": "00:08.00 - 00:10.00",
      "startSec": 8.0,
      "endSec": 10.0,
      "fpsCadence": "cadence info",
      "cameraChoreography": "camera deceleration",
      "subjectAction": "resolution action",
      "consistencyAnchor": "loop point anchor",
      "lightingAndAtmosphere": "settling atmosphere"
    }
  ],
  "masterPrompt": "rich, high word-count (~110-160 words) master prompt ready to paste into video generation tools with 0-2.5s, 2.5-5.5s, 5.5-8s, 8-10s second breakdown, camera movements, lens optics, lighting, and textures",
  "concisePrompt": "clean, 1-2 sentence direct video prompt",
  "negativePrompt": "negative prompt tokens to prevent morphing, warping, jitter, or temporal distortion",
  "audioDesign": {
    "ambientScore": "10-second musical / ambient arc",
    "foleyCues": ["cue at 0s", "cue at 3s", "cue at 6s", "cue at 9s"],
    "voiceoverMood": "suggested tone"
  },
  "consistencyTokens": ["token1", "token2", "token3", "token4", "token5"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUser Concept to Analyze:\n"${concept}"`
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const rawText = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // If code blocks wrapped
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Video concept analysis error:', error);
    res.status(500).json({ error: error?.message || 'Failed to analyze video concept.' });
  }
});

// Full-Stack App Builder & Software Architecture Generator API
app.post('/api/generate-app-blueprint', async (req, res) => {
  try {
    const {
      concept,
      category = 'SaaS / AI Tools',
      platform = 'web',
      appName = '',
      language = 'en',
    } = req.body;

    if (!concept || typeof concept !== 'string') {
      return res.status(400).json({ error: 'App concept description is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const systemPrompt = `You are a world-class Principal Software Architect, Full-Stack Staff Engineer, and Silicon Valley CTO.
The user wants to build the best, most successful, and highest quality application ("ہماری ایپ بنانے میں مدد کریں اور بیسٹ ایپ بنائیں").
Your task is to analyze their concept and produce a comprehensive, production-ready, master technical blueprint and complete runnable TypeScript / React code.

Concept: "${concept}"
Category: "${category}"
Platform: "${platform}"
Preferred App Name: "${appName || 'Auto-generate a catchy, modern name'}"
Language: "${language}"

Return ONLY valid JSON matching this schema:
{
  "appName": "string (Catchy, modern, memorable brand name)",
  "tagline": "string (Punchy 1-sentence value proposition)",
  "platform": "web" | "mobile" | "fullstack",
  "category": "string",
  "targetAudience": "string",
  "summary": "string explaining how this app solves user problems and wins against competitors",
  "techStack": {
    "frontend": "string (e.g. React 19 + TypeScript + Vite + Tailwind CSS v4)",
    "backend": "string (e.g. Node.js Express / Next.js Server Actions)",
    "database": "string (e.g. PostgreSQL with Drizzle ORM)",
    "auth": "string (e.g. Firebase Auth / NextAuth with Google OAuth)",
    "styling": "string",
    "deployment": "string"
  },
  "databaseSchema": [
    {
      "table": "string (table name)",
      "description": "string",
      "fields": ["string (e.g. id: UUID PRIMARY KEY)", "string (e.g. user_id: UUID REFERENCES users(id))"]
    }
  ],
  "screens": [
    {
      "name": "string (Screen title)",
      "route": "string (URL path)",
      "description": "string",
      "components": ["Component1", "Component2"],
      "userActions": ["action 1", "action 2"]
    }
  ],
  "apiEndpoints": [
    {
      "method": "GET" | "POST" | "PUT" | "DELETE",
      "endpoint": "/api/...",
      "description": "string",
      "body": "optional json string"
    }
  ],
  "starterCode": "Complete, production-ready, beautiful React 19 + TypeScript + Tailwind CSS code for the main core view/dashboard of the app with realistic state and interactive handlers",
  "roadmap": [
    {
      "phase": "Sprint 1",
      "title": "string",
      "timeline": "Days 1-3",
      "tasks": ["task 1", "task 2"]
    }
  ],
  "bestPractices": [
    "Expert recommendation 1 to make this the best app",
    "Expert recommendation 2",
    "Expert recommendation 3",
    "Expert recommendation 4"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const rawText = response.text?.trim() || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('App blueprint generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate app blueprint.' });
  }
});

// Real Email Dispatcher API
app.post('/api/send-email', async (req, res) => {
  try {
    const { fromEmail, toEmail, subject, message } = req.body;

    if (!toEmail || !message) {
      return res.status(400).json({ error: 'Recipient email and message text are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail.trim())) {
      return res.status(400).json({ error: 'Please enter a valid recipient email address.' });
    }

    const sender = (fromEmail && fromEmail.trim()) || 'hasaanjamshaid353@gmail.com';

    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"OmniExpert User" <${sender}>`,
      to: toEmail.trim(),
      subject: subject || 'Message from OmniExpert AI User',
      text: message,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
          <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
            <h2 style="margin: 0; color: #0284c7; font-size: 20px;">Real Message via OmniExpert AI</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 80px;"><strong>From:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${sender}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>To:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${toEmail.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;"><strong>Subject:</strong></td>
              <td style="padding: 6px 0; color: #0f172a;">${subject || 'No Subject'}</td>
            </tr>
          </table>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #334155;">
${message}
          </div>
          <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            Sent securely via OmniExpert AI Real Mail Dispatcher
          </div>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      from: sender,
      to: toEmail.trim(),
    });
  } catch (error: any) {
    console.error('Email dispatch error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to dispatch email.',
    });
  }
});

// Production static file serving or Dev Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`OmniExpert AI server running on http://0.0.0.0:${port}`);
  });
}

startServer();
