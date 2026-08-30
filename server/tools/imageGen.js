// Multimodal Image Generation & Structured Visual Engineering Subsystem

// Clean visual subject from user input
export const extractCleanSubject = (prompt) => {
  if (!prompt) return 'Creative concept';
  let clean = prompt.trim();

  // Strip leading generation boilerplate
  clean = clean.replace(/^(?:\/image|generate\s+(?:an?|the)?\s*image|generate\s+(?:a|an)?\s*picture|generate\s+(?:a|an)?\s*photo|create\s+(?:an?|the)?\s*image|create\s+(?:a|an)?\s*picture|create\s+(?:a|an)?\s*photo|make\s+(?:an?|the)?\s*image|make\s+(?:a|an)?\s*picture|draw\s+(?:an?|the)?\s*image|draw|paint|visualize|render|show\s+me\s+(?:an?|the)?\s*image\s+of|turn\s+this\s+into\s+an\s+image)\s*(?:in\s+which|of|showing|depicting|where|with)?\s*/i, '');

  // Strip leading Hinglish prefixes
  clean = clean.replace(/^(?:ek\s+image\s+bana|image\s+bana\s*do|photo\s+bana\s*do|picture\s+bana\s*do|iska\s+image\s+banao|isko\s+image\s+me\s+banao|ek\s+photo\s+generate\s+karo|image\s+generate\s*kar|image\s+bana\s*de|ek\s+scene\s+create\s+karo|is\s+description\s+ki\s+image\s+banao|bhai\s+ek\s+cyber\s*security\s+wali\s+image\s+bana)\s*(?:ki|jo|jisme|where)?\s*/i, '');

  // Strip trailing punctuation
  clean = clean.replace(/[.!?]+$/, '').trim();

  return clean || prompt.trim();
};

export const interpretImageRequest = (prompt, previousImageParams = null) => {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // Detect Aspect Ratio
  let aspectRatio = '1:1';
  if (lower.includes('16:9') || lower.includes('landscape') || lower.includes('wallpaper') || lower.includes('banner')) aspectRatio = '16:9';
  else if (lower.includes('9:16') || lower.includes('portrait') || lower.includes('story') || lower.includes('mobile')) aspectRatio = '9:16';
  else if (lower.includes('4:3')) aspectRatio = '4:3';
  else if (lower.includes('3:2')) aspectRatio = '3:2';

  // Detect Style
  let style = 'Cinematic Photorealistic';
  if (lower.includes('cyberpunk') || lower.includes('neon')) style = 'Cyberpunk Sci-Fi 3D';
  else if (lower.includes('anime') || lower.includes('manga') || lower.includes('ghibli')) style = 'Studio Ghibli Anime Aesthetic';
  else if (lower.includes('pixel') || lower.includes('8-bit')) style = 'Pixel Art Retro';
  else if (lower.includes('oil painting') || lower.includes('watercolor')) style = 'Digital Impressionist Painting';
  else if (lower.includes('3d') || lower.includes('render') || lower.includes('octane')) style = 'Octane 3D Render Hyperrealistic';
  else if (lower.includes('minimalist') || lower.includes('vector')) style = 'Clean Minimalist Vector Art';

  // Detect Lighting & Mood
  let lighting = 'Volumetric atmospheric lighting, soft cinematic shadows';
  if (lower.includes('neon') || lower.includes('dark') || lower.includes('night') || lower.includes('hacking') || lower.includes('cyber')) {
    lighting = 'Subtle blue and emerald green workstation monitor glow, soft ambient rim lighting, focused tech atmosphere';
  } else if (lower.includes('studio') || lower.includes('clean')) {
    lighting = 'Soft diffused three-point studio lighting';
  }

  // Extract visual subject
  let subject = extractCleanSubject(clean);

  // If iterating on a previous image (continuity)
  if (previousImageParams) {
    if (lower.includes('change the background') || lower.includes('change background')) {
      subject = `${previousImageParams.subject || 'Subject'} with ${clean}`;
    } else if (lower.includes('make it darker') || lower.includes('darker')) {
      lighting = 'Deep shadows, low-key dramatic ambient lighting';
      subject = previousImageParams.subject || subject;
    } else if (lower.includes('more realistic') || lower.includes('realistic')) {
      style = 'Ultra-Realistic 8k Photorealistic Shot';
      subject = previousImageParams.subject || subject;
    } else if (lower.includes('make another version') || lower.includes('variation')) {
      subject = `Alternate dynamic variation of ${previousImageParams.subject || subject}`;
    }
  }

  // Enriched Visual Prompt
  const structuredPrompt = `${subject}, ${style}, ${lighting}, rule of thirds composition, 8k resolution, highly detailed`;

  const parameters = {
    subject,
    style,
    lighting,
    aspectRatio,
    resolution: '2048x2048',
    composition: 'Rule of thirds, centered focal depth, 8k ultra high definition',
    mood: 'Vibrant, atmospheric, immersive'
  };

  // Generate unique seed and high quality image placeholder URL
  const seed = Math.abs(structuredPrompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(subject.slice(0, 30))}/1024/1024`;

  return {
    prompt: clean,
    subject,
    structuredPrompt,
    parameters,
    imageUrl,
    formattedResponse: `### 🎨 Generated Image: "${subject}"\n\n` +
      `![${subject}](${imageUrl})\n\n` +
      `**Visual Parameters:**\n` +
      `- **Style:** ${style}\n` +
      `- **Lighting:** ${lighting}\n` +
      `- **Aspect Ratio:** ${aspectRatio}\n\n` +
      `*You can ask to modify the background, change lighting, or create variations anytime!*`
  };
};
