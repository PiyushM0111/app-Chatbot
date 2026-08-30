// Multi-Format Document & Data Analysis Engine

export const parseDocumentContent = (filename, content) => {
  if (!content) return { error: 'Empty file content' };

  const ext = filename.split('.').pop().toLowerCase();
  const lines = content.split('\n');
  const lineCount = lines.length;
  const charCount = content.length;

  // 1. CSV / Tabular Data Analysis
  if (ext === 'csv' || ext === 'tsv') {
    const delimiter = ext === 'tsv' ? '\t' : ',';
    const headerLine = lines[0] || '';
    const headers = headerLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rowCount = Math.max(0, lines.filter(l => l.trim()).length - 1);
    const sampleRows = lines.slice(1, 4).map(l => l.split(delimiter).map(c => c.trim()));

    return {
      type: 'tabular',
      filename,
      rowCount,
      columnCount: headers.length,
      headers,
      sampleRows,
      summary: `📊 **Tabular Data Detected:** \`${filename}\` (${rowCount} rows, ${headers.length} columns)\n` +
        `- **Columns:** ${headers.map(h => `\`${h}\``).join(', ')}\n` +
        `- **Data Snapshot:** 3 sample rows indexed for schema validation and statistical query processing.`
    };
  }

  // 2. JSON Data Structure
  if (ext === 'json') {
    try {
      const parsed = JSON.parse(content);
      const isArray = Array.isArray(parsed);
      const keys = isArray ? (parsed[0] ? Object.keys(parsed[0]) : []) : Object.keys(parsed);
      return {
        type: 'json',
        filename,
        isArray,
        itemCount: isArray ? parsed.length : keys.length,
        keys,
        summary: `📦 **JSON Schema:** \`${filename}\` (${isArray ? `${parsed.length} items array` : `${keys.length} top-level keys`})\n` +
          `- **Keys/Attributes:** ${keys.map(k => `\`${k}\``).join(', ')}`
      };
    } catch (e) {
      return { type: 'json', filename, error: 'Malformed JSON structure' };
    }
  }

  // 3. Source Code Files (Python, JS, TS, HTML, SQL)
  const codeExts = ['py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'sql', 'cpp', 'java', 'go', 'rs'];
  if (codeExts.includes(ext)) {
    // Detect function and class definitions
    const functionMatches = content.match(/(?:def|function|const|let|var|class)\s+([a-zA-Z0-9_]+)/g) || [];
    const symbols = functionMatches.map(m => m.trim()).slice(0, 10);

    return {
      type: 'code',
      filename,
      language: ext,
      lineCount,
      symbols,
      summary: `💻 **Source Code File:** \`${filename}\` (${lineCount} lines, Language: \`${ext.toUpperCase()}\`)\n` +
        (symbols.length > 0 ? `- **Key Symbols & Functions:** ${symbols.map(s => `\`${s}\``).join(', ')}\n` : '') +
        `- **Readiness:** Fully parsed for debugging, refactoring, and automated test generation.`
    };
  }

  // 4. Plain Text & Markdown
  return {
    type: 'text',
    filename,
    lineCount,
    charCount,
    summary: `📄 **Document Content:** \`${filename}\` (${lineCount} lines, ${charCount} characters)`
  };
};
