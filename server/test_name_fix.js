async function testAll() {
  const s = await fetch('http://localhost:5000/api/auth/guest', { method: 'POST' });
  const { token } = await s.json();

  async function ask(prompt, convId) {
    let cid = convId;
    if (!cid) {
      const c = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title: 'Test' })
      });
      const { conversation } = await c.json();
      cid = conversation.id;
    }

    const m = await fetch(`http://localhost:5000/api/conversations/${cid}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ content: prompt })
    });
    const res = await m.json();
    return { answer: res.aiMessage.content, cid };
  }

  const testCases = [
    "I'm sad.",
    "I am happy.",
    "I'm tired.",
    "I'm angry.",
    "I'm stressed.",
    "I'm confused.",
    "I'm bored.",
    "I'm Piyush.",
    "My name is Piyush.",
    "Call me Piyush.",
    "I'm a student.",
    "I'm from India."
  ];

  console.log("=== RUNNING NAME DETECTION & EMOTION TEST SUITE ===");
  for (const tc of testCases) {
    const { answer } = await ask(tc);
    console.log(`[INPUT]: "${tc}"\n[OUTPUT]: ${answer}\n`);
  }

  console.log("=== RUNNING CONTEXT MEMORY RECALL TEST ===");
  const step1 = await ask("My name is Piyush.");
  console.log(`[Turn 1]: "My name is Piyush."\n[OUTPUT]: ${step1.answer}\n`);
  const step2 = await ask("What is my name?", step1.cid);
  console.log(`[Turn 2]: "What is my name?"\n[OUTPUT]: ${step2.answer}\n`);
}

testAll();
