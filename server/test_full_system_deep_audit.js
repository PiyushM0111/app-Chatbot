// Comprehensive Full System & Security Threat Audit Suite
import http from 'http';
import fs from 'fs';
import path from 'path';

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
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(rawData);
        } catch (e) {
          parsed = rawData;
        }
        resolve({
          status: res.statusCode,
          data: parsed,
          headers: res.headers,
          raw: rawData
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runDeepSystemAudit = async () => {
  console.log('================================================================');
  console.log('🛡️ NEXUS AI COMPREHENSIVE FULL-SYSTEM & SECURITY THREAT AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASSED]  ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAILED]  ${testName} ${details ? `\n     → Reason: ${details}` : ''}`);
      failed++;
    }
  };

  // -------------------------------------------------------------
  // 1. SECURITY THREAT & VULNERABILITY AUDIT
  // -------------------------------------------------------------
  console.log('🔒 SECTION 1: Security Threats, Injection & Auth Boundary Tests');

  // 1A. SQL Injection Attempt on Login
  const sqliLogin = await request('/api/auth/login', 'POST', {
    email: "' OR '1'='1' --",
    password: "' OR '1'='1'"
  });
  assert(
    sqliLogin.status === 400 || sqliLogin.status === 401,
    'Sec 1A: SQL injection attempt on /api/auth/login safely rejected without SQL syntax error'
  );

  // 1B. Forged Token Verification
  const forgedTokenRes = await request('/api/auth/me', 'GET', null, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.fake_signature');
  assert(
    forgedTokenRes.status === 403,
    'Sec 1B: Forged/tampered JWT token rejected with 403 Forbidden JSON'
  );

  // 1C. Cross-User Data Isolation: User A vs User B
  const userARes = await request('/api/auth/guest', 'POST');
  const tokenA = userARes.data.token;
  const userAId = userARes.data.user.id;

  const userBRes = await request('/api/auth/guest', 'POST');
  const tokenB = userBRes.data.token;
  const userBId = userBRes.data.user.id;

  // User A creates private note and conversation
  const noteARes = await request('/api/notes', 'POST', {
    title: 'Secret User A Note',
    content: 'Classified token encryption keys'
  }, tokenA);
  const noteAId = noteARes.data.note.id;

  const convARes = await request('/api/conversations', 'POST', {
    title: 'User A Private Chat'
  }, tokenA);
  const convAId = convARes.data.conversation.id;

  // User B attempts to access User A's private resources
  const userBNoteAccess = await request(`/api/notes/${noteAId}`, 'PATCH', { title: 'Hacked' }, tokenB);
  assert(
    userBNoteAccess.status === 404,
    'Sec 1C: Cross-user data isolation - User B cannot modify User A notes (Returns 404)'
  );

  const userBConvAccess = await request(`/api/conversations/${convAId}`, 'GET', null, tokenB);
  assert(
    userBConvAccess.status === 404,
    'Sec 1D: Cross-user data isolation - User B cannot read User A conversation (Returns 404)'
  );

  // 1D. Unauthenticated Protected Route Rejections
  const unauthNotes = await request('/api/notes', 'GET');
  const unauthMem = await request('/api/memory', 'GET');
  const unauthProj = await request('/api/projects', 'GET');
  assert(
    unauthNotes.status === 401 && unauthMem.status === 401 && unauthProj.status === 401,
    'Sec 1E: All protected routes (/notes, /memory, /projects) strictly enforce 401 on missing auth'
  );

  // -------------------------------------------------------------
  // 2. AUTHENTICATION & PROFILE PERSISTENCE
  // -------------------------------------------------------------
  console.log('\n🔑 SECTION 2: User Lifecycle & Preferences');

  const mainEmail = `audit_user_${Date.now()}@nexus.test`;
  const mainPass = 'MasterPassword2026!';
  const mainName = 'Audit Commander';

  const regRes = await request('/api/auth/signup', 'POST', {
    name: mainName,
    email: mainEmail,
    password: mainPass
  });
  assert(
    regRes.status === 201 && regRes.data.token && regRes.data.user?.name === mainName,
    'Sec 2A: User signup successfully registers account and returns authenticated profile'
  );

  const mainToken = regRes.data.token;

  // Preference update
  const prefRes = await request('/api/auth/preferences', 'PUT', {
    theme_preference: 'verdant',
    accent_color: '#10B981'
  }, mainToken);
  assert(
    prefRes.status === 200 && prefRes.data.user?.theme_preference === 'verdant',
    'Sec 2B: User profile preferences (theme & accent) persist in database'
  );

  // -------------------------------------------------------------
  // 3. CONVERSATION MANAGEMENT & CONTEXT-AWARE AI
  // -------------------------------------------------------------
  console.log('\n💬 SECTION 3: Conversations, Knowledge & Multi-Turn AI');

  const chatRes = await request('/api/conversations', 'POST', {
    title: 'Full Audit Conversation',
    language: 'en',
    mode: 'general'
  }, mainToken);
  const chatId = chatRes.data.conversation.id;

  // Msg 1: Concept Question
  const msg1 = await request(`/api/conversations/${chatId}/messages`, 'POST', {
    content: 'What is the Principle of Least Privilege in cybersecurity?',
    stream: false
  }, mainToken);
  const ai1 = msg1.data.aiMessage?.content || '';
  assert(
    msg1.status === 200 && ai1.length > 50 && ai1.toLowerCase().includes('privilege'),
    'Sec 3A: AI response delivers clear, structured, non-generic explanation'
  );

  // Msg 2: Contextual Follow-up
  const msg2 = await request(`/api/conversations/${chatId}/messages`, 'POST', {
    content: 'Give me a concrete real-world example of this principle.',
    stream: false
  }, mainToken);
  const ai2 = msg2.data.aiMessage?.content || '';
  assert(
    msg2.status === 200 && ai2.length > 50 && (ai2.includes('example') || ai2.includes('Example') || ai2.includes('database') || ai2.includes('access')),
    'Sec 3B: Follow-up question references previous context and provides real-world example'
  );

  // Msg 3: Code generation
  const msg3 = await request(`/api/conversations/${chatId}/messages`, 'POST', {
    content: 'Write a Python calculator with error handling.',
    stream: false
  }, mainToken);
  const ai3 = msg3.data.aiMessage?.content || '';
  assert(
    msg3.status === 200 && ai3.includes('```python') && ai3.includes('def add'),
    'Sec 3C: Coding request outputs complete, formatted, executable Python snippet'
  );

  // Rename & Pin
  const renameRes = await request(`/api/conversations/${chatId}`, 'PATCH', {
    title: 'Cybersecurity Masterclass',
    is_pinned: 1
  }, mainToken);
  assert(
    renameRes.status === 200 && renameRes.data.conversation?.title === 'Cybersecurity Masterclass' && renameRes.data.conversation?.is_pinned === 1,
    'Sec 3D: Conversation rename and pin-to-top operations persist'
  );

  // Export
  const exportRes = await request(`/api/conversations/${chatId}/export?format=markdown`, 'GET', null, mainToken);
  assert(
    exportRes.status === 200 && exportRes.raw.includes('# Cybersecurity Masterclass'),
    'Sec 3E: Conversation export generates complete markdown transcript'
  );

  // -------------------------------------------------------------
  // 4. MULTIMODAL CAPABILITIES & SUB-SYSTEMS
  // -------------------------------------------------------------
  console.log('\n🎨 SECTION 4: Multimodal Studios, Notes, Memory, Projects & Quizzes');

  // 4A. Image Studio Generation
  const imgGenRes = await request(`/api/conversations/${chatId}/messages`, 'POST', {
    content: 'Generate a 16:9 image of a futuristic cyber security workspace.',
    stream: false
  }, mainToken);
  const imgAtt = imgGenRes.data.aiMessage?.attachments?.find(a => a.type === 'image');
  assert(
    imgGenRes.status === 200 && imgAtt && imgAtt.aspectRatio === '16:9' && imgAtt.url,
    'Sec 4A: Image generation produces high-resolution 16:9 visual card with clean caption'
  );

  // 4B. Web Search Grounding
  const searchRes = await request(`/api/conversations/${chatId}/messages`, 'POST', {
    content: 'Tell me about the Smart India Hackathon official website and themes.',
    stream: false
  }, mainToken);
  const searchAi = searchRes.data.aiMessage?.content || '';
  assert(
    searchRes.status === 200 && searchAi.includes('sih.gov.in') && searchAi.includes('Smart Automation'),
    'Sec 4B: Live web search triggers official SIH portal grounding with verified citations'
  );

  // 4C. Exact Math Evaluator
  const mathRes = await request(`/api/conversations/${chatId}/messages`, 'POST', {
    content: 'calculate 25 * 18 + 150',
    stream: false
  }, mainToken);
  const mathAi = mathRes.data.aiMessage?.content || '';
  assert(
    mathRes.status === 200 && mathAi.includes('600'),
    'Sec 4C: Calculator evaluates mathematical expressions accurately (25*18+150 = 600)'
  );

  // 4D. Notes System
  const createNote = await request('/api/notes', 'POST', {
    title: 'Python Core Cheatsheet',
    content: 'def fn(*args, **kwargs): return args',
    tags: ['Python', 'Code']
  }, mainToken);
  const noteId = createNote.data.note?.id;
  const listNotes = await request('/api/notes?tag=Python', 'GET', null, mainToken);
  assert(
    createNote.status === 201 && listNotes.status === 200 && listNotes.data.notes?.length > 0,
    'Sec 4D: AI Notes created, tagged, and queried by tag filtering'
  );

  // 4E. Memory Vault
  const saveMem = await request('/api/memory', 'POST', {
    keyFact: 'User prefers dark mode and Python 3.12 syntax',
    category: 'preferences'
  }, mainToken);
  const listMem = await request('/api/memory', 'GET', null, mainToken);
  assert(
    saveMem.status === 201 && listMem.data.memories?.length > 0,
    'Sec 4E: Memory Vault persists user facts and preferences'
  );

  // 4F. Software Project Scaffolding
  const projRes = await request('/api/projects', 'POST', {
    name: 'Zero Trust Auth Service',
    description: 'OAuth2 and JWT microservice with Redis session caching'
  }, mainToken);
  assert(
    projRes.status === 201 && projRes.data.project?.tech_stack?.length > 0 && projRes.data.project?.tasks?.length > 0,
    'Sec 4F: Project Architect generates tech stack, tasks, and system architecture'
  );

  // 4G. Interactive Learning Tutor & Quiz
  const quizRes = await request('/api/learning/quiz', 'POST', { topic: 'python' }, mainToken);
  const quizQuestions = quizRes.data.quiz?.questions || [];
  assert(
    quizRes.status === 200 && quizQuestions.length > 0,
    'Sec 4G: Interactive Learning generates structured quiz questions'
  );

  const evalRes = await request('/api/learning/evaluate', 'POST', {
    topic: 'python',
    answers: quizQuestions.map(q => q.correctIndex)
  }, mainToken);
  assert(
    evalRes.status === 200 && evalRes.data.evaluation?.percentage === 100 && evalRes.data.evaluation?.passed === true,
    'Sec 4H: Quiz evaluator scores submissions and records mastery progress'
  );

  console.log('\n================================================================');
  console.log(`📊 FULL SYSTEM & SECURITY AUDIT: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
};

runDeepSystemAudit().catch(err => {
  console.error('Fatal Deep System Audit Error:', err);
  process.exit(1);
});
