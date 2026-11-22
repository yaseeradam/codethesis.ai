/**
 * Mathematical LaTeX to Academic Typography Converter
 * Eliminates raw LaTeX markup ($$, $, \frac, etc.) and transforms equations
 * into clean, universally readable standard academic mathematical notation.
 */

// Greek letter mapping
const GREEK_MAP: Record<string, string> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  zeta: 'ζ',
  eta: 'η',
  theta: 'θ',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  mu: 'μ',
  nu: 'ν',
  xi: 'ξ',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Xi: 'Ξ',
  Pi: 'Π',
  Sigma: 'Σ',
  Upsilon: 'Υ',
  Phi: 'Φ',
  Psi: 'Ψ',
  Omega: 'Ω',
};

// Math symbol mapping
const SYMBOL_MAP: Record<string, string> = {
  times: '×',
  cdot: '·',
  div: '÷',
  pm: '±',
  mp: '∓',
  leq: '≤',
  le: '≤',
  geq: '≥',
  ge: '≥',
  neq: '≠',
  ne: '≠',
  approx: '≈',
  sim: '~',
  equiv: '≡',
  propto: '∝',
  infty: '∞',
  in: '∈',
  notin: '∉',
  subset: '⊂',
  subseteq: '⊆',
  cup: '∪',
  cap: '∩',
  forall: '∀',
  exists: '∃',
  nabla: '∇',
  partial: '∂',
  rightarrow: '→',
  to: '→',
  leftarrow: '←',
  Rightarrow: '⇒',
  Leftarrow: '⇐',
  Leftrightarrow: '⇔',
};

// Common Unicode Superscripts & Subscripts
const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 't': 'ᵗ',
};

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ',
  'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ',
  's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ',
};

function toUnicodeSuper(str: string): string {
  return str.split('').map(ch => SUPERSCRIPTS[ch] || ch).join('');
}

function toUnicodeSub(str: string): string {
  return str.split('').map(ch => SUBSCRIPTS[ch] || ch).join('');
}

/**
 * Transforms a single LaTeX formula into clean academic mathematical notation.
 * Example: \frac{1}{1 + d(F_q, F_t)} -> 1 / [1 + d(F_q, F_t)]
 */
export function convertLatexFormula(latex: string): string {
  if (!latex) return '';

  let out = latex.trim();

  // Strip leading/trailing delimiters $$, $, \[, \]
  out = out.replace(/^(\$\$|\$|\\\[)\s*/, '').replace(/\s*(\$\$|\$|\\\])$/, '');

  // Strip LaTeX environments \begin{equation}, \end{equation}, \begin{aligned}, etc.
  out = out.replace(/\\(begin|end)\{[a-zA-Z0-9*]+\}/g, '');

  // Strip \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}, \operatorname{...}
  out = out.replace(/\\(text|mathrm|mathbf|mathit|textbf|textbf|operatorname)\{([^}]+)\}/g, '$2');

  // Strip spacing commands like \, \; \quad \qquad \!
  out = out.replace(/\\(quad|qquad|,|;|!)/g, ' ');

  // Handle nested or repeated \frac{num}{den}
  // Repeat to handle multiple fractions
  let prev = '';
  let maxLoop = 5;
  while (out.includes('\\frac') && out !== prev && maxLoop-- > 0) {
    prev = out;
    out = out.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (match, num, den) => {
      const cleanNum = convertLatexFormula(num).trim();
      const cleanDen = convertLatexFormula(den).trim();

      // If denominator has operations (+, -, *, /), wrap in brackets [ ... ]
      const needsParenDen = /[+\-*/]/.test(cleanDen) && !cleanDen.startsWith('(') && !cleanDen.startsWith('[');
      const formattedDen = needsParenDen ? `[${cleanDen}]` : cleanDen;

      // If numerator has operations, wrap in parentheses
      const needsParenNum = /[+\-]/.test(cleanNum) && !cleanNum.startsWith('(');
      const formattedNum = needsParenNum ? `(${cleanNum})` : cleanNum;

      return `${formattedNum} / ${formattedDen}`;
    });
  }

  // Handle \sqrt{x} and \sqrt[n]{x}
  out = out.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, '$1√($2)');
  out = out.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

  // Handle \sum_{i=1}^{n} and \sum_{i=0}^{\infty}
  out = out.replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, '∑($1 to $2) ');
  out = out.replace(/\\sum_\{([^{}]+)\}/g, '∑($1) ');
  out = out.replace(/\\sum/g, '∑ ');

  // Handle \prod (Product)
  out = out.replace(/\\prod_\{([^{}]+)\}\^\{([^{}]+)\}/g, '∏($1 to $2) ');
  out = out.replace(/\\prod/g, '∏ ');

  // Handle \int (Integral)
  out = out.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, '∫($1 to $2) ');
  out = out.replace(/\\int/g, '∫ ');

  // Handle Greek letters
  out = out.replace(/\\([a-zA-Z]+)/g, (match, word) => {
    if (GREEK_MAP[word]) return GREEK_MAP[word];
    if (SYMBOL_MAP[word]) return SYMBOL_MAP[word];
    return match;
  });

  // Handle simple sub/superscripts e.g. x^{2} or x_{i} or F_q -> F_q
  out = out.replace(/\^\{([0-9a-zA-Z+\-]+)\}/g, (m, exp) => toUnicodeSuper(exp));
  out = out.replace(/\^([0-9a-zA-Z])/g, (m, exp) => toUnicodeSuper(exp));

  // Convert subscripts where clean: e.g. _{1} -> ₁ or keep as _q if not in subscript map
  out = out.replace(/_\{([0-9a-zA-Z+\-]+)\}/g, (m, sub) => {
    const unicode = toUnicodeSub(sub);
    return unicode.length === sub.length && unicode !== sub ? unicode : `_${sub}`;
  });

  // Clean remaining stray backslashes
  out = out.replace(/\\([a-zA-Z]+)/g, '$1');
  out = out.replace(/\\/g, '');

  // Normalize spacing around operators
  out = out.replace(/\s*([=+\-])\s*/g, ' $1 ');
  out = out.replace(/\s*\/\s*/g, ' / ');
  out = out.replace(/\s{2,}/g, ' ').trim();

  return out;
}

