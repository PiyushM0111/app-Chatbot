// Centralized Tool & Intent Execution Router
import { evaluateCalculation } from '../tools/calculator.js';
import { interpretImageRequest } from '../tools/imageGen.js';
import { buildSoftwareProject } from '../tools/projectBuilder.js';
import { generateQuiz, evaluateQuizAnswers, getCurriculumTopics } from '../tools/learningTutor.js';
import { executeWebSearch } from '../tools/webSearch.js';
import { saveUserMemory, deleteUserMemory, clearAllUserMemories, getUserMemories } from './memoryManager.js';
import { run, get } from '../db.js';
import { randomUUID } from 'crypto';
import { resolveTopicKnowledge } from './knowledgeEngine.js';

export const routeAndExecuteTool = async (intentData, userId, conversationId, userPrompt, language = 'en') => {
  const { intent, entities } = intentData;

  // 1. Image Generation & Image Editing Subsystem (Highest Priority)
  if (intent === 'image_generation' || intent === 'image_editing') {
    // Check for previous image in this conversation for continuity
    let previousParams = null;
    if (conversationId) {
      try {
        const lastImg = await get(
          'SELECT parameters, prompt FROM generated_images WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1',
          [conversationId]
        );
        if (lastImg) {
          previousParams = typeof lastImg.parameters === 'string' ? JSON.parse(lastImg.parameters) : lastImg.parameters;
        }
      } catch (e) {}
    }

    const imgData = interpretImageRequest(entities.prompt || userPrompt, previousParams);

    // Save record to database
    try {
      await run(
        'INSERT INTO generated_images (id, user_id, conversation_id, prompt, image_url, parameters, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [randomUUID(), userId, conversationId, imgData.prompt, imgData.imageUrl, JSON.stringify(imgData.parameters)]
      );
    } catch (e) {
      console.error('Error saving generated image record:', e);
    }

    const imageId = `img-${Date.now()}-${randomUUID().slice(0, 6)}`;

    return {
      handled: true,
      resultText: imgData.formattedResponse,
      responseType: 'image',
      imageAttachment: {
        id: imageId,
        generationId: imgData.generationId,
        type: 'image',
        url: imgData.imageUrl,
        alt: `Generated image of ${imgData.subject}`,
        subject: imgData.subject,
        prompt: imgData.prompt,
        mimeType: imgData.mimeType || 'image/png',
        aspectRatio: imgData.parameters?.aspectRatio || '1:1',
        style: imgData.parameters?.style,
        lighting: imgData.parameters?.lighting,
        parameters: imgData.parameters,
        status: 'completed',
        created_at: new Date().toISOString()
      }
    };
  }

  // 2. Memory Save Intent
  if (intent === 'memory_save' && entities.fact) {
    await saveUserMemory(userId, entities.fact);
    return {
      handled: true,
      resultText: `🧠 **Memory Saved!** I have noted down: "*${entities.fact}*". I'll keep this in mind for all our future conversations.`
    };
  }

  // 3. Memory Forget Intent
  if (intent === 'memory_forget' && entities.topic) {
    const memories = await getUserMemories(userId);
    const target = memories.find(m => m.key_fact.toLowerCase().includes(entities.topic.toLowerCase()));
    if (target) {
      await deleteUserMemory(userId, target.id);
      return {
        handled: true,
        resultText: `🗑️ **Memory Removed:** I have forgotten "*${target.key_fact}*".`
      };
    } else {
      return {
        handled: true,
        resultText: `I didn't find any stored memory matching "*${entities.topic}*". You can view all memories anytime!`
      };
    }
  }

  // 4. Memory View Intent
  if (intent === 'memory_view') {
    const memories = await getUserMemories(userId);
    if (memories.length === 0) {
      return {
        handled: true,
        resultText: `You don't have any saved memories yet. You can tell me "*Remember that I prefer Python*" to save preferences!`
      };
    }
    return {
      handled: true,
      resultText: `### 🧠 Your Stored Long-Term Memories:\n` +
        memories.map((m, idx) => `${idx + 1}. **${m.key_fact}** *(Saved: ${new Date(m.created_at).toLocaleDateString()})*`).join('\n') +
        `\n\n*You can ask to forget any memory or clear all in Settings.*`
    };
  }

  // 5. Exact Calculation Tool
  if (intent === 'calculation') {
    const calcResult = evaluateCalculation(entities.query || userPrompt);
    if (calcResult) {
      return {
        handled: true,
        resultText: calcResult
      };
    }
  }

  // 6. Project Builder Tool
  if (intent === 'project_builder') {
    const projData = buildSoftwareProject(entities.description || userPrompt);
    try {
      await run(
        'INSERT INTO projects (id, user_id, name, description, tech_stack, architecture, tasks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [randomUUID(), userId, projData.name, projData.description, JSON.stringify(projData.techStack), projData.architecture, JSON.stringify(projData.tasks)]
      );
    } catch (e) {
      console.error('Error saving project record:', e);
    }
    return {
      handled: true,
      resultText: projData.formattedMarkdown
    };
  }

  // 7. Interactive Learning Quiz
  if (intent === 'learning_quiz') {
    const quizData = generateQuiz(entities.topic || 'python');
    const formatted = `### 🎓 Interactive AI Quiz: ${quizData.topic.toUpperCase()}\n\n` +
      quizData.questions.map((q, idx) => `**Question ${idx + 1}: ${q.question}**\n` +
        q.options.map((opt, oIdx) => `- [ ] ${String.fromCharCode(65 + oIdx)}) ${opt}`).join('\n')
      ).join('\n\n') +
      `\n\n*Reply with your answers (e.g. "1: B, 2: C, 3: B") to get instant scoring and detailed explanations!*`;

    return {
      handled: true,
      resultText: formatted
    };
  }

  // 8. Code Analysis & Fixing
  if (intent === 'code_fix') {
    const fixResult = resolveTopicKnowledge(entities.codeQuery || userPrompt, language);
    return {
      handled: true,
      resultText: fixResult
    };
  }

  // 9. Live Web Search & External Lookups
  if (intent === 'web_search') {
    const searchData = await executeWebSearch(entities.query || userPrompt);
    return {
      handled: true,
      resultText: searchData.formattedResponse,
      responseType: 'text'
    };
  }

  return { handled: false };
};
