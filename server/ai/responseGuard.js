// Response Quality & Relevance Guard
import { resolveTopicKnowledge } from './knowledgeEngine.js';

export const validateAndRefineResponse = (responseText, originalPrompt, detectedLang, currentMode) => {
  if (!responseText || responseText.trim().length === 0) {
    return resolveTopicKnowledge(originalPrompt, detectedLang, currentMode);
  }

  const clean = responseText.trim();
  const lower = clean.toLowerCase();

  // Flag generic uninformative non-answers
  const isGenericFiller = (
    lower.includes('the core approach involves breaking this topic down') ||
    lower.includes('let me know what specific detail you\'d like to explore') && clean.length < 180 ||
    lower.includes('here is a structured approach') && clean.length < 120
  );

  if (isGenericFiller) {
    // Generate substantive, rich knowledge answer instead of empty filler
    return resolveTopicKnowledge(originalPrompt, detectedLang, currentMode);
  }

  return clean;
};
