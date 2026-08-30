// Exact Calculation & Unit Conversion Subsystem

export const evaluateCalculation = (input) => {
  if (!input) return null;
  const clean = input.trim();

  // 1. Temperature conversions (e.g. "100 c to f", "32 f to c")
  const tempMatch = clean.match(/([\d.-]+)\s*(?:deg|degrees)?\s*([cf])\s*(?:to|in)\s*([cf])/i);
  if (tempMatch) {
    const val = parseFloat(tempMatch[1]);
    const from = tempMatch[2].toLowerCase();
    const to = tempMatch[3].toLowerCase();
    if (from === 'c' && to === 'f') {
      const res = (val * 9) / 5 + 32;
      return `${val}°C = **${res.toFixed(2)}°F**\n*Formula: ($°C \\times \\frac{9}{5}) + 32$*`;
    } else if (from === 'f' && to === 'c') {
      const res = ((val - 32) * 5) / 9;
      return `${val}°F = **${res.toFixed(2)}°C**\n*Formula: ($°F - 32) \\times \\frac{5}{9}$*`;
    }
  }

  // 2. Length & Distance conversions (km to miles, m to ft, kg to lbs)
  const distMatch = clean.match(/([\d.-]+)\s*(km|kilometer|miles|mi|meters|m|feet|ft|kg|lbs|pounds)\s*(?:to|in)\s*(km|kilometer|miles|mi|meters|m|feet|ft|kg|lbs|pounds)/i);
  if (distMatch) {
    const val = parseFloat(distMatch[1]);
    const from = distMatch[2].toLowerCase();
    const to = distMatch[3].toLowerCase();

    if ((from === 'km' || from === 'kilometer') && (to === 'miles' || to === 'mi')) {
      return `${val} km = **${(val * 0.621371).toFixed(4)} miles**`;
    }
    if ((from === 'miles' || from === 'mi') && (to === 'km' || to === 'kilometer')) {
      return `${val} miles = **${(val * 1.60934).toFixed(4)} km**`;
    }
    if ((from === 'kg') && (to === 'lbs' || to === 'pounds')) {
      return `${val} kg = **${(val * 2.20462).toFixed(3)} lbs**`;
    }
    if ((from === 'lbs' || from === 'pounds') && (to === 'kg')) {
      return `${val} lbs = **${(val * 0.453592).toFixed(3)} kg**`;
    }
  }

  // 3. Percentages (e.g. "what is 20% of 150", "15% of 80")
  const pctMatch = clean.match(/([\d.-]+)%\s*(?:of)\s*([\d.-]+)/i);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const result = (pct / 100) * total;
    return `**${pct}% of ${total}** = **${result}**\n*Calculation: $\\frac{${pct}}{100} \\times ${total} = ${result}$*`;
  }

  // 4. Safe Math Expression Evaluator (arithmetic +, -, *, /, ^, %, sqrt)
  const mathClean = clean.replace(/^(?:calculate|compute|what is|solve)\s*/i, '').replace(/x/gi, '*').replace(/\^/g, '**');
  if (/^[\d\s+\-*/.()**%]+$/.test(mathClean)) {
    try {
      // Evaluate within a strictly sandboxed Function without global access
      const sanitized = mathClean.replace(/[^0-9+\-*/().\s%]/g, '');
      const fn = new Function(`'use strict'; return (${sanitized})`);
      const val = fn();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return `### 🧮 Calculation Result:\n$$\\mathbf{${clean}} = \\mathbf{${Number.isInteger(val) ? val : val.toFixed(6).replace(/\.?0+$/, '')}}$$`;
      }
    } catch (e) {
      // Not a pure arithmetic string, continue
    }
  }

  return null;
};
