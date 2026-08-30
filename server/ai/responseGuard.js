// Response Quality, Completeness & Markdown Guard
import { resolveTopicKnowledge } from './knowledgeEngine.js';

export const validateAndRefineResponse = (responseText, originalPrompt, detectedLang, currentMode) => {
  if (!responseText || responseText.trim().length === 0) {
    return resolveTopicKnowledge(originalPrompt, detectedLang, currentMode);
  }

  let clean = responseText.trim();
  const lower = clean.toLowerCase();

  // Flag generic uninformative non-answers
  const isGenericFiller = (
    lower.includes('the core approach involves breaking this topic down') ||
    (lower.includes('let me know what specific detail you\'d like to explore') && clean.length < 180) ||
    (lower.includes('here is a structured approach') && clean.length < 120)
  );

  if (isGenericFiller) {
    // Generate substantive, rich knowledge answer instead of empty filler
    clean = resolveTopicKnowledge(originalPrompt, detectedLang, currentMode);
  }

  // Markdown Code Integrity Protection (Section 20 & 8)
  // Ensure unclosed code blocks are properly closed with trailing ```
  const codeBlockCount = (clean.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    clean += '\n```\n';
  }

  return clean;
};
