// Test simulated parser with negative lookahead and 3.1 guard
function simulateParse(mdText) {
  const lines = mdText.split('\n');
  const results = [];
  let currentSectionNum = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Strip outer bold wrapping if an entire paragraph was accidentally wrapped in **...**
    if (line.startsWith("**") && line.endsWith("**") && line.length > 80) {
      line = line.slice(2, -2).trim();
    }
    if (line.startsWith("__") && line.endsWith("__") && line.length > 80) {
      line = line.slice(2, -2).trim();
    }

    const cleanNoMd = line.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();

    // 1. Heading 1
    const isChapterRegex = /^(CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|[1-5]))\b/i;
    const isPrelimH1Regex = /^(DEDICATION|CERTIFICATION|DECLARATION|ACKNOWLEDGEMENT|ACKNOWLEDGEMENTS|ABSTRACT|TABLE OF CONTENTS|LIST OF TABLES|LIST OF FIGURES|REFERENCES|BIBLIOGRAPHY|APPENDIX\s+[A-Z0-9])\b/i;
    const isMarkdownH1 = /^#\s+/.test(line) && !/^###?/.test(line);

    if ((isChapterRegex.test(cleanNoMd) || isPrelimH1Regex.test(cleanNoMd) || isMarkdownH1) && cleanNoMd.length < 100) {
      currentSectionNum = "";
      results.push({ type: 'HEADING_1', text: cleanNoMd });
      continue;
    }

    // SPECIAL FIX FOR 3.1: Text under 3.1 must ALWAYS be normal paragraph text, NEVER headed or bold!
    if (currentSectionNum === "3.1") {
      // If a line begins with 3.2, break out of 3.1 and let it become Heading 2
      if (/^3\.2\b/.test(cleanNoMd) || /^##\s+3\.2\b/.test(line)) {
        currentSectionNum = "3.2";
        results.push({ type: 'HEADING_2', text: cleanNoMd });
        continue;
      }
      // Any text under 3.1 (even if starting with 3.1.1, ###, or bold) is rendered as a normal paragraph!
      if (!/^[-*+]\s+/.test(line) && !/^\d+\.\s+/.test(line)) {
        // Strip any redundant leading "3.1.1 ...:" or markdown hashes so it reads as pure normal academic prose
        const cleanBodyText = cleanNoMd.replace(/^(\d+\.\d+(\.\d+)?\s*[-:–—]?\s*)/, '');
        results.push({ type: 'PARAGRAPH_UNDER_3.1', text: cleanBodyText.slice(0, 70) });
        continue;
      }
    }

    // 2. Heading 2: starts with "## " or numbered like "3.1 Introduction", "3.2 Analysis..."
    // Crucial: negative lookahead (?!\.\d) so 3.1.1 is NOT matched as 3.1!
    const isH2Markdown = /^##\s+/.test(line) && !/^###/.test(line);
    const h2NumberMatch = cleanNoMd.match(/^(\d+\.\d+)(?!\.\d)[\s:.\-–—]/) || cleanNoMd.match(/^(\d+\.\d+)$/);
    const isH2Number = Boolean(h2NumberMatch);

    if ((isH2Markdown || isH2Number) && cleanNoMd.length < 110 && !/[.!?]$/.test(cleanNoMd)) {
      if (h2NumberMatch) {
        currentSectionNum = h2NumberMatch[1];
      } else {
        const inferredMatch = cleanNoMd.match(/^(\d+\.\d+)(?!\.\d)/);
        if (inferredMatch) currentSectionNum = inferredMatch[1];
      }
      results.push({ type: 'HEADING_2', text: cleanNoMd });
      continue;
    }

    // 3. Heading 3: starts with "### " or numbered like "1.3.1 Aim"
    const isH3Markdown = /^###\s+/.test(line);
    const isH3Number = /^(\d+\.\d+\.\d+)[\s:.\-–—]/.test(cleanNoMd) || /^(\d+\.\d+\.\d+)$/.test(cleanNoMd);
    if ((isH3Markdown || isH3Number) && cleanNoMd.length < 110 && !/[.!?]$/.test(cleanNoMd)) {
      results.push({ type: 'HEADING_3', text: cleanNoMd });
      continue;
    }

    results.push({ type: 'PARAGRAPH', text: cleanNoMd.slice(0, 70) });
  }

  return results;
}

const testInput = `# CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN

## 3.1 Introduction
### Design Philosophy and Objectives of System Analysis
This chapter presents a comprehensive analysis and design of the proposed automated door security system for Divisional Police Stations in Nigeria.

### 3.1.1 Overview of Security Architecture
The security architecture enforces automated locking mechanisms.

## 3.2 Analysis of the Existing System
The existing manual workflow relies upon physical paper logs.

### 3.2.1 Problems and Bottlenecks of the Existing System
- Bottleneck 1`;

console.log(simulateParse(testInput));
