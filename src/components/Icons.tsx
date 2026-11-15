import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const InstagramIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);
export const XIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
);
export const LinkedinIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 014 0v4M12 10v7" />
  </svg>
);
export const YoutubeIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" />
  </svg>
);
export const GithubIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden>
    <path d="M9 19c-4 1.2-4-2-6-2.5m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 00-.1 3.200A4.600 4.600 0 004 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21" />
  </svg>
);

export const SOCIAL_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  instagram: InstagramIcon,
  x: XIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  github: GithubIcon,
};

export const Logo = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
        <stop stopColor="#35e0ff" />
        <stop offset="0.5" stopColor="#2f6bff" />
        <stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path d="M16 2l12 7v14l-12 7L4 23V9z" stroke="url(#lg)" strokeWidth="1.8" />
    <path d="M10 22V10l12 12V10" stroke="url(#lg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
