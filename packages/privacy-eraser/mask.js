const rules = [
  { type: 'email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, mask: value => { const [local, domain] = value.split('@'); return `${local[0] || '*'}***@${domain}`; } },
  { type: 'phone', regex: /(?<!\d)(?:\+?82[- .]?)?01[016789][- .]?\d{3,4}[- .]?\d{4}(?!\d)/g, mask: value => { const keep = (value.match(/\d/g) || []).length - 4; let seen = 0; return value.replace(/\d/g, digit => seen++ < keep ? '*' : digit); } },
  { type: 'resident-id', regex: /(?<!\d)\d{6}[- ]?[1-4]\d{6}(?!\d)/g, mask: value => `${value.slice(0, 6)}-${value.replace(/[- ]/g, '').slice(6, 7)}******` },
  { type: 'card', regex: /(?<!\d)(?:\d[ -]?){13,19}(?!\d)/g, mask: value => value.replace(/\d(?=\d{4})/g, '*') },
  { type: 'ipv4', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, mask: value => value.split('.').map((part, index) => index < 2 ? '***' : part).join('.') },
  { type: 'secret', regex: /\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{20,})\b/g, mask: value => `${value.slice(0, 4)}***${value.slice(-4)}` }
  ,{ type: 'jwt', regex: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, mask: value => `${value.slice(0, 10)}...***` }
  ,{ type: 'private-key', regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g, mask: () => '-----PRIVATE KEY REDACTED-----' }
  ,{ type: 'aws-key', regex: /\bAKIA[0-9A-Z]{16}\b/g, mask: value => `${value.slice(0, 4)}***${value.slice(-4)}` }
];

export function maskText(input, options = {}) {
  let output = String(input ?? '');
  const enabled = options.types ? new Set(options.types) : null;
  const sticker = options.style === 'sticker' ? '⟦개인정보⟧' : null;
  for (const rule of rules) if (!enabled || enabled.has(rule.type)) output = output.replace(rule.regex, sticker || rule.mask);
  if (options.names) output = output.replace(/(이름|성명|name)\s*[:=]\s*([^,;\n]+)/giu, `$1: ${sticker || '***'}`);
  return output;
}

export function maskJson(value, options = {}) {
  if (typeof value === 'string') return maskText(value, options);
  if (Array.isArray(value)) return value.map(item => maskJson(item, options));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    const sensitiveKey = /name|성명|이름|email|메일|phone|전화|address|주소|secret|token|key/i.test(key);
    return [key, sensitiveKey && item != null ? '***' : maskJson(item, options)];
  }));
  return value;
}

export const ruleTypes = rules.map(rule => rule.type);

