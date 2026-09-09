import { domainToASCII } from 'node:url';
import { isIP } from 'node:net';

// Local falsification core only. No network, SMTP, payment, storage or CRM writes.
const LOCAL_ATOM = /^[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~.]+$/;
const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const STATES = new Set(['ok', 'NODATA', 'NXDOMAIN', 'TIMEOUT', 'SERVFAIL']);
const own = (object, key) => Object.hasOwn(object, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function evaluate(input) {
  const evidence = { source: 'CALLER_SUPPLIED_FIXTURE', networkUsed: false, dns: [] };
  const finish = (route, reason, status = 'ASSESSED') => ({
    route, reason, status, mailboxExists: 'UNKNOWN', evidence,
  });
  const review = (reason, status = 'UNAVAILABLE') => finish('REVIEW', reason, status);

  if (!object(input) || typeof input.email !== 'string') return review('UNSUPPORTED_INPUT', 'UNSUPPORTED');
  if (input.email.length > 4096) return review('UNSUPPORTED_INPUT_SIZE', 'UNSUPPORTED');
  const email = input.email.trim();
  if (!email) return finish('BLOCK', 'EMPTY_ADDRESS');
  if (/[\u0000-\u001f\u007f]/u.test(email)) return finish('BLOCK', 'CONTROL_CHARACTER_IN_ADDRESS');

  // Uncommon legal formats need a full RFC parser; preserve these for review.
  if (/["()<>]/u.test(email)) return review('UNSUPPORTED_COMPLEX_ADDRESS_SYNTAX', 'UNSUPPORTED');
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return finish('BLOCK', 'INVALID_ADDRESS_SEPARATOR');
  const [local, rawDomain] = parts;
  if (rawDomain.startsWith('[') && rawDomain.endsWith(']')) {
    return review('UNSUPPORTED_DOMAIN_LITERAL', 'UNSUPPORTED');
  }
  if (/[\s]/u.test(email)) return finish('BLOCK', 'WHITESPACE_INSIDE_ADDRESS');
  if (/[^\x00-\x7f]/u.test(local)) return review('UNSUPPORTED_SMTPUTF8_LOCAL_PART', 'UNSUPPORTED');
  if (!LOCAL_ATOM.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return finish('BLOCK', 'INVALID_LOCAL_PART');
  }
  if (Buffer.byteLength(local) > 64) return finish('BLOCK', 'LOCAL_PART_TOO_LONG');

  let domain;
  try { domain = domainToASCII(rawDomain).toLowerCase(); }
  catch { return finish('BLOCK', 'INVALID_DOMAIN'); }
  if (!domain || domain.length > 253 || !domain.includes('.') ||
      !domain.split('.').every(label => DNS_LABEL.test(label))) {
    return finish('BLOCK', 'INVALID_DOMAIN');
  }
  if (Buffer.byteLength(local + '@' + domain) > 254) return finish('BLOCK', 'ADDRESS_TOO_LONG');
  evidence.normalizedDomain = domain;

  if (!Array.isArray(input.disposableDomains) || input.disposableDomains.length > 100_000 ||
      !input.disposableDomains.every(value => typeof value === 'string' && value.length <= 253)) {
    return review('DISPOSABLE_SOURCE_UNAVAILABLE');
  }
  const disposableSet = new Set(input.disposableDomains.map(value => value.toLowerCase()));
  let listedDomain = null;
  const labels = domain.split('.');
  // Only complete domain-label suffixes match; embedded names never match.
  for (let start = 0; start < labels.length - 1; start++) {
    const suffix = labels.slice(start).join('.');
    if (disposableSet.has(suffix)) { listedDomain = suffix; break; }
  }
  evidence.disposable = {
    state: listedDomain ? 'LISTED_IN_SUPPLIED_SNAPSHOT' : 'NOT_LISTED_IN_SUPPLIED_SNAPSHOT',
    matchedDomain: listedDomain,
    freshness: 'NOT_PROVIDED_BY_FIXTURE_CONTRACT',
  };

  if (!object(input.dns) || !own(input.dns, domain) || !object(input.dns[domain])) {
    return review('DNS_UNAVAILABLE_UNKNOWN_FIXTURE_DOMAIN');
  }
  const records = input.dns[domain];
  const read = type => {
    const record = own(records, type) ? records[type] : { status: 'NODATA', answers: [] };
    if (!object(record) || !STATES.has(record.status) || !Array.isArray(record.answers) ||
        record.answers.length > 100 || !record.answers.every(value => typeof value === 'string' && value.length <= 2048)) {
      return { status: 'MALFORMED', answers: [] };
    }
    evidence.dns.push({ type, status: record.status, answers: [...record.answers] });
    if (record.status !== 'ok' && record.answers.length) return { status: 'MALFORMED', answers: [] };
    return record;
  };
  const unavailable = record => !['ok', 'NODATA', 'NXDOMAIN'].includes(record.status);
  const mx = read('MX');
  if (unavailable(mx)) return review(`DNS_UNAVAILABLE_MX_${mx.status}`);
  if (mx.status === 'NXDOMAIN') return finish('BLOCK', 'DOMAIN_NXDOMAIN');

  if (mx.status === 'ok' && mx.answers.length) {
    const parsed = mx.answers.map(answer => /^(\d{1,5})\s+(\S+)$/u.exec(answer.trim()));
    if (parsed.some(value => !value || Number(value[1]) > 65535)) return review('DNS_MALFORMED_MX');
    const nullRecords = parsed.filter(value => value[2] === '.');
    if (nullRecords.length) {
      if (parsed.length === 1 && parsed[0][1] === '0') return finish('BLOCK', 'DOMAIN_NULL_MX');
      return review('DNS_CONFLICTING_NULL_MX');
    }
    const exchangeValid = parsed.every(value => {
      const hostname = value[2].replace(/\.$/u, '').toLowerCase();
      return hostname.length <= 253 && hostname.split('.').every(label => DNS_LABEL.test(label));
    });
    if (!exchangeValid) return review('DNS_MALFORMED_MX_EXCHANGE');
    evidence.routing = 'MX_ADVERTISED_MAILBOX_UNVERIFIED';
  } else {
    // RFC 5321 address-record fallback applies only to absent MX, not DNS failure.
    let fallback = null;
    for (const type of ['A', 'AAAA']) {
      const address = read(type);
      if (unavailable(address)) return review(`DNS_UNAVAILABLE_${type}_${address.status}`);
      if (address.status === 'NXDOMAIN') return finish('BLOCK', 'DOMAIN_NXDOMAIN');
      if (address.status === 'ok' && address.answers.length) {
        const expectedVersion = type === 'A' ? 4 : 6;
        if (!address.answers.every(value => isIP(value) === expectedVersion)) return review('DNS_MALFORMED_ADDRESS_RECORD');
        fallback = type;
        break;
      }
    }
    if (!fallback) return finish('BLOCK', 'NO_MX_OR_ADDRESS_ROUTING');
    const txt = read('TXT');
    if (unavailable(txt)) return review(`DNS_UNAVAILABLE_TXT_${txt.status}`);
    if (txt.status === 'NXDOMAIN') return review('DNS_CONFLICTING_DOMAIN_OBSERVATIONS');
    // Mirrors a conservative intake convention, not SMTP recipient verification.
    const texts = txt.answers.map(value => value.replace(/"\s*"/gu, '').replace(/^"|"$/gu, '').trim());
    if (texts.some(value => /^v=spf1\s+-all$/iu.test(value))) return finish('BLOCK', 'FALLBACK_DOMAIN_REJECT_ALL_SPF');
    evidence.routing = `${fallback}_FALLBACK_MAILBOX_UNVERIFIED`;
  }

  return listedDomain
    ? finish('REVIEW', 'DISPOSABLE_LIST_MATCH_REQUIRES_REVIEW')
    : finish('KEEP', 'NO_DEMONSTRATED_REJECTION_AT_THIS_LAYER');
}
