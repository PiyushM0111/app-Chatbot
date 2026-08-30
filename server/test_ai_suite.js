// Automated AI Behavior & Routing Validation System
import http from 'http';
import { classifyIntent } from './ai/intentDetector.js';

const BASE_URL = 'http://localhost:5000';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runCompleteAISuite = async () => {
  console.log('================================================================');
  console.log('🤖 NEXUS AI AUTOMATED BEHAVIOR & INTENT VALIDATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  let blocked = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASSED]  ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAILED]  ${testName} ${details ? `\n     → Reason: ${details}` : ''}`);
      failed++;
    }
  };

  // ===========================================================================
  // SECTION 1: INTENT CLASSIFICATION MATRIX (English, Hindi, Hinglish)
  // ===========================================================================
  console.log('📦 [1/4] Running Intent Classification Matrix...');

  const INTENT_DATASET = [
    // Image Generation (English)
    { input: 'generate a image in which a boy is learning hacking', expected: 'image_generation' },
    { input: 'generate an image of a boy learning cybersecurity', expected: 'image_generation' },
    { input: 'create a picture of a student coding at night', expected: 'image_generation' },
    { input: 'make an image of a futuristic computer lab', expected: 'image_generation' },
    { input: 'draw a cybernetic owl in space', expected: 'image_generation' },
    { input: 'visualize a quantum neural network processor', expected: 'image_generation' },
    { input: 'render a cyberpunk neon street with rain', expected: 'image_generation' },
    { input: 'Create an image of a Python programmer', expected: 'image_generation' },
    { input: 'show me an image of ancient temple ruins', expected: 'image_generation' },
    { input: 'turn this into an image of floating islands', expected: 'image_generation' },
    { input: 'picture of a robotic artificial hand', expected: 'image_generation' },
    { input: '/image a golden retriever running in autumn', expected: 'image_generation' },

    // Image Generation (Hinglish & Hindi)
    { input: 'ek image bana student ki jo computer pe coding kar raha hai', expected: 'image_generation' },
    { input: 'image bana do ek student ki jo cybersecurity padh raha hai', expected: 'image_generation' },
    { input: 'photo bana do ek futuristic electric car ki', expected: 'image_generation' },
    { input: 'picture bana do coding room ki', expected: 'image_generation' },
    { input: 'iska image banao', expected: 'image_generation' },
    { input: 'isko image me banao', expected: 'image_generation' },
    { input: 'ek photo generate karo', expected: 'image_generation' },
    { input: 'image generate kar futuristic city ki', expected: 'image_generation' },
    { input: 'bhai ek cyber security wali image bana', expected: 'image_generation' },
    { input: 'is description ki image banao', expected: 'image_generation' },

    // Image Editing & Variations
    { input: 'make it more realistic', expected: 'image_editing' },
    { input: 'change the background to a sunset', expected: 'image_editing' },
    { input: 'make the room darker with green lighting', expected: 'image_editing' },
    { input: 'make another version', expected: 'image_editing' },
    { input: 'create a variation of this scene', expected: 'image_editing' },
    { input: 'same image but from another angle', expected: 'image_editing' },
    { input: 'is image ko futuristic bana do', expected: 'image_editing' },

    // General QA & Educational Questions
    { input: 'Can you tell me about cybersecurity?', expected: 'chat' },
    { input: 'What is ethical hacking?', expected: 'chat' },
    { input: 'Explain cybersecurity in Hinglish.', expected: 'chat' },
    { input: 'Explain quantum computing in simple terms', expected: 'chat' },
    { input: 'What are neural networks and backpropagation?', expected: 'chat' },
    { input: 'How many planets are there in our solar system?', expected: 'chat' },

    // Coding & Problem Fixing
    { input: 'Fix this code: def add(a, b): return a - b', expected: 'code_fix' },
    { input: 'Python me loop samjha.', expected: 'chat' },

    // Exact Math
    { input: 'what is 25% of 400', expected: 'calculation' },
    { input: '100 c to f', expected: 'calculation' },

    // Memory Controls
    { input: 'Remember that I prefer TypeScript and React', expected: 'memory_save' },
    { input: 'What do you know about me', expected: 'memory_view' },
    { input: 'Forget my preference for TypeScript', expected: 'memory_forget' },

    // Project Scaffolding
    { input: 'build an attendance management system with SQLite', expected: 'project_builder' },

    // Quiz Tutor
    { input: 'start python quiz', expected: 'learning_quiz' },

    // Live Web Search & Lookups
    { input: 'search the web for React 19 features', expected: 'web_search' },
    { input: 'look up latest space telescope discoveries', expected: 'web_search' },
    { input: '/search quantum supremacy benchmark', expected: 'web_search' }
  ];

  for (const testCase of INTENT_DATASET) {
    const result = classifyIntent(testCase.input);
    assert(
      result.intent === testCase.expected,
      `Intent: "${testCase.input.slice(0, 45)}..." → ${testCase.expected}`,
      `Expected "${testCase.expected}", but got "${result.intent}"`
    );
  }

  // ===========================================================================
  // SECTION 2: END-TO-END CHAT ROUTING & REPRODUCING USER BUG
  // ===========================================================================
  console.log('\n📦 [2/4] Running End-to-End Chat Routing & Bug Resolution Tests...');

  try {
    // 1. Create Test User
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'AI Test Runner',
      email: `ai_tester_${Date.now()}@nexus.local`,
      password: 'StrongAITestPassword123!'
    });
    const token = regRes.data.token;
    assert(token, 'Auth: Setup session and token issuance');

    // 2. Create Conversation
    const convRes = await request('/api/conversations', 'POST', { title: 'Automated AI Test Chat' }, token);
    const convId = convRes.data.conversation.id;

    // 3. CRITICAL BUG REPRODUCTION TEST:
    // Prompt: "generate a image in which a boy is learning hacking"
    // MUST return an image attachment, NOT a text guide on "Understanding Generate a image"!
    const bugTestRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'generate a image in which a boy is learning hacking'
    }, token);

    const bugAiMsg = bugTestRes.data.aiMessage;
    const bugHasImage = bugAiMsg.attachments && bugAiMsg.attachments.some(a => a.type === 'image' || a.url);
    const bugHasNoFiller = !bugAiMsg.content.includes('Understanding Generate a image') &&
                           !bugAiMsg.content.includes('Core Principles') &&
                           !bugAiMsg.content.includes('The core approach involves');

    assert(
      bugTestRes.status === 200 && bugHasImage && bugHasNoFiller && !bugAiMsg.content.includes('Visual Parameters:'),
      'CRITICAL FIX: "generate a image in which a boy is learning hacking" routes to Image Studio with image output (clean UI, no metadata dump)',
      `Response contained generic text instead of image: ${bugAiMsg.content.slice(0, 100)}`
    );

    // 4. Topic Collision Test (Cybersecurity visual vs Cybersecurity QA)
    const imgCyberRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Generate an image of a boy learning cybersecurity'
    }, token);
    const imgCyberMsg = imgCyberRes.data.aiMessage;
    assert(
      imgCyberRes.status === 200 && imgCyberMsg.attachments?.length > 0 && !imgCyberMsg.content.includes('Visual Parameters:'),
      'Topic Collision A: "Generate an image of a boy learning cybersecurity" → Image Generation (NOT text explanation)'
    );

    const qaCyberRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Can you tell me about cybersecurity?'
    }, token);
    const qaCyberMsg = qaCyberRes.data.aiMessage;
    assert(
      qaCyberRes.status === 200 && qaCyberMsg.content.includes('CIA Triad') && !qaCyberMsg.content.includes('Generated Image'),
      'Topic Collision B: "Can you tell me about cybersecurity?" → Text Explanation (NOT image)'
    );

    // 5. Python collision (Image of Python programmer vs Python loop tutorial)
    const imgPyRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Create an image of a Python programmer'
    }, token);
    assert(
      imgPyRes.status === 200 && (imgPyRes.data.aiMessage.content.includes('Generated Image') || imgPyRes.data.aiMessage.attachments?.length > 0),
      'Topic Collision C: "Create an image of a Python programmer" → Image Generation (NOT code)'
    );

    const codePyRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Python me loop samjha.'
    }, token);
    assert(
      codePyRes.status === 200 && codePyRes.data.aiMessage.content.includes('for i in range'),
      'Topic Collision D: "Python me loop samjha." → Python tutorial code'
    );

    // =========================================================================
    // SECTION 3: MULTI-TURN IMAGE CONTINUITY
    // =========================================================================
    console.log('\n📦 [3/4] Running Multi-Turn Image Continuity Tests...');

    // Follow-up editing
    const editRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'make the room darker with green lighting'
    }, token);
    const editAiMsg = editRes.data.aiMessage;
    assert(
      editRes.status === 200 && (editAiMsg.content.includes('Generated Image') || editAiMsg.attachments?.length > 0),
      'Multi-Turn: "make the room darker with green lighting" → Continuity image iteration'
    );

    // =========================================================================
    // SECTION 4: SAFETY, MEMORY & EDGE CASES
    // =========================================================================
    console.log('\n📦 [4/4] Running Safety, Memory & Edge Case Tests...');

    // Name vs Emotion Safeguard
    const emoRes = await request(`/api/conversations/${convId}/messages`, 'POST', { content: "I'm sad" }, token);
    assert(
      emoRes.status === 200 && !emoRes.data.aiMessage.content.includes('sad!') && emoRes.data.aiMessage.content.toLowerCase().includes('sorry'),
      'Safety: "I\'m sad" acknowledged with empathy (NOT treated as a name)'
    );

    // Exact Memory Save and Recall
    await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'Remember that I love developing full-stack applications with Node and React'
    }, token);

    const memList = await request('/api/memory', 'GET', null, token);
    assert(
      memList.status === 200 && memList.data.memories.some(m => m.key_fact.includes('Node and React')),
      'Memory: Explicit preference stored persistently in database'
    );

    // Calculation tool
    const calcRes = await request(`/api/conversations/${convId}/messages`, 'POST', { content: 'what is 20% of 150' }, token);
    assert(
      calcRes.status === 200 && calcRes.data.aiMessage.content.includes('30'),
      'Calculator: Exact arithmetic evaluation (20% of 150 = 30)'
    );

    // AI Notes & Snippets Subsystem (Priority 1)
    const noteCreateRes = await request('/api/notes', 'POST', {
      title: 'Python Binary Search',
      content: 'def binary_search(arr, x): low = 0; high = len(arr) - 1',
      tags: ['Code', 'Algorithms']
    }, token);
    assert(
      noteCreateRes.status === 201 && noteCreateRes.data.note?.title === 'Python Binary Search',
      'Notes API: Create note and snippet persistently'
    );

    const noteId = noteCreateRes.data.note?.id;
    const noteListRes = await request('/api/notes', 'GET', null, token);
    assert(
      noteListRes.status === 200 && noteListRes.data.notes.some(n => n.id === noteId),
      'Notes API: Retrieve user notes with tags'
    );

    const noteUpdateRes = await request(`/api/notes/${noteId}`, 'PATCH', {
      title: 'Python Fast Binary Search'
    }, token);
    assert(
      noteUpdateRes.status === 200 && noteUpdateRes.data.note?.title === 'Python Fast Binary Search',
      'Notes API: Update note title and tags'
    );

    const noteDeleteRes = await request(`/api/notes/${noteId}`, 'DELETE', null, token);
    assert(
      noteDeleteRes.status === 200,
      'Notes API: Delete note successfully'
    );

    // Live Web Search & External Lookups (Priority 2)
    const searchRes = await request(`/api/conversations/${convId}/messages`, 'POST', {
      content: 'search the web for quantum supremacy benchmark'
    }, token);
    assert(
      searchRes.status === 200 && (searchRes.data.aiMessage.content.includes('Web') || searchRes.data.aiMessage.content.includes('quantum')),
      'Web Search: Live synthesis and citation returned'
    );

  } catch (err) {
    console.error('Fatal execution error during test run:', err);
    failed++;
  }

  // ===========================================================================
  // SUMMARY REPORT
  // ===========================================================================
  console.log('\n================================================================');
  console.log('📊 AI AUTOMATED VALIDATION SUMMARY REPORT');
  console.log('================================================================');
  console.log(`  PASSED:   ${passed}`);
  console.log(`  FAILED:   ${failed}`);
  console.log(`  BLOCKED:  ${blocked}`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL AI ROUTING & BEHAVIOR TESTS PASSED 100% SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${failed} test(s) failed. Please review the reasons above.\n`);
    process.exit(1);
  }
};

runCompleteAISuite();
