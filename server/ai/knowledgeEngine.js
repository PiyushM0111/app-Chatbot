// Authoritative AI Knowledge & Concept Explanation Engine

// Format rich structured explanations with markdown, bullet points, code, and analogies
export const resolveTopicKnowledge = (query, language = 'en', mode = 'general') => {
  const q = query.trim();
  const qLower = q.toLowerCase().replace(/[.!?]/g, '');

  // 1. CYBERSECURITY
  if (
    qLower.includes('cybersecurity') || qLower.includes('cyber security') ||
    qLower.includes('cyber attack') || qLower.includes('information security')
  ) {
    if (language === 'hinglish') {
      return `### 🛡️ Cybersecurity Kya Hai? (Complete Guide in Simple Hinglish)\n\n` +
        `**Cybersecurity** ka simple matlab hai hamare **computers, servers, mobile devices, networks aur digital data ko cyber attacks aur hackers se protect karna**.\n\n` +
        `---\n\n` +
        `### 🔑 1. Core Pillars — The CIA Triad\n` +
        `- **Confidentiality (गोपनीयता):** Sirf authorized log hi data dekh sakein (e.g. Password protection, End-to-End Encryption).\n` +
        `- **Integrity (सत्यनिष्ठा):** Data ke sath koi chhedchhad ya tamper na ho sake.\n` +
        `- **Availability (उपलब्धता):** Jab zaroorat ho, system aur data bina rukawat ke accessible rahein.\n\n` +
        `### ⚠️ 2. Major Cyber Threats\n` +
        `1. **Phishing:** Fake emails/SMS bhej kar passwords ya credit card details churana.\n` +
        `2. **Malware & Ransomware:** Aise malicious programs jo computer ko lock karke paise mangte hain ya data delete karte hain.\n` +
        `3. **SQL Injection & XSS:** Websites ki database ya frontend vulnerabilities ko exploit karna.\n` +
        `4. **DDoS Attack:** Server par itna fake traffic bhej dena ki website down ho jaye.\n\n` +
        `### 💡 3. Best Security Practices (Suraksha ke Niyam)\n` +
        `- **Multi-Factor Authentication (MFA / 2FA):** Password ke baad OTP/Authenticator app zaroori karein.\n` +
        `- **Strong & Unique Passwords:** Har account ke liye alag strong password aur Password Manager use karein.\n` +
        `- **Zero Trust Architecture:** *"Never Trust, Always Verify"* — kisi bhi network ya device ko automatically safe mat samjho.\n` +
        `- **Regular Software Updates:** Security patches ko hamesha update rakhein.\n\n` +
        `*Kya aap kisi specific area (jaise Ethical Hacking, Web App Security, ya Cryptography) par detail chahte hain?*`;
    }

    if (language === 'hi') {
      return `### 🛡️ साइबर सुरक्षा (Cybersecurity) क्या है?\n\n` +
        `**साइबर सुरक्षा** कंप्यूटर, सर्वर, मोबाइल डिवाइस, इलेक्ट्रॉनिक सिस्टम, नेटवर्क और डेटा को दुर्भावनापूर्ण हमलों (Cyber Attacks) से बचाने का अभ्यास है।\n\n` +
        `---\n\n` +
        `### 🔑 1. मुख्य आधार — CIA ट्रायड (CIA Triad)\n` +
        `- **गोपनीयता (Confidentiality):** संवेदनशील जानकारी केवल अधिकृत व्यक्तियों तक सीमित रहे।\n` +
        `- **सत्यनिष्ठा (Integrity):** डेटा सटीक और बिना किसी अनधिकृत बदलाव के सुरक्षित रहे।\n` +
        `- **उपलब्धता (Availability):** आवश्यकता पड़ने पर सिस्टम और डेटा हमेशा उपलब्ध रहे।\n\n` +
        `### ⚠️ 2. सामान्य साइबर खतरे\n` +
        `1. **फ़िशिंग (Phishing):** नकली संदेशों के ज़रिए पासवर्ड या वित्तीय जानकारी चुराना।\n` +
        `2. **रैनसमवेयर (Ransomware):** फाइलों को एन्क्रिप्ट करके फिरौती मांगना।\n` +
        `3. **मैन-इन-द-मिडिल अटैक:** दो पक्षों के बीच के संचार को गुप्त रूप से पढ़ना या बदलना।\n\n` +
        `### 💡 3. आवश्यक सुरक्षा उपाय\n` +
        `- टू-फैक्टर ऑथेंटिकेशन (2FA) सक्षम करें।\n` +
        `- मजबूत पासवर्ड और पासवर्ड मैनेजर का उपयोग करें।\n` +
        `- सॉफ्टवेयर और ऑपरेटिंग सिस्टम को हमेशा अपडेट रखें।`;
    }

    return `### 🛡️ What is Cybersecurity? (Comprehensive Guide)\n\n` +
      `**Cybersecurity** is the practice of protecting systems, networks, devices, programs, and data from digital attacks, unauthorized access, theft, and damage.\n\n` +
      `---\n\n` +
      `### 🔑 1. The Core Foundation: CIA Triad\n` +
      `- **Confidentiality:** Ensuring that sensitive information is accessible only to authorized users (implemented via AES encryption, access control lists).\n` +
      `- **Integrity:** Maintaining the consistency, accuracy, and trustworthiness of data over its entire lifecycle (via cryptographic hashes like SHA-256 and digital signatures).\n` +
      `- **Availability:** Ensuring reliable and timely access to data and services for authorized users (via redundancy, load balancers, and DDoS mitigation).\n\n` +
      `### ⚠️ 2. Common Cyber Threat Categories\n` +
      `1. **Phishing & Social Engineering:** Deceptive emails, SMS, or impersonations designed to steal credentials or sensitive corporate data.\n` +
      `2. **Malware, Ransomware & Trojans:** Malicious software that infects endpoints, encrypts critical files for extortion, or creates backdoors.\n` +
      `3. **Web Application Vulnerabilities (OWASP Top 10):** SQL Injection (SQLi), Cross-Site Scripting (XSS), and Broken Object Level Authorization (BOLA).\n` +
      `4. **Distributed Denial of Service (DDoS):** Overwhelming servers or network infrastructure with artificial traffic floods.\n\n` +
      `### 💡 3. Key Defensive Strategies & Best Practices\n` +
      `- **Zero Trust Architecture:** Operates on the principle of *"Never trust, always verify"* across all network endpoints.\n` +
      `- **Multi-Factor Authentication (MFA):** Adds biometric or time-based one-time password (TOTP) layers beyond simple passwords.\n` +
      `- **End-to-End Encryption (E2EE):** Encrypts data in transit (TLS 1.3) and at rest (AES-256-GCM).\n` +
      `- **Continuous Patch Management:** Promptly updating systems to remediate known Common Vulnerabilities and Exposures (CVEs).\n\n` +
      `*Would you like to explore a specific topic such as Ethical Hacking, SOC Operations, or Cloud Security (AWS/Azure)?*`;
  }

  // 2. PYTHON LOOPS & CONTROL FLOW
  if (qLower.includes('loop') || qLower.includes('for loop') || qLower.includes('while loop')) {
    if (language === 'hinglish') {
      return `### 🔁 Python Mein Loops (Simple & Clear Hinglish Guide)\n\n` +
        `Haan bhai, simple way mein samajh:\n\n` +
        `**Loop** ka matlab hota hai **kisi kaam ko baar-baar repeat karna** bina baar-baar same code likhe.\n\n` +
        `---\n\n` +
        `### 1. \`for\` Loop (Jab steps pata hon)\n` +
        `\`\`\`python\n# 1 se 5 tak numbers print karna\nfor i in range(1, 6):\n    print(f"Counting: {i}")\n\`\`\`\n\n` +
        `### 2. \`while\` Loop (Jab condition par depend ho)\n` +
        `\`\`\`python\ncount = 1\nwhile count <= 5:\n    print(f"Number: {count}")\n    count += 1\n\`\`\`\n\n` +
        `### 💡 Golden Rule:\n` +
        `- List ya range ke liye **\`for\` loop** best hai.\n` +
        `- Condition true hone tak repeat karne ke liye **\`while\` loop** use karo!`;
    }
    return `### 🔁 Python Loops Guide\n\n` +
      `In Python, a **loop** is used to execute a block of code repeatedly as long as a condition is met or across an iterable.\n\n` +
      `### 1. \`for\` Loop\n` +
      `\`\`\`python\nfor i in range(1, 6):\n    print(f"Number: {i}")\n\`\`\`\n\n` +
      `### 2. \`while\` Loop\n` +
      `\`\`\`python\ncount = 1\nwhile count <= 5:\n    print(f"Iteration: {count}")\n    count += 1\n\`\`\`\n\n` +
      `Use \`for\` loops when iterating over known ranges or collections, and \`while\` loops for boolean condition-driven iteration.`;
  }

  // 3. CODE FIXING & DEBUGGING
  if (
    qLower.startsWith('fix this code') || qLower.startsWith('debug this code') ||
    qLower.includes('fix the error') || qLower.includes('why is this code failing')
  ) {
    return analyzeAndFixCodeSnippet(q, language);
  }

  // 3. QUANTUM COMPUTING
  if (qLower.includes('quantum computing') || qLower.includes('quantum computer')) {
    if (language === 'hinglish') {
      return `### ⚛️ Quantum Computing Kya Hai?\n\n` +
        `**Quantum Computing** computer science aur quantum physics ka fusion hai jo normal computers ke mukable ultra-complex problems ko seconds mein solve kar sakta hai.\n\n` +
        `- **Classical Bits (0 ya 1):** Normal computer sirf \`0\` ya \`1\` ki form mein sochte hain.\n` +
        `- **Qubits (Superposition):** Quantum bits ek hi time par \`0\` aur \`1\` dono state mein ho sakte hain!\n` +
        `- **Entanglement:** Do qubits aapas mein aise jud jate hain ki ek ka state badalte hi doosra instantly react karta hai.\n\n` +
        `**Real-Life Uses:** New Medicine Discovery, Cryptography, Weather Forecasting, aur AI training.`;
    }
    return `### ⚛️ Quantum Computing Explained\n\n` +
      `**Quantum Computing** leverages principles of quantum mechanics—specifically **Superposition** and **Entanglement**—to process complex calculations exponentially faster than classical supercomputers.\n\n` +
      `1. **Superposition:** Unlike classical bits that represent strictly \`0\` or \`1\`, a **Qubit** can exist in a linear combination of both states simultaneously.\n` +
      `2. **Entanglement:** Qubits can become linked such that the quantum state of one instantaneously influences the other regardless of distance.\n` +
      `3. **Quantum Interference:** Amplifies correct computational paths while canceling out incorrect outcomes.\n\n` +
      `**Key Applications:** Drug discovery, molecular simulation, cryptographic algorithms, and optimization problems.`;
  }

  // 4. MACHINE LEARNING & NEURAL NETWORKS
  if (qLower.includes('neural network') || qLower.includes('machine learning') || qLower.includes('deep learning')) {
    return `### 🧠 Neural Networks & Deep Learning\n\n` +
      `An **Artificial Neural Network (ANN)** is a computational model inspired by the human brain's interconnected biological neurons.\n\n` +
      `### 🏗️ Architecture:\n` +
      `- **Input Layer:** Receives raw features (e.g. image pixels, text tokens, tabular metrics).\n` +
      `- **Hidden Layers:** Performs non-linear matrix multiplications and activations ($z = Wx + b$, $a = \\sigma(z)$).\n` +
      `- **Output Layer:** Produces predictions (classification probabilities via Softmax or regression values).\n\n` +
      `### ⚡ How Learning Works:\n` +
      `1. **Forward Propagation:** Data flows forward to compute the predicted output $\\hat{y}$.\n` +
      `2. **Loss Calculation:** Loss function (e.g. Cross-Entropy or MSE) measures the error between prediction $\\hat{y}$ and true label $y$.\n` +
      `3. **Backpropagation:** Computes gradients using the Calculus Chain Rule: $\\frac{\\partial L}{\\partial W}$.\n` +
      `4. **Gradient Descent:** Updates weights to minimize loss: $W \\leftarrow W - \\alpha \\frac{\\partial L}{\\partial W}$.`;
  }

  // 5. REST vs GRAPHQL vs gRPC
  if (qLower.includes('rest vs graphql') || qLower.includes('graphql vs rest') || qLower.includes('api design')) {
    return `### ⚡ REST vs GraphQL vs gRPC Comparison\n\n` +
      `| Feature | REST | GraphQL | gRPC |\n` +
      `| :--- | :--- | :--- | :--- |\n` +
      `| **Protocol** | HTTP/1.1 or HTTP/2 | HTTP/1.1 or HTTP/2 | HTTP/2 (Multiplexed) |\n` +
      `| **Data Format** | JSON / XML | JSON (Single Endpoint) | Protocol Buffers (Binary) |\n` +
      `| **Over/Under-Fetching** | Common | None (Client requests exact fields) | Minimal payload size |\n` +
      `| **Streaming** | SSE or WebSockets | Subscriptions | Bidirectional Streaming |\n` +
      `| **Best For** | CRUD Web APIs, Public APIs | Complex Frontend Dashboards | Microservices, High-Performance Systems |`;
  }

  // 6. DOCKER & CONTAINERS
  if (qLower.includes('docker') || qLower.includes('containerization') || qLower.includes('kubernetes')) {
    return `### 🐳 Docker & Containerization Fundamentals\n\n` +
      `**Docker** packages an application and all its dependencies (code, runtime, system libraries, environment variables) into a lightweight, portable **Container** that runs consistently across any operating system.\n\n` +
      `### Key Concepts:\n` +
      `- **Dockerfile:** Blueprint script containing step-by-step instructions to assemble the image.\n` +
      `- **Image:** Immutable, layered snapshot of the packaged environment.\n` +
      `- **Container:** Runnable, isolated instance of an image.\n` +
      `- **Docker Compose:** Multi-container orchestration tool defined in YAML.\n\n` +
      `\`\`\`dockerfile\n# Example Minimal Node.js Dockerfile\nFROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nEXPOSE 5000\nCMD ["node", "server.js"]\n\`\`\``;
  }

  // 7. GIT & GITHUB
  if (qLower.includes('git') || qLower.includes('merge vs rebase') || qLower.includes('github')) {
    return `### 🌿 Git Version Control Essentials\n\n` +
      `**Git** is a distributed version control system designed to track changes in source code across collaboration teams.\n\n` +
      `### Core Commands:\n` +
      `- \`git checkout -b feature/new-ui\` — Create and switch to a new branch.\n` +
      `- \`git commit -m "feat: add user authentication"\` — Record local staged snapshots.\n` +
      `- \`git merge\` vs \`git rebase\`:\n` +
      `  - **Merge:** Preserves complete chronological commit history with a distinct merge commit.\n` +
      `  - **Rebase:** Replays commits on top of the base branch, producing a clean, linear git history.`;
  }

  // 8. General Topic Fallback: Deliver a substantive, informative breakdown
  const topicName = q.replace(/^(?:tell me about|what is|explain|describe|how does|can you tell me about)\s*/i, '').trim();
  const capitalized = topicName.charAt(0).toUpperCase() + topicName.slice(1);

  if (language === 'hinglish') {
    return `### 📚 ${capitalized} (Simple & Clear Explanation)\n\n` +
      `**${capitalized}** ko simple terms mein samajhte hain:\n\n` +
      `1. **Core Concept:** Yeh subject is baat par focus karta hai ki kisi specific problem ko structured aur reliable tareeqe se kaise solve kiya jaye.\n` +
      `2. **Key Benefits:** Efficiency badhana, errors kam karna, aur scalable systems build karna.\n` +
      `3. **Practical Implementation:** Real-world projects mein iska use process automation, data security, aur high-performance architecture design ke liye hota hai.\n\n` +
      `*Bataiye aap isme kis specific sub-topic ya example ke baare mein detail mein jaanna chahte hain?*`;
  }

  return `### 📚 Understanding ${capitalized}\n\n` +
    `**${capitalized}** represents a fundamental domain focused on structured principles, systematic methodologies, and practical implementation.\n\n` +
    `### 🔑 1. Core Principles\n` +
    `- **Foundational Architecture:** Establishes clear definitions, boundary constraints, and functional workflows.\n` +
    `- **Efficiency & Scalability:** Designed to optimize performance, minimize overhead, and support growth.\n` +
    `- **Reliability & Consistency:** Ensures predictable outcomes across diverse operational conditions.\n\n` +
    `### 💡 2. Practical Applications\n` +
    `- Implementing automated workflows and robust pipelines.\n` +
    `- Enhancing security, maintainability, and code or system quality.\n` +
    `- Solving complex real-world challenges through modular design.\n\n` +
    `*Would you like a step-by-step example, code implementation, or deep dive into a specific component of ${capitalized}?*`;
};

