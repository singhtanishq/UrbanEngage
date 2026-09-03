/** Date/time formatting helpers shared across pages. */

export const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

export const formatDateTime = (value) =>
    value
        ? new Date(value).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : '—';

export const formatRelative = (value) => {
    if (!value) return '';
    const diff = Date.now() - new Date(value).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(value);
};

/** "2 May 2026" style date parts for event badges. */
export const dateParts = (value) => {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return null;
    return {
        day: d.getDate(),
        month: d.toLocaleString(undefined, { month: 'short' }),
        year: d.getFullYear(),
    };
};

export const initials = (name) =>
    (name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');

/** Deterministic pastel gradient per name for avatars. */
const AVATAR_HUES = [158, 172, 186, 200, 214, 24, 38, 262, 292, 330];

export const avatarGradient = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 997;
    const hue = AVATAR_HUES[hash % AVATAR_HUES.length];
    return `linear-gradient(135deg, hsl(${hue} 52% 42%), hsl(${(hue + 28) % 360} 58% 30%))`;
};

export const numberFormat = (n) => (n ?? 0).toLocaleString();
