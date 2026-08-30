import express from 'express';
import { randomUUID } from 'crypto';
import { query, get, run } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { classifyIntent } from '../ai/intentDetector.js';
import { buildSmartContext } from '../ai/contextManager.js';
import { routeAndExecuteTool } from '../ai/toolRouter.js';
import { resolveTopicKnowledge } from '../ai/knowledgeEngine.js';
import { validateAndRefineResponse } from '../ai/responseGuard.js';
import { generateFollowUpSuggestions } from '../ai/suggestionEngine.js';

const router = express.Router();
router.use(authenticateToken);

// Comprehensive Non-Name Blacklist
const NON_NAME_WORDS = new Set([
  'sad', 'happy', 'tired', 'angry', 'stressed', 'confused', 'worried', 'feeling', 'low',
  'frustrated', 'bored', 'excited', 'fine', 'good', 'bad', 'sick', 'exhausted', 'anxious',
  'depressed', 'lonely', 'down', 'hurt', 'upset', 'grateful', 'busy', 'ready', 'curious',
  'lost', 'stuck', 'hungry', 'sleepy', 'dead', 'done', 'here', 'back', 'new', 'sorry',
  'a', 'an', 'the', 'from', 'in', 'at', 'to', 'for', 'of', 'with', 'on', 'by', 'about',
  'student', 'developer', 'engineer', 'coder', 'teacher', 'doctor', 'human', 'bot',
  'boy', 'girl', 'man', 'woman', 'guy', 'friend', 'user', 'guest', 'admin', 'ok', 'okay',
  'yes', 'no', 'not', 'very', 'really', 'so', 'too', 'just', 'still', 'also', 'well',
  'udas', 'khush', 'pareshan', 'thaka', 'bore', 'bimar', 'theek', 'mast', 'chhatra',
  'ladka', 'ladki', 'insan', 'coder', 'developer', 'student', 'india', 'delhi', 'mumbai'
]);

