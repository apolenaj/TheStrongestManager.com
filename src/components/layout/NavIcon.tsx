import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  dashboard: <Path d="M3 3h5v5H3V3Zm7 0h5v3h-5V3ZM3 10h5v5H3v-5Zm7-2h5v7h-5V8Z" />,
  today: (
    <Path d="M4 3h10v2H4V3Zm0 4h10v8H4V7Zm2 2v4m3-4v4m3-4v4" />
  ),
  training: <Path d="M3 9h3l2-5 2 10 2-5h3" />,
  programs: <Path d="M4 3h8v2H4V3Zm0 4h10v2H4V7Zm0 4h7v2H4v-2Z" />,
  technique: <Path d="M8 3v10M5 6l3-3 3 3M5 12l3 3 3-3" />,
  progress: <Path d="M3 13V8m4 5V5m4 8v-3m4 3V3" />,
  recovery: <Path d="M8 3v5l3 2M8 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
  nutrition: <Path d="M5 3v10m6-10v10M4 13h8M7 3h2" />,
  insights: <Path d="M3 11V5m3 6V3m3 8V7m3 4V4m3 7V6" />,
  settings: (
    <Path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.5 8h2m7 0h2M4.2 4.2l1.4 1.4m4.8 4.8 1.4 1.4M4.2 11.8l1.4-1.4m4.8-4.8 1.4-1.4" />
  ),
  profile: <Path d="M8 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3.5 13.5c1.2-2 2.8-3 4.5-3s3.3 1 4.5 3" />,
  exercises: <Path d="M3 8h10M5 5l6 6M11 5 5 11" />,
  methods: <Path d="M4 4h8v2H4V4Zm0 4h8v2H4V8Zm0 4h5v2H4v-2Z" />,
  coach: <Path d="M8 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 13c1-2 2.5-3 4-3s3 1 4 3" />,
  academy: <Path d="M2 7l6-3 6 3-6 3-6-3Zm2 3.5V12l4 2 4-2v-1.5" />,
  default: <Path d="M4 4h8v8H4V4Z" />,
};

function Path({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavIcon({ id }: { id: string }) {
  return <>{icons[id] ?? icons.default}</>;
}
