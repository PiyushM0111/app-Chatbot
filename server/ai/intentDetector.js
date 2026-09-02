// High-Precision Intelligent Intent & Entity Classifier
import { extractSearchQuery } from '../tools/webSearch.js';

// Regular Expressions for Multilingual Image Generation Detection
const IMAGE_GEN_PATTERNS = [
  // 1. Explicit slash commands
  /^\/image\b/i,

  // 2. Direct visual action verbs at start ("draw a...", "paint an...", "render a...", "visualize a...")
  /^(?:draw|paint|render|visualize|sketch|illustrate)\s+(?:an?|the)?\s*[\w\s]+/i,

  // 3. English creation patterns ("generate an image", "create a picture", "make a photo", "create a 16:9 futuristic city", "create a vertical 9:16 poster", "create a 9:16 mobile wallpaper", "create a futuristic cyber security workspace", etc.)
  /\b(?:generate|create|make|draw|paint|render|visualize|produce)\s+(?:an?|the)?\s*(?:[\d:]+|square|vertical|horizontal|portrait|landscape|realistic|cinematic|cartoon|vector|anime|3d|photorealistic|digital|minimalist|isometric|futuristic|cyber|security|modern|aesthetic|mobile|\s)*\s*(?:image|picture|photo|photograph|scene|artwork|art|render|illustration|visual|graphic|wallpaper|portrait|concept\s*art|poster|landscape|city|cat|drawing|workspace|environment|room|setup|design|view|avatar)\b/i,

  // 3b. Direct artistic creation requests with style/dimensions/subjects
  /\b(?:generate|create|make|render|draw|paint|sketch|illustrate)\s+(?:an?|the)?\s*(?:[\d:]+|vertical|horizontal|square)?\s*(?:[\d:]+)?\s*(?:cartoon|3d|photorealistic|cinematic|realistic|vector|anime|digital|pixel\s*art|minimalist|isometric|futuristic)\s+[\w\s]+/i,
  /\b(?:generate|create|make|render|draw|paint)\s+(?:an?|the)?\s*(?:16:9|9:16|4:3|3:4|1:1|3:2)\s+[\w\s]+/i,

  // 4. "in which / of / showing" patterns
  /\b(?:generate|create|make|render|draw)\s+(?:an?|the)?\s*(?:image|picture|photo|scene|visual|artwork)\s+(?:in\s+which|of|showing|depicting|with|where)\b/i,

  // 5. "show me an image/picture/photo of..."
  /\b(?:show\s+me|display|give\s+me)\s+(?:an?|the)?\s*(?:image|picture|photo|visual|artwork)\s+(?:of|with|showing)?\b/i,

  // 6. "turn/make this into an image"
  /\b(?:turn|convert|make|transform)\s+(?:this|it)?\s*(?:into|as|in)\s+(?:an?|the)?\s*(?:image|picture|photo|artwork)\b/i,

  // 7. Direct "image of...", "picture of...", "photo of..." at the beginning or as core request
  /^(?:an?|the)?\s*(?:image|picture|photo|artwork|illustration)\s+(?:of|depicting|showing)\b/i,
  /\b(?:hd|8k|4k|realistic|cinematic)\s+(?:image|picture|photo|render)\s+of\b/i,

  // 8. Hinglish / Hindi patterns
  /\b(?:ek\s+)?(?:image|photo|picture|scene|pic)\s+(?:bana|banao|bana\s*do|bana\s*de|bana\s*dijiye|generate\s*kar|generate\s*karo|generate\s*karein|create\s*karo|create\s*kar)\b/i,
  /\b(?:bana\s*do|banao|generate\s*karo|create\s*karo)\s+(?:ek\s+)?(?:image|photo|picture|scene|pic)\b/i,
  /\b(?:iska|iski|isko|in\s*sabka)\s+(?:image|photo|picture)\s*(?:me\s*banao|me\s*bana|bana|banao|bana\s*do|bana\s*de)?\b/i,
  /\b(?:is\s*description\s*ki|wali)\s*(?:image|photo|picture)\s*(?:bana|banao|generate\s*karo)?\b/i,
  /\b(?:image|photo|picture)\s+(?:chahiye|dikhao|bhej|bhejo)\b/i,

  // 9. Pure Devanagari Hindi
  /(?:चित्र|फोटो|इमेज|तस्वीर)\s*(?:बनाओ|बनाएं|बना\s*दो|जनरेट\s*करो|दिखाओ)/u,
  /(?:एक\s+)?(?:चित्र|फोटो|इमेज|तस्वीर)\s*(?:बनाएं|बनाओ)/u
];

