// Task-Aware Response Depth & Length Determination Engine

export const determineResponseDepth = (prompt, mode = 'general') => {
  if (!prompt) return 'normal';
  const lower = prompt.toLowerCase().trim();

  // 1. Explicit User Instructions for Brevity (SIMPLE)
  if (
    lower.includes('in one line') ||
    lower.includes('in 1 line') ||
    lower.includes('short answer') ||
    lower.includes('briefly') ||
    lower.includes('in short') ||
    lower.includes('one sentence') ||
    lower.includes('quick summary')
  ) {
    return 'simple';
  }

  // 2. Greetings & Single-Word Queries (SIMPLE)
  if (/^(?:hi|hello|hey|greetings|namaste|hola|sup|good morning|good evening)[.!?]*$/i.test(lower)) {
    return 'simple';
  }

  // 3. Explicit Deep / Tutorial / Comprehensive Requests (DEEP)
  if (
    lower.includes('teach me') ||
    lower.includes('from beginner to advanced') ||
    lower.includes('from scratch') ||
    lower.includes('complete guide') ||
    lower.includes('complete tutorial') ||
    lower.includes('deeply') ||
    lower.includes('deep dive') ||
    lower.includes('in detail') ||
    lower.includes('in-depth') ||
    lower.includes('step by step') ||
    lower.includes('step-by-step') ||
    lower.includes('roadmap') ||
    lower.includes('build a complete') ||
    lower.includes('line by line') ||
    lower.includes('give me everything') ||
    mode === 'deep_reasoner'
  ) {
    return 'deep';
  }

  // 4. Technical / Coding / Architecture Queries (DETAILED)
  if (
    lower.includes('how to') ||
    lower.includes('explain') ||
    lower.includes('architecture') ||
    lower.includes('example') ||
    lower.includes('difference between') ||
    lower.includes('compare') ||
    lower.includes('implement') ||
    mode === 'code_architect'
  ) {
    return 'detailed';
  }

  // 5. Default
  return 'normal';
};