/**
 * Scans an entire document or text string and converts all embedded LaTeX equations
 * (both block `$$ ... $$` and inline `$ ... $`) into clean academic formulas.
 */
export function sanitizeAcademicTextMath(text: string): string {
  if (!text) return '';

  // 1. Process block equations: $$ ... $$ or \[ ... \]
  let processed = text.replace(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\])/g, (match) => {
    const rawFormula = match.replace(/^(\$\$|\\\[)/, '').replace(/(\$\$|\\\])$/, '').trim();
    const cleanFormula = convertLatexFormula(rawFormula);
    return `\n\n[EQUATION: ${cleanFormula}]\n\n`;
  });

  // 2. Process inline math: $ ... $ (must not match normal dollar signs e.g. $100)
  // Inline math usually contains math symbols, letters with subscripts, backslashes, etc.
  processed = processed.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (match, formula) => {
    // If it's just a price like $50 or $1,000, don't treat as math
    if (/^\s*[0-9,.]+\s*$/.test(formula)) return match;
    const cleanFormula = convertLatexFormula(formula);
    return cleanFormula;
  });

  return processed;
}

/**
 * Checks if a line or block is a mathematical equation.
 */
export function isMathEquation(text: string): boolean {
  if (!text) return false;
  const t = text.trim();
  return (
    (t.startsWith('$$') && t.endsWith('$$')) ||
    (t.startsWith('\\[') && t.endsWith('\\]')) ||
    t.startsWith('[EQUATION:') ||
    (/^S\s*=\s*/.test(t) && t.includes('/')) ||
    (t.includes('\\frac') && t.includes('='))
  );
}

/**
 * Extracts and formats clean equation line for Word DOCX or UI.
 * Returns { formula, label }
 */
export function extractCleanEquation(raw: string, defaultEquationNumber?: string): { formula: string; label: string } {
  let content = raw.trim();

  if (content.startsWith('[EQUATION:')) {
    content = content.replace(/^\[EQUATION:\s*/, '').replace(/\]$/, '').trim();
  }

  // Extract any existing (Equation X) or (Eq. X) at the end
  let label = defaultEquationNumber || '';
  const labelMatch = content.match(/\(((?:Eq\.|Equation)\s*[^)]+)\)$/i);
  if (labelMatch) {
    label = `(${labelMatch[1]})`;
    content = content.replace(/\(((?:Eq\.|Equation)\s*[^)]+)\)$/i, '').trim();
  }

  const cleanFormula = convertLatexFormula(content);
  return { formula: cleanFormula, label };
}