// Regular Expressions for Image Editing & Variations (Multi-turn follow-ups)
const IMAGE_EDIT_PATTERNS = [
  /\b(?:make\s+(?:the\s+)?(?:room|background|lighting|colors?|scene|image|it))\s+(?:more\s+realistic|darker|brighter|cinematic|futuristic|anime|3d|vintage|cleaner)\b/i,
  /\b(?:change\s+the)\s+(?:background|lighting|colors?|clothes|angle|room|weather|style|mood)\b/i,
  /\b(?:make\s+another\s+version|create\s+a\s+variation|give\s+another\s+version|generate\s+another\s+version|one\s+more\s+version)\b/i,
  /\b(?:same\s+(?:image|picture|photo|prompt)\s+but\b)/i,
  /\b(?:is\s+image\s+ko|isme)\s+(?:futuristic|darker|change|modify)\s*(?:bana\s*do|karo)?\b/i,
  /\b(?:background\s+change\s+kar\s*do|lighting\s+badal\s*do)\b/i
];

// Determine if previous conversation history was about a specific external entity (e.g. SIH)
const extractContextEntity = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) return null;
  const recentMessages = history.slice(-10);
  for (let i = recentMessages.length - 1; i >= 0; i--) {
    const text = (recentMessages[i].content || '').toLowerCase();
    if (text.includes('sih') || text.includes('smart india hackathon')) {
      return 'Smart India Hackathon (SIH)';
    }
    if (text.includes('python release') || text.includes('python 3.')) {
      return 'Python latest release';
    }
    if (text.includes('cybersecurity') && (text.includes('news') || text.includes('recent') || text.includes('threat'))) {
      return 'Cybersecurity latest news and threats';
    }
    if (text.includes('dehradun') || text.includes('bca')) {
      return 'Colleges offering BCA Cyber Security near Dehradun';
    }
  }
  return null;
};

