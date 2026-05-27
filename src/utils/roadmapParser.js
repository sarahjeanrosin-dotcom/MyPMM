const FOUNDATION_KEYWORDS = /\b(released|shipped|launched|completed|done|past|previous|foundation|legacy|prior|before|already|v1|v2)\b/i;
const CURRENT_KEYWORDS = /\b(current|now|today|this release|this version|latest|present|introducing|new in)\b/i;
const FUTURE_KEYWORDS = /\b(next|upcoming|planned|coming soon|future|roadmap|q[1-4]\b|h[12]\b|will|intend|target)\b/i;

const DATE_PATTERNS = [
  /\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2})\b/,
  /\b(20\d{2}-Q[1-4])\b/i,
  /\b(Q[1-4]\s+20\d{2})\b/i,
  /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/i,
  /\b(20\d{2})\b/,
];

function extractDate(text) {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return '';
}

function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s,)>]+/);
  return match ? match[0] : '';
}

function inferStatus(text) {
  if (CURRENT_KEYWORDS.test(text)) return 'current';
  if (FOUNDATION_KEYWORDS.test(text)) return 'foundation';
  if (FUTURE_KEYWORDS.test(text)) return 'future';
  return null;
}

function splitIntoChunks(text) {
  // Split on blank lines, bullet points, numbered list items, or dashes
  const lines = text
    .split(/\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const chunks = [];
  let current = [];

  for (const line of lines) {
    const isBullet = /^[-•*►▸>]\s+/.test(line);
    const isNumbered = /^\d+[.)]\s+/.test(line);
    const isHeader = /^#+\s+/.test(line) || /^[A-Z][^a-z]{2,}:/.test(line);

    if ((isBullet || isNumbered || isHeader) && current.length > 0) {
      chunks.push(current.join(' '));
      current = [];
    }
    current.push(line.replace(/^[-•*►▸>\d+.)#\s]+/, '').trim());
  }
  if (current.length > 0) chunks.push(current.join(' '));

  return chunks.filter(c => c.length > 2);
}

export function parseRoadmapText(text) {
  if (!text || !text.trim()) return [];

  const chunks = splitIntoChunks(text);

  // First pass: assign statuses
  const withStatus = chunks.map((chunk, i) => ({
    chunk,
    status: inferStatus(chunk),
    index: i,
  }));

  // If we couldn't infer statuses, fall back to positional: first = foundation, middle = current, rest = future
  const hasExplicitStatus = withStatus.some(c => c.status !== null);
  if (!hasExplicitStatus) {
    withStatus.forEach((c, i) => {
      if (i === 0) c.status = 'foundation';
      else if (i === Math.floor(withStatus.length / 2)) c.status = 'current';
      else if (i < Math.floor(withStatus.length / 2)) c.status = 'foundation';
      else c.status = 'future';
    });
  } else {
    // Fill nulls: before first current → foundation, after last current → future
    let firstCurrentIdx = withStatus.findIndex(c => c.status === 'current');
    if (firstCurrentIdx === -1) firstCurrentIdx = Math.floor(withStatus.length / 2);
    withStatus.forEach((c, i) => {
      if (c.status === null) {
        c.status = i <= firstCurrentIdx ? 'foundation' : 'future';
      }
    });
  }

  return withStatus.map((c, i) => {
    const date = extractDate(c.chunk);
    const url = extractUrl(c.chunk);
    // Title: first sentence fragment or up to 60 chars
    const titleMatch = c.chunk.match(/^([^.:,\n]{5,60})/);
    const title = titleMatch ? titleMatch[1].replace(url, '').trim() : c.chunk.slice(0, 60);
    // Description: remainder after title
    const description = c.chunk.slice(title.length).replace(url, '').replace(date, '').trim().replace(/^[,.:–-]+/, '').trim();

    return {
      id: Date.now() + i,
      title: title.slice(0, 80),
      description: description.slice(0, 200),
      status: c.status,
      releaseDate: date,
      featureNoteUrl: url,
      isReleased: c.status === 'foundation',
    };
  });
}