// Extract valid human name with strict contextual checking
const extractValidName = (text) => {
  if (!text) return null;
  const clean = text.trim().replace(/[.!?]/g, '');

  let match = clean.match(/(?:my name is|mera naam)\s+([A-Za-z]+)/i);
  if (match) {
    const candidate = match[1];
    if (!NON_NAME_WORDS.has(candidate.toLowerCase()) && candidate.length >= 2) return candidate;
  }

  match = clean.match(/(?:call me)\s+([A-Za-z]+)/i);
  if (match) {
    const candidate = match[1];
    if (!NON_NAME_WORDS.has(candidate.toLowerCase()) && candidate.length >= 2) return candidate;
  }

  match = clean.match(/^(?:i'm|i am|im)\s+([A-Za-z]+)$/i);
  if (match) {
    const candidate = match[1];
    if (!NON_NAME_WORDS.has(candidate.toLowerCase()) && candidate.length >= 2) return candidate;
  }

  return null;
};

// Comprehensive Auto Language Detection
const detectLanguage = (text, defaultLang = 'auto') => {
  const t = text.trim();
  const tLower = t.toLowerCase();

  if (tLower.includes('in hindi') || tLower.includes('hindi me') || tLower.includes('hindi mein') || tLower.includes('हिंदी में')) return 'hi';
  if (tLower.includes('in hinglish') || tLower.includes('hinglish me') || tLower.includes('hinglish mein') || tLower.includes('hinglish')) return 'hinglish';
  if (tLower.includes('in english') || tLower.includes('english me')) return 'en';
  if (tLower.includes('in spanish') || tLower.includes('en español')) return 'es';
  if (tLower.includes('in french') || tLower.includes('en français')) return 'fr';

  if (/[\u0900-\u097F]/.test(t)) return 'hi';

  const hinglishTokens = [
    'kya', 'hai', 'hain', 'kaise', 'karo', 'karein', 'nahi', 'nhi', 'bhai', 'yaar',
    'batao', 'samjhao', 'samjha', 'samjhe', 'mujhe', 'mera', 'meri', 'mere', 'tum', 'aap', 'kaun', 'kyu',
    'kyun', 'achha', 'theek', 'bolo', 'krna', 'hoga', 'raha', 'rahi', 'kuch', 'bhi',
    'shukriya', 'dhanyawad', 'namaste', 'kaam', 'karte', 'karna', 'padega', 'sahi',
    'scene', 'kaisa', 'matlab', 'wala', 'wali', 'wale', 'chahiye', 'bol', 'dekh', 'me', 'mein', 'bana', 'banao', 'brooooo'
  ];
  const words = tLower.split(/\s+/);
  const isHinglish = words.some(w => hinglishTokens.includes(w.replace(/[.,?!]/g, '')));
  if (isHinglish) return 'hinglish';

  if (defaultLang === 'hi' || defaultLang === 'hinglish') return defaultLang;
  return 'en';
};

// Master System Instructions
const getMasterSystemInstruction = (detectedLang = 'en', mode = 'general', customPrompt = '', memoryContext = '', projectContext = '') => {
  let modeInstruction = '';
  switch (mode) {
    case 'code':
      modeInstruction = 'MODE: CODE ARCHITECT — Prioritize clean architecture, modularity, security, performance, clear docstrings, and robust error handling.';
      break;
    case 'reason':
      modeInstruction = 'MODE: DEEP REASONER — Prioritize mathematical rigor, structured step-by-step logic, edge case analysis, and proofs.';
      break;
    case 'creative':
      modeInstruction = 'MODE: CREATIVE — Focus on original concepts, rich visual descriptions, brainstorming, and engaging narrative style.';
      break;
    case 'hinglish':
      modeInstruction = 'MODE: HINGLISH BUDDY — Use natural, friendly, colloquial Hinglish with clear everyday relatable analogies.';
      break;
    case 'support':
      modeInstruction = 'MODE: MOTIVATOR & WELLNESS — Offer calm, empathetic, positive perspective and constructive encouragement.';
      break;
    default:
      modeInstruction = 'MODE: ALL-ROUNDER — Balanced, clear, direct, informative, and helpful assistance.';
  }

  return `# PERSONAL AI PLATFORM — MASTER SYSTEM SPECIFICATION

You are Nexus AI, a helpful, intelligent, natural, and versatile AI assistant workspace.
${modeInstruction}

## CORE PRINCIPLES:
1. ALWAYS provide real, substantive, structured, educational answers to user questions (e.g. cybersecurity, machine learning, physics, web dev). Never provide generic evasive filler.
2. If the user introduces themselves, remember their name. NEVER confuse emotions ("I'm sad") or locations ("I'm from India") with names.
3. Support English, Hindi, and natural Hinglish automatically.

${memoryContext || ''}
${projectContext || ''}
${customPrompt ? `Custom User Instruction: ${customPrompt}` : ''}`;
};

// Intelligent Local Fallback Engine with Comprehensive Topic Knowledge
const getIntelligentLocalBrain = (prompt, history, language = 'en', mode = 'general') => {
  const p = prompt.trim();
  const pLower = p.toLowerCase().replace(/[.!?]/g, '');
  const detected = detectLanguage(prompt, language);

  // Security Shield
  if (
    pLower.includes('system prompt') || pLower.includes('hidden instructions') ||
    pLower.includes('api key') || pLower.includes('secret') || pLower.includes('database password')
  ) {
    if (detected === 'hi') return `गोपनीयता और सुरक्षा कारणों से आंतरिक सिस्टम निर्देश और सुरक्षा कुंजियाँ साझा नहीं की जा सकतीं।`;
    if (detected === 'hinglish') return `Security aur privacy rules ke mutabiq internal credentials aur secrets share nahi kiye ja sakte bhai.`;
    return `For security and privacy reasons, internal system instructions, API keys, and credentials cannot be shared.`;
  }

  // Edge Cases: Numbers, Punctuation, Emojis
  if (/^\d+$/.test(p)) return `You sent the number **${p}**. Would you like me to perform a mathematical calculation, explain its properties, or convert this value?`;
  if (/^[?!.,:;]+$/.test(p)) return `Did you have a question about our earlier topic, or is there something you'd like me to clarify?`;
  if (/^[\p{Extended_Pictographic}\s]+$/u.test(p)) {
    if (p.includes('😂') || p.includes('🤣')) return `Haha 😄 Glad you enjoyed that! What would you like to explore next?`;
    if (p.includes('👍') || p.includes('👌') || p.includes('🔥')) return `Awesome! Let me know if you need anything else. 🚀`;
    return `😊 How can I assist you today?`;
  }
  if (/^[b-df-hj-np-tv-z]{5,}$/i.test(p) || pLower === 'asdfgh' || pLower === 'qwerty') {
    return `It looks like a quick typo or random key press. What topic or question would you like help with?`;
  }

  // Emotions
  if (pLower === "i'm sad" || pLower === "i am sad" || pLower === "im sad" || pLower === "feeling sad" || pLower === "sad") {
    if (detected === 'hi') return `मुझे दुख है कि आप उदास महसूस कर रहे हैं। अगर आप बताना चाहें कि क्या बात आपको परेशान कर रही है, तो मैं सुनने के लिए तैयार हूँ।`;
    if (detected === 'hinglish') return `I'm sorry yaar ki aap sad feel kar rahe ho. Agar share karna chahte ho ki kya hua, toh main bilkul sunne ke liye ready hoon.`;
    return `I'm sorry you're feeling sad. Want to talk about what's making you feel this way?`;
  }

  if (pLower === "i'm happy" || pLower === "i am happy" || pLower === "im happy" || pLower === "feeling happy" || pLower === "happy") {
    return `That's wonderful to hear! What's making you feel happy today?`;
  }

  if (pLower === "i'm tired" || pLower === "i am tired" || pLower === "im tired" || pLower === "feeling tired") {
    return `Take some rest if you can. It sounds like you've had a long day. Want to talk, or just take it easy?`;
  }

  if (pLower === "i'm angry" || pLower === "i am angry" || pLower === "feeling angry") {
    return `I hear you. It's completely valid to feel angry sometimes. Want to vent or talk through what caused it?`;
  }

  if (pLower === "i'm stressed" || pLower === "i am stressed" || pLower === "feeling stressed") {
    return `I'm sorry you're dealing with stress. Take a slow, deep breath. Want to break down what's feeling overwhelming?`;
  }

  if (pLower === "i'm confused" || pLower === "i am confused") {
    return `No worries at all! What topic or situation is feeling confusing? I can help break it down clearly.`;
  }

  if (pLower === "i'm bored" || pLower === "i am bored") {
    return `Let's fix that! Want to hear an interesting fact, solve a riddle, or brainstorm a creative project?`;
  }

  // Occupation & Location
  if (pLower.includes("i'm a student") || pLower.includes("i am a student")) {
    return `That's great! What subjects or field of study are you currently focusing on?`;
  }
  if (pLower.includes("i'm from india") || pLower.includes("i am from india")) {
    return `Namaste! It's great to connect. What part of India are you from?`;
  }

  // Name Introduction
  const extractedName = extractValidName(p);
  if (extractedName) {
    if (detected === 'hi') return `नमस्ते **${extractedName}** जी! आपसे मिलकर अच्छा लगा। बताइए आज मैं आपकी क्या सहायता कर सकता हूँ?`;
    if (detected === 'hinglish') return `Great to meet you, **${extractedName}** bhai! 😊 Ab se main aapko ${extractedName} ke naam se yaad rakhunga.`;
    return `Nice to meet you, **${extractedName}**! How can I help you today?`;
  }

  // Name Recall
  if (pLower.includes('what is my name') || pLower.includes('mera naam kya hai')) {
    let foundName = null;
    for (const msg of history) {
      if (msg.role === 'user') {
        const candidate = extractValidName(msg.content);
        if (candidate) { foundName = candidate; break; }
      }
    }
    if (foundName) return `Your name is **${foundName}**.`;
    return `I don't know your name yet. Please feel free to tell me!`;
  }

  // Solar System Facts
  if (pLower.includes('how many planet') || pLower.includes('planets are there') || pLower.includes('solar system') || pLower.includes('graha')) {
    return `There are **8 planets** in our Solar System:\n\n` +
      `1. **Mercury** – Closest to the Sun and the smallest planet\n` +
      `2. **Venus** – The hottest planet with a dense atmosphere\n` +
      `3. **Earth** – Our home planet with liquid water and life\n` +
      `4. **Mars** – The Red Planet\n` +
      `5. **Jupiter** – The largest planet, a massive gas giant\n` +
      `6. **Saturn** – Famous for its extensive ring system\n` +
      `7. **Uranus** – An ice giant that rotates nearly on its side\n` +
      `8. **Neptune** – The farthest planet, cold and windy\n\n` +
      `*(Note: Pluto was reclassified as a dwarf planet in 2006.)*`;
  }

  // Greetings & Acknowledgements
  const isGreeting = (
    pLower === 'hi' || pLower === 'hello' || pLower === 'hey' ||
    pLower.startsWith('hi ') || pLower.startsWith('hello ') || /^h+i+$/i.test(p) ||
    pLower.includes('hello bhai') || pLower.includes('kaise ho') || pLower === 'brooooo'
  );
  if (isGreeting) {
    if (detected === 'hinglish') return `Hello bhai 😄 kya scene hai? Batao aaj kis cheez par kaam ya baat karni hai?`;
    if (detected === 'hi') return `नमस्ते! 🙏 मैं बिल्कुल ठीक हूँ। आप बताइए, आज क्या सीखना या बनाना है?`;
    return `Hello! How can I help you today?`;
  }

  const isAck = (
    pLower === 'ok' || pLower === 'okay' || pLower === 'k' || pLower === 'cool' ||
    pLower === 'got it' || pLower === 'thanks' || pLower === 'thank you' || pLower === 'thx' ||
    pLower === 'sahi hai' || pLower === 'theek hai'
  );
  if (isAck) {
    if (detected === 'hinglish') return `Badhiya bhai! Koi aur question ho ya kuch explore karna ho toh batao! 🚀`;
    return `Glad I could help! Let me know if you need anything else. 😊`;
  }

  // Topic Knowledge Resolver for all questions (Cybersecurity, ML, Science, Web dev, History, etc.)
  return resolveTopicKnowledge(prompt, detected, mode);
};

// Generate concise title from message
const generateTitleFromMessage = (content) => {
  const clean = content.replace(/[#*`_]/g, '').trim();
  const words = clean.split(/\s+/).slice(0, 5).join(' ');
  return words.length > 30 ? words.slice(0, 30) + '...' : words;
};

// POST /api/conversations/:id/messages
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, model: requestedModel, attachments = [], stream = false } = req.body;

    if ((!content || !content.trim()) && attachments.length === 0) {
      return res.status(400).json({ error: 'Message content or attachment cannot be empty.' });
    }

    const conversation = await get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    const userMessageId = randomUUID();
    const cleanContent = (content || '').trim();
    const attachmentsJson = JSON.stringify(attachments);
    const detectedLang = detectLanguage(cleanContent, conversation.language || 'en');

    // 1. Save user message
    await run(
      'INSERT INTO messages (id, conversation_id, role, content, attachments, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [userMessageId, id, 'user', cleanContent, attachmentsJson]
    );

    // 2. Auto-generate title
    const messageCountRow = await get('SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?', [id]);
    if (messageCountRow.count <= 1 || conversation.title === 'New Chat' || conversation.title === 'New Conversation') {
      const generatedTitle = generateTitleFromMessage(cleanContent || 'Vision & Data Analysis');
      await run('UPDATE conversations SET title = ?, language = ? WHERE id = ?', [generatedTitle, detectedLang, id]);
      conversation.title = generatedTitle;
    }

    // 3. Centralized Intent & Tool Routing Pipeline
    const intentData = classifyIntent(cleanContent);
    const toolExecution = await routeAndExecuteTool(intentData, req.user.id, id, cleanContent, detectedLang);

    let aiResponseText = '';
    let aiAttachments = [];

    if (toolExecution && toolExecution.handled) {
      aiResponseText = toolExecution.resultText;
      if (toolExecution.imageAttachment) {
        aiAttachments.push(toolExecution.imageAttachment);
      }
    } else {
      // 4. Smart Context Construction with Memories & Windowing
      const historyRows = await query(
        'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY rowid ASC',
        [id]
      );

      const smartContext = await buildSmartContext(req.user.id, id, cleanContent, historyRows);

      const systemInstruction = getMasterSystemInstruction(
        detectedLang,
        conversation.mode,
        conversation.system_prompt,
        smartContext.memoryContext,
        smartContext.projectContext
      );

      let rawKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
      const aiModelName = requestedModel || process.env.DEFAULT_AI_MODEL || 'gemini-1.5-flash';
      let geminiSuccess = false;

      if (rawKey && rawKey.startsWith('AIzaSy') && rawKey.length > 20) {
        try {
          const genAI = new GoogleGenerativeAI(rawKey);
          const chatHistory = smartContext.windowedHistory.slice(0, -1).map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
          }));

          const messageParts = [];
          if (cleanContent) messageParts.push(cleanContent);

          attachments.forEach((att) => {
            if (att.type === 'image' && att.data) {
              messageParts.push({
                inlineData: {
                  data: att.data.replace(/^data:image\/\w+;base64,/, ''),
                  mimeType: att.mimeType || 'image/png'
                }
              });
            } else if (att.type === 'file' && att.content) {
              messageParts.push(`\n[Attached File: ${att.name}]\n\`\`\`\n${att.content}\n\`\`\`\n`);
            }
          });

          const model = genAI.getGenerativeModel({
            model: aiModelName,
            systemInstruction: systemInstruction,
          });

          const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
          });

          if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            const resultStream = await chat.sendMessageStream(messageParts);
            for await (const chunk of resultStream.stream) {
              const chunkText = chunk.text();
              aiResponseText += chunkText;
              res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
            }
          } else {
            const result = await chat.sendMessage(messageParts);
            aiResponseText = result.response.text();
          }

          geminiSuccess = true;
        } catch (geminiErr) {
          console.error('Gemini API note:', geminiErr.message);
        }
      }

      if (!geminiSuccess) {
        const rawLocal = getIntelligentLocalBrain(cleanContent, historyRows, detectedLang, conversation.mode);
        aiResponseText = validateAndRefineResponse(rawLocal, cleanContent, detectedLang, conversation.mode);

        if (stream) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();

          const words = aiResponseText.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? '' : ' ') + words[i];
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          }
        }
      }
    }

    // Response Quality Validation Check
    aiResponseText = validateAndRefineResponse(aiResponseText, cleanContent, detectedLang, conversation.mode);

    // 5. Save AI message
    const aiMessageId = randomUUID();
    await run(
      'INSERT INTO messages (id, conversation_id, role, content, attachments, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [aiMessageId, id, 'model', aiResponseText, JSON.stringify(aiAttachments)]
    );

    await run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    const updatedUserMessage = await get('SELECT * FROM messages WHERE id = ?', [userMessageId]);
    const updatedAiMessage = await get('SELECT * FROM messages WHERE id = ?', [aiMessageId]);

    const suggestions = generateFollowUpSuggestions(aiResponseText, intentData?.intent || 'chat', aiAttachments.length > 0);
    const userMessageParsed = { ...updatedUserMessage, attachments };
    const aiMessageParsed = { ...updatedAiMessage, attachments: aiAttachments, suggestions };

    if (stream) {
      res.write(`data: ${JSON.stringify({ done: true, userMessage: userMessageParsed, aiMessage: aiMessageParsed, conversationTitle: conversation.title })}\n\n`);
      res.end();
    } else {
      res.json({
        userMessage: userMessageParsed,
        aiMessage: aiMessageParsed,
        conversationTitle: conversation.title
      });
    }
  } catch (error) {
    console.error('Chat handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message. Please try again.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Error during generation' })}\n\n`);
      res.end();
    }
  }
});

// POST /api/conversations/:id/regenerate
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const { model: requestedModel, stream = false } = req.body;

    const conversation = await get(
      'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    const lastMessage = await get(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY rowid DESC LIMIT 1',
      [id]
    );

    if (!lastMessage) return res.status(400).json({ error: 'No messages to regenerate.' });

    if (lastMessage.role === 'model' || lastMessage.role === 'assistant') {
      await run('DELETE FROM messages WHERE id = ?', [lastMessage.id]);
    }

    const historyRows = await query(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY rowid ASC',
      [id]
    );

    if (historyRows.length === 0) return res.status(400).json({ error: 'No prompt found to regenerate.' });

    const lastUserMsg = historyRows[historyRows.length - 1];
    const detectedLang = detectLanguage(lastUserMsg.content, conversation.language || 'en');
    const smartContext = await buildSmartContext(req.user.id, id, lastUserMsg.content, historyRows);

    const systemInstruction = getMasterSystemInstruction(
      detectedLang,
      conversation.mode,
      conversation.system_prompt,
      smartContext.memoryContext,
      smartContext.projectContext
    );

    let rawKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    const aiModelName = requestedModel || process.env.DEFAULT_AI_MODEL || 'gemini-1.5-flash';
    let aiResponseText = '';

    let geminiSuccess = false;
    if (rawKey && rawKey.startsWith('AIzaSy') && rawKey.length > 20) {
      try {
        const genAI = new GoogleGenerativeAI(rawKey);
        const chatHistory = smartContext.windowedHistory.slice(0, -1).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }],
        }));

        const model = genAI.getGenerativeModel({ model: aiModelName, systemInstruction });
        const chat = model.startChat({ history: chatHistory, generationConfig: { maxOutputTokens: 3000, temperature: 0.85 } });

        if (stream) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();

          const resultStream = await chat.sendMessageStream(lastUserMsg.content);
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            aiResponseText += chunkText;
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
          }
        } else {
          const result = await chat.sendMessage(lastUserMsg.content);
          aiResponseText = result.response.text();
        }

        geminiSuccess = true;
      } catch (geminiErr) {
        console.error('Regenerate note:', geminiErr.message);
      }
    }

    if (!geminiSuccess) {
      const rawLocal = getIntelligentLocalBrain(lastUserMsg.content, historyRows, detectedLang, conversation.mode);
      aiResponseText = validateAndRefineResponse(rawLocal, lastUserMsg.content, detectedLang, conversation.mode);

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const words = aiResponseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      }
    }

    aiResponseText = validateAndRefineResponse(aiResponseText, lastUserMsg.content, detectedLang, conversation.mode);

    const aiMessageId = randomUUID();
    await run(
      'INSERT INTO messages (id, conversation_id, role, content, attachments, created_at) VALUES (?, ?, ?, ?, "[]", CURRENT_TIMESTAMP)',
      [aiMessageId, id, 'model', aiResponseText]
    );

    await run('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    const newAiMessage = await get('SELECT * FROM messages WHERE id = ?', [aiMessageId]);

    if (stream) {
      res.write(`data: ${JSON.stringify({ done: true, aiMessage: newAiMessage })}\n\n`);
      res.end();
    } else {
      res.json({ aiMessage: newAiMessage });
    }
  } catch (error) {
    console.error('Regenerate error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to regenerate response.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Error during regeneration' })}\n\n`);
      res.end();
    }
  }
});

export default router;