export const classifyIntent = (input, history = []) => {
  if (!input) return { intent: 'chat', entities: {} };
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // Exclude code writing/programming requests (e.g. "Write Python code for an image-generation API", "Write a Python calculator")
  if (
    /^(?:write|create|give\s+me|show\s+me|implement)\s+(?:an?\s+)?(?:python|javascript|js|node|html|css|cpp|c\+\+|java|c#|sql|typescript|ts|golang|go|rust|bash|shell)?\s*(?:code|script|program|function|class|api|endpoint|backend|calculator|app)\b/i.test(clean) ||
    /^(?:write|show\s+me)\s+(?:code|python\s+code|script|calculator)\b/i.test(clean) ||
    lower.includes('write a python calculator') || lower.includes('write python code')
  ) {
    return { intent: 'chat', entities: { isCode: true } };
  }

  // Exclude informational/educational questions about image generation
  if (
    /^(?:what is|what are|explain|tell me about|how does|how to|describe how|define|can you explain)\s+.*(?:image generation|image model|generating images|diffusion model|gan|text to image|midjourney|dall-e|stable diffusion)\b/i.test(clean) ||
    /^(?:what is|what are|define)\s+(?:an?\s+)?image\b/i.test(clean)
  ) {
    return { intent: 'chat', entities: {} };
  }

  // =========================================================================
  // 1. HIGHEST PRIORITY: Image Generation & Editing Requests
  // =========================================================================
  for (const pattern of IMAGE_EDIT_PATTERNS) {
    if (pattern.test(clean)) {
      return { intent: 'image_editing', entities: { prompt: clean, isEdit: true } };
    }
  }

  for (const pattern of IMAGE_GEN_PATTERNS) {
    if (pattern.test(clean)) {
      return { intent: 'image_generation', entities: { prompt: clean } };
    }
  }

  // =========================================================================
  // 2. Explicit Memory Commands
  // =========================================================================
  if (lower.startsWith('/memory') || lower.startsWith('remember that') || lower.startsWith('remember this') || lower.includes('yaad rakhna ki')) {
    const memoryFact = clean.replace(/^(?:\/memory|remember that|remember this|yaad rakhna ki)\s*/i, '').trim();
    return { intent: 'memory_save', entities: { fact: memoryFact } };
  }
  if (lower.startsWith('/forget') || lower.startsWith('forget that') || lower.startsWith('forget my') || lower.includes('bhool jao')) {
    const topic = clean.replace(/^(?:\/forget|forget that|forget my|bhool jao)\s*/i, '').trim();
    return { intent: 'memory_forget', entities: { topic } };
  }
  if (lower === '/memories' || lower === 'show memories' || lower === 'what do you know about me' || lower.includes('mere baare mein kya')) {
    return { intent: 'memory_view', entities: {} };
  }

  // =========================================================================
  // 3. Exact Math & Calculation Subsystem
  // =========================================================================
  if (
    lower.startsWith('/calc') || lower.startsWith('calculate') || lower.startsWith('compute') ||
    /\b(\d+\s*[\+\-\*\/%^]\s*\d+)\b/.test(lower) ||
    /\b\d+\s*(?:c|f)\s*to\s*(?:c|f)\b/i.test(lower) ||
    /\b\d+\s*(?:km|miles|kg|lbs)\s*to\s*(?:km|miles|kg|lbs)\b/i.test(lower) ||
    /\b\d+%\s*of\s*\d+\b/i.test(lower)
  ) {
    return { intent: 'calculation', entities: { query: clean } };
  }

  // =========================================================================
  // 4. Software Project Scaffolding & Architecture
  // =========================================================================
  if (
    lower.startsWith('/project') || lower.startsWith('build a project') || lower.startsWith('build an app') ||
    lower.startsWith('create a project') || lower.includes('project architecture for') || lower.includes('attendance management system') ||
    lower.includes('build full stack')
  ) {
    return { intent: 'project_builder', entities: { description: clean } };
  }

  // =========================================================================
  // 5. Interactive Learning & Quizzes
  // =========================================================================
  if (lower.startsWith('/quiz') || lower.startsWith('take quiz') || lower.startsWith('start quiz') || lower.includes('test my python knowledge') || lower.includes('python quiz')) {
    return { intent: 'learning_quiz', entities: { topic: lower.includes('js') || lower.includes('javascript') ? 'javascript' : 'python' } };
  }

  // =========================================================================
  // 6. Code Analysis & Debugging
  // =========================================================================
  if (
    lower.startsWith('/code') || lower.startsWith('fix this code') || lower.startsWith('debug this code') ||
    lower.includes('def add(') || lower.includes('fix the error in this code')
  ) {
    return { intent: 'code_fix', entities: { codeQuery: clean } };
  }

  // =========================================================================
  // 7. INTELLIGENT WEB SEARCH & REAL-WORLD FACTUAL LOOKUPS
  // =========================================================================

  // 7a. Explicit search commands
  const isExplicitSearch = (
    lower.startsWith('/search') || lower.startsWith('search the web') || lower.startsWith('search for ') ||
    lower.startsWith('search online') || lower.startsWith('search google') || lower.startsWith('look this up') ||
    lower.startsWith('look up ') || lower.startsWith('find online') || lower.startsWith('web search') ||
    lower.startsWith('web pe search') || lower.startsWith('google pe search') || lower.startsWith('find on the web')
  );

  // 7b. Website-specific lookups (e.g. "from SIH website", "on official portal", "SIH website", "What is SIH?")
  const isWebsiteSpecific = (
    /\b(?:sih|smart india hackathon)\b/i.test(lower) ||
    lower.includes('sih website') || lower.includes('from sih') || lower.includes('official website') ||
    lower.includes('official portal') || lower.includes('sih official') || lower.includes('smart india hackathon') ||
    lower.includes('sih edition') || lower.includes('conducting this edition') || lower.includes('conducting sih') ||
    lower.includes('conducting this year') || lower.includes('sih problem statements') || lower.includes('on the website') ||
    lower.includes('from website') || lower.includes('from the official') || lower.includes('open/search') ||
    lower.includes('search the official') || lower.includes('open the official')
  );

  // 7c. Live / Current events / News / Status
  const isLiveCurrentQuery = (
    lower.includes('latest news') || lower.includes('today\'s news') || lower.includes('breaking news') ||
    lower.includes('current news') || lower.includes('latest update') || lower.includes('recent update') ||
    lower.includes('current price') || lower.includes('stock price') || lower.includes('today\'s weather') ||
    lower.includes('current weather') || lower.includes('weather in') || lower.includes('weather of') ||
    (lower.includes('weather') && (lower.includes('delhi') || lower.includes('mumbai') || lower.includes('today'))) ||
    lower.includes('who won recently') || lower.includes('latest score') || lower.includes('match score') ||
    lower.includes('latest cybersecurity news') || lower.includes('cybersecurity news') || lower.includes('recent cyber attack') ||
    lower.includes('latest release') || lower.includes('latest python release') || lower.includes('latest version of python') ||
    lower.includes('latest version of') || lower.includes('recent developments') || lower.includes('newest version')
  );

  // 7d. External factual directories / Local institutional lookups / Government Officials
  const isExternalFactualLookup = (
    lower.includes('colleges offering') || lower.includes('universities offering') || lower.includes('institutes offering') ||
    (lower.includes('near dehradun') || lower.includes('in dehradun') || lower.includes('in delhi') || lower.includes('in mumbai')) &&
    (lower.includes('college') || lower.includes('university') || lower.includes('bca') || lower.includes('course')) ||
    lower.includes('bca cyber security') || lower.includes('compare these two current') ||
    lower.includes('who is the current') || lower.includes('current ceo of') || lower.includes('current prime minister') ||
    lower.includes('prime minister of india') || lower.includes('pm of india') || lower.includes('president of india')
  );

  // 7e. Contextual follow-up queries (e.g. "How many topics are there?" following a SIH or live entity question)
  const contextEntity = extractContextEntity(history);
  const isContextualFollowUp = contextEntity && (
    lower.includes('how many topic') || lower.includes('how many problem statement') ||
    lower.includes('how many theme') || lower.includes('what is the eligibility') ||
    lower.includes('who can participate') || lower.includes('what is the prize money') ||
    lower.includes('what is the deadline') || lower.includes('last date to register') ||
    lower.includes('nodal center') || lower.includes('how many edition')
  );

  if (isExplicitSearch || isWebsiteSpecific || isLiveCurrentQuery || isExternalFactualLookup || isContextualFollowUp) {
    let searchQuery = clean;
    if (isContextualFollowUp && contextEntity) {
      searchQuery = `${contextEntity} ${clean}`;
    }
    return {
      intent: 'web_search',
      entities: {
        query: searchQuery,
        originalPrompt: clean,
        isWebsiteSpecific,
        isLiveCurrentQuery,
        contextEntity
      }
    };
  }

  // =========================================================================
  // 8. General Chat & Concept Explanation
  // =========================================================================
  return { intent: 'chat', entities: {} };
};
