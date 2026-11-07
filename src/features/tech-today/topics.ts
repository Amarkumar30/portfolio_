/**
 * Which topics a story belongs to, and which stories don't belong at all.
 * Words in a title count for more than words in a summary, so a label reflects the headline.
 */
import type { Topic } from "./types";

/** In display priority: a story's label is the first of these it matches. */
const TOPIC_PATTERNS: readonly (readonly [Topic, RegExp])[] = [
  [
    "Search",
    /\b(seo|geo|generative engine|search engines?|google search|ai overviews?|answer engines?|ai search|perplexity|serps?)\b/i,
  ],
  [
    "AI",
    /\b(ai|a\.i\.|llms?|gpt(-\d\w*)?|chatgpt|openai|anthropic|claude|gemini|copilot|mistral|deepseek|machine learning|deep learning|neural|agentic)\b/i,
  ],
  [
    "Security",
    /\b(security|vulnerabilit(y|ies)|cves?|breach(es)?|hack(s|ed|ers?)?|ransomware|malware|phishing|zero[- ]days?|exploits?|encryption|privacy)\b/i,
  ],
  [
    "India",
    /\b(india|indian|bengaluru|bangalore|mumbai|delhi|gurugram|hyderabad|upi|rbi|sebi|nasscom|ondc|zomato|swiggy|flipkart|paytm)\b/i,
  ],
  [
    "Startups",
    /\b(start-?ups?|funding|fundraise|raises?|raised|seed round|series [a-f]|venture|vcs?|valuation|valued|ipos?|unicorns?|acquires?|acquisition|founders?)\b/i,
  ],
  [
    "Dev",
    /\b(programming|programmers?|developers?|open[- ]source|javascript|typescript|python|rust|golang|react|next\.js|node\.?js|web ?dev|webdev|css|html|apis?|sdks?|compilers?|databases?|postgres(ql)?|sqlite|linux|kernel|github|git|docker|kubernetes|devops|cloud|aws|azure|cli)\b/i,
  ],
];

const DENIED_TITLE =
  /\b(best deals?|deals? (on|for|of the)|discounts?|\d+% off|coupons?|giveaway|gift guide|black friday|cyber monday|prime day|best .{0,40} (to buy|you can buy)|sponsored|advertorial|brandvoice|partner content|trailer|box office|movies?|tv shows?|netflix|disney\+?|hbo|album|celebrity|horoscope|season \d+)\b/i;

const DENIED_TAG =
  /^(deals?|sponsored|partner content|brand ?(voice|spotlight|post)|entertainment|film|tv|television|music|culture|gaming|sports?)$/i;

function matches(text: string): Topic[] {
  return TOPIC_PATTERNS.flatMap(([topic, pattern]) => (pattern.test(text) ? [topic] : []));
}

export function classify(title: string, tags: string[], excerpt: string, extra: readonly Topic[] = []) {
  return [...new Set([...matches(`${title} ${tags.join(" ")}`), ...extra, ...matches(excerpt)])];
}

/** Gadget deals, entertainment and paid posts. */
export function isDenied(title: string, tags: string[]) {
  return DENIED_TITLE.test(title) || tags.some((tag) => DENIED_TAG.test(tag.trim()));
}
