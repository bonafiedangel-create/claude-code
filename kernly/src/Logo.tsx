import { APP, APP_INITIAL } from './config';

/** Placeholder mark: the product's first letter on the accent tile. Swap for a real logo once the name is set. */
export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={APP.name} style={{ display: 'block' }}>
      <rect width="64" height="64" rx="18" fill="#ff5b1f" />
      <text x="32" y="46" textAnchor="middle" fontFamily="'Inter Tight', Inter, sans-serif" fontWeight="800" fontSize="44" letterSpacing="-2" fill="#fff8ef">{APP_INITIAL}</text>
      <circle cx="49" cy="16" r="4" fill="#15121a" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <Mark />
      <span>
        {APP.name.toLowerCase()}<b>.</b>
      </span>
    </span>
  );
}