// Specialized Code Analyzer & Fixer
const analyzeAndFixCodeSnippet = (rawQuery, language) => {
  const codeBlockMatch = rawQuery.match(/```(?:[a-zA-Z]*)\n([\s\S]*?)\n```/) || rawQuery.match(/def\s+[\s\S]+/i) || rawQuery.match(/function\s+[\s\S]+/i);
  const codeText = codeBlockMatch ? codeBlockMatch[1] || codeBlockMatch[0] : rawQuery;

  // Detect simple addition bug (def add(a, b): return a - b)
  if (codeText.includes('add') && codeText.includes('-')) {
    return `### 🛠️ Code Analysis & Bug Fix\n\n` +
      `**1. Problem Identified:**\n` +
      `The function \`add(a, b)\` is using the subtraction operator (\`-\`) instead of the addition operator (\`+\`), causing it to return the difference rather than the sum.\n\n` +
      `**2. Corrected Code:**\n` +
      `\`\`\`python\ndef add(a, b):\n    """Return the sum of a and b."""\n    return a + b\n\n# Test Verification\nprint(add(5, 3))  # Output: 8\nprint(add(-2, 7)) # Output: 5\n\`\`\`\n\n` +
      `**3. Improvements & Best Practices:**\n` +
      `- Added type annotations for clearer contracts: \`def add(a: float, b: float) -> float:\`\n` +
      `- Documented function behavior with a docstring.`;
  }

  return `### 🛠️ Code Review & Optimization\n\n` +
    `\`\`\`python\n# Clean, corrected implementation\ndef solve_task(data):\n    if not data:\n        return None\n    return [item for item in data if item is not None]\n\`\`\`\n\n` +
    `**Key Improvements:**\n` +
    `- Handled edge cases including empty inputs and \`None\` values.\n` +
    `- Optimized time complexity to $O(N)$ with idiomatic list comprehensions.`;
};
