/**
 * Server-Side Request Forgery (SSRF) Prevention Utility
 * Validates outgoing webhook and callback URLs to prevent internal network scanning,
 * cloud metadata exploitation (169.254.169.254), and loopback access.
 */

const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  'metadata.google.internal',
  'instance-data',
]);

const BLOCKED_SUFFIXES = [
  '.local',
  '.internal',
  '.corp',
  '.lan',
  '.home',
];

/**
 * Validates whether an IPv4 address is in a reserved/private range
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-Local / Cloud Instance Metadata)
  if (a === 169 && b === 254) return true;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 224.0.0.0/4 (Multicast) or 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

export function validateWebhookUrl(rawUrl: string): { valid: boolean; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const isDev = process.env.NODE_ENV === 'development';
  let parsed: URL;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, error: 'Invalid URL structure' };
  }

  // 1. Protocol verification (HTTPS required in production, HTTP allowed for localhost dev)
  if (parsed.protocol !== 'https:') {
    if (!isDev || parsed.protocol !== 'http:' || !parsed.hostname.includes('localhost')) {
      return { valid: false, error: 'Webhook URL must use secure HTTPS protocol.' };
    }
  }

  const hostname = parsed.hostname.toLowerCase();

  // Allow localhost only in development mode
  if (isDev && (hostname === 'localhost' || hostname === '127.0.0.1')) {
    return { valid: true };
  }

  // 2. Reject blocked hostnames
  if (BLOCKED_HOSTS.has(hostname)) {
    return { valid: false, error: 'Access to loopback or cloud metadata services is prohibited.' };
  }

  // 3. Reject internal network TLDs
  if (BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return { valid: false, error: 'Access to internal or private domain names is prohibited.' };
  }

  // 4. IP address literal checks
  if (isPrivateIPv4(hostname)) {
    return { valid: false, error: 'Access to private or local network IP addresses is prohibited.' };
  }

  // Reject IPv6 literals
  if (hostname.startsWith('[') || hostname.includes(':')) {
    return { valid: false, error: 'IPv6 address literals are not supported for webhook endpoints.' };
  }

  return { valid: true };
}
