/* Mascota "Hapti": una gotita sonriente con manitas */
export function Hapti({ size = 130 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Hapti, la mascota de HapticLearn">
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="rgba(59,42,92,.15)" />
      <path d="M60 12c20 0 40 18 40 46 0 26-16 44-40 44S20 84 20 58C20 30 40 12 60 12z" fill="#FF6FA8" />
      <path d="M60 12c20 0 40 18 40 46 0 26-16 44-40 44S20 84 20 58C20 30 40 12 60 12z" fill="none" stroke="#D94A85" strokeWidth="4" />
      <ellipse cx="42" cy="34" rx="9" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 42 34)" />
      <circle cx="46" cy="58" r="9" fill="#fff" />
      <circle cx="74" cy="58" r="9" fill="#fff" />
      <circle cx="48" cy="60" r="4.5" fill="#3B2A5C" />
      <circle cx="72" cy="60" r="4.5" fill="#3B2A5C" />
      <circle cx="50" cy="58" r="1.6" fill="#fff" />
      <circle cx="74" cy="58" r="1.6" fill="#fff" />
      <path d="M46 78c4 8 24 8 28 0" fill="none" stroke="#3B2A5C" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="74" r="5" fill="#FFB3D1" />
      <circle cx="84" cy="74" r="5" fill="#FFB3D1" />
      <path d="M24 72c-8-2-12-10-8-16" fill="none" stroke="#D94A85" strokeWidth="6" strokeLinecap="round" />
      <path d="M96 72c8-2 12-10 8-16" fill="none" stroke="#D94A85" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
