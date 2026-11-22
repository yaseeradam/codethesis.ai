/**
 * Thesis Helper Utilities
 * Disentangles degree-awarding institutions from target case study organizations,
 * extracts contextual research domains from topics, and provides parameter assistants.
 */

export function cleanThesisTopicTitle(topic: string): string {
  if (!topic) return "";
  return topic
    .trim()
    .replace(
      /^(design\s+and\s+implementation\s+of\s+(an?|the)?|development\s+of\s+(an?|the)?|construction\s+of\s+(an?|the)?|modeling\s+and\s+simulation\s+of\s+(an?|the)?)\s*/i,
      ""
    )
    .trim();
}

export function extractDomainFromTopic(topic: string): string {
  if (!topic) return "the Designated Operational Organization";
  const clean = topic.trim();

  // 1. Explicit case study match: e.g. "(A Case Study of Nigeria Police Force)"
  const caseStudyMatch = clean.match(/\b(?:case\s+study\s+of|case\s+study:?)\s+([^,.;)]+)/i);
  if (caseStudyMatch && caseStudyMatch[1]) {
    return caseStudyMatch[1].replace(/[()]/g, "").trim();
  }

  // 2. Preposition "for ...": e.g. "for Police Stations in Nigeria"
  const forMatch = clean.match(/\bfor\s+([^,.;)]+)/i);
  if (forMatch && forMatch[1]) {
    const candidate = forMatch[1].replace(/[()]/g, "").trim();
    if (candidate.length > 3 && !/^(the|a|an|undergraduate|students|research)$/i.test(candidate)) {
      return candidate;
    }
  }

  // 3. Preposition "in ...": e.g. "in Primary Healthcare Centres"
  const inMatch = clean.match(/\bin\s+([^,.;)]+)/i);
  if (inMatch && inMatch[1]) {
    const candidate = inMatch[1].replace(/[()]/g, "").trim();
    if (candidate.length > 3 && !/^(the|a|an|nigeria|lagos|abuja|africa)$/i.test(candidate)) {
      return candidate;
    }
  }

  // 4. Keyword-based domain heuristic
  const lower = clean.toLowerCase();
  if (lower.includes("police")) return "Divisional Police Stations in Nigeria";
  if (
    lower.includes("hospital") ||
    lower.includes("health") ||
    lower.includes("clinic") ||
    lower.includes("patient") ||
    lower.includes("medical")
  ) {
    return "Designated Healthcare Facility";
  }
  if (
    lower.includes("bank") ||
    lower.includes("atm") ||
    lower.includes("fintech") ||
    lower.includes("payment") ||
    lower.includes("loan")
  ) {
    return "Commercial Financial Institution";
  }
  if (
    lower.includes("school") ||
    lower.includes("student") ||
    lower.includes("course") ||
    lower.includes("result") ||
    lower.includes("bursary") ||
    lower.includes("campus")
  ) {
    return "Tertiary Educational Institution";
  }
  if (lower.includes("hotel") || lower.includes("lodge") || lower.includes("booking") || lower.includes("room")) {
    return "Hospitality Management Establishment";
  }
  if (lower.includes("inventory") || lower.includes("warehouse") || lower.includes("stock") || lower.includes("retail")) {
    return "Commercial Inventory & Logistics Depot";
  }
  if (lower.includes("traffic") || lower.includes("transport") || lower.includes("vehicle") || lower.includes("transit")) {
    return "Metropolitan Transport & Traffic Directorate";
  }
  if (lower.includes("farm") || lower.includes("agriculture") || lower.includes("crop") || lower.includes("poultry")) {
    return "Agricultural Enterprise & Processing Facility";
  }

  return "the Designated Operational Organization";
}

export function getSuggestedCaseStudies(topic: string, awardingInstitution?: string): string[] {
  const clean = (topic || "").toLowerCase();

  if (clean.includes("police") || clean.includes("crime") || clean.includes("surveillance")) {
    return [
      "Nigeria Police Force (NPF)",
      "Divisional Police Headquarters",
      "State Police Command",
      "Generalized Study (All Nigerian Police Stations)",
    ];
  }
  if (
    clean.includes("hospital") ||
    clean.includes("health") ||
    clean.includes("clinic") ||
    clean.includes("patient") ||
    clean.includes("medical") ||
    clean.includes("pharmacy")
  ) {
    return [
      "Federal Medical Centre (FMC)",
      "State Specialist Hospital",
      "General Hospital",
      "Generalized Healthcare Facility",
    ];
  }
  if (
    clean.includes("bank") ||
    clean.includes("atm") ||
    clean.includes("fintech") ||
    clean.includes("payment") ||
    clean.includes("microfinance")
  ) {
    return [
      "Commercial Banking Branch",
      "Central Bank of Nigeria (CBN)",
      "Microfinance Bank Operations",
      "Generalized Financial Services",
    ];
  }
  if (
    clean.includes("school") ||
    clean.includes("student") ||
    clean.includes("university") ||
    clean.includes("course") ||
    clean.includes("portal") ||
    clean.includes("result") ||
    clean.includes("library")
  ) {
    return [
      awardingInstitution && awardingInstitution.trim() ? awardingInstitution.trim() : "University Main Campus",
      "Departmental Academic Registry",
      "Generalized Tertiary Institution",
    ];
  }
  if (clean.includes("hotel") || clean.includes("hospitality")) {
    return [
      "Luxury Hotel & Suites",
      "State Tourism & Hospitality Board",
      "Generalized Hospitality Facility",
    ];
  }
  if (clean.includes("court") || clean.includes("legal") || clean.includes("law")) {
    return [
      "High Court of Justice Registry",
      "Ministry of Justice",
      "Generalized Judicial System",
    ];
  }
  if (clean.includes("traffic") || clean.includes("road") || clean.includes("transport")) {
    return [
      "Federal Road Safety Corps (FRSC)",
      "State Traffic Management Agency",
      "Metropolitan Transport Depot",
    ];
  }

  return [
    "Designated Corporate Enterprise",
    "Government Ministry / Parastatal",
    "Generalized Academic Research (Broad Domain)",
  ];
}
