// Contextual Follow-Up Suggestions Engine (Section 25)

export const generateFollowUpSuggestions = (content, intent = 'chat', hasImage = false) => {
  const lower = (content || '').toLowerCase();

  // 1. Image Follow-Up Suggestions
  if (hasImage || intent === 'image_generation' || intent === 'image_editing') {
    return [
      'Make it more realistic and cinematic',
      'Change the background to a sunset',
      'Create another dynamic variation'
    ];
  }

  // 2. Coding & Technical Follow-Up Suggestions
  if (intent === 'code_fix' || lower.includes('```python') || lower.includes('```javascript') || lower.includes('```')) {
    return [
      'Explain this code step-by-step',
      'Add unit tests and error handling',
      'Optimize the time & space complexity'
    ];
  }

  // 3. Educational & Conceptual Follow-Up Suggestions
  if (lower.includes('cybersecurity') || lower.includes('cia triad') || lower.includes('neural network') || lower.includes('quantum')) {
    return [
      'Give a real-world practical example',
      'Explain this in simple Hinglish',
      'Test my understanding with a quiz'
    ];
  }

  // 4. Software Project Suggestions
  if (intent === 'project_builder') {
    return [
      'Generate the SQLite database schema',
      'Write the backend REST API controllers',
      'Create the frontend component structure'
    ];
  }

  // 5. Default General Suggestions
  return [
    'Can you elaborate further?',
    'Give me a summary of this',
    'What are the key takeaways?'
  ];
};
