import {
  Bot,
  BrainCircuit,
  CodeXml,
  Gamepad2,
  Lightbulb,
  CircuitBoard,
  Wrench,
  Telescope,
  Trophy,
  Mic,
  Glasses,
  Atom,
  Hexagon,
  Orbit,
  Zap,
  Rocket,
  Cpu,
  Satellite,
  Flame,
  type LucideIcon,
} from "lucide-react";

/**
 * ALL CONTENT BELOW IS SAMPLE CONTENT.
 * Replace names, dates, links, sponsors and figures with your official festival information.
 */

export const FEST = {
  name: "NEXUS",
  edition: "TECHFEST 2027",
  tagline: "ENGINEERING THE IMPOSSIBLE",
  start: "2027-03-12T09:00:00",
  dates: "12 — 14 MAR 2027",
  venue: "Innovation Arena, Main Campus",
  city: "Your City, Country",
  email: "hello@nexus-techfest.example",
  phone: "+00 000 000 0000",
  // Optional: set VITE_REGISTER_URL in .env to send the Register buttons to an external form.
  registerUrl: (import.meta.env.VITE_REGISTER_URL as string | undefined) || "",
  socials: [
    { id: "instagram", label: "Instagram", href: "https://instagram.com" },
    { id: "x", label: "X / Twitter", href: "https://x.com" },
    { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com" },
    { id: "youtube", label: "YouTube", href: "https://youtube.com" },
    { id: "github", label: "GitHub", href: "https://github.com" },
  ],
};

export const STATS = [
  { value: 12000, suffix: "+", label: "Participants", note: "expected footfall" },
  { value: 60, suffix: "+", label: "Events", note: "across 6 arenas" },
  { value: 150, suffix: "+", label: "Colleges", note: "from every region" },
  { value: 24, suffix: "", label: "Workshops", note: "hands-on labs" },
];

export type EventItem = {
  id: string;
  name: string;
  color: string;
  Icon: LucideIcon;
  tagline: string;
  desc: string;
  tags: string[];
};

export const EVENTS: EventItem[] = [
  {
    id: "robotics",
    name: "Robotics",
    color: "#ff8a3d",
    Icon: Bot,
    tagline: "Machines that move the world",
    desc: "Line followers, combat bots and autonomous navigation. Build it, tune it, and send it into the arena.",
    tags: ["Bot Wars", "Maze Solver", "Drone Race"],
  },
  {
    id: "ai",
    name: "AI / ML",
    color: "#35e0ff",
    Icon: BrainCircuit,
    tagline: "Teach silicon to think",
    desc: "Model-building showdowns, data challenges and generative-AI sprints with real-world datasets.",
    tags: ["Data Duel", "GenAI Sprint", "Vision Lab"],
  },
  {
    id: "coding",
    name: "Coding",
    color: "#5b7bff",
    Icon: CodeXml,
    tagline: "Ship under pressure",
    desc: "Competitive programming, 24-hour hackathon and a capture-the-flag security gauntlet.",
    tags: ["Hackathon 24h", "CP Arena", "CTF"],
  },
  {
    id: "gaming",
    name: "Gaming",
    color: "#c04dff",
    Icon: Gamepad2,
    tagline: "Play at the highest level",
    desc: "Esports brackets, game-jam challenges and a VR arcade. Bring your squad, bring your A-game.",
    tags: ["Esports Cup", "Game Jam", "VR Arcade"],
  },
  {
    id: "innovation",
    name: "Innovation",
    color: "#3dffb0",
    Icon: Lightbulb,
    tagline: "Pitch what doesn't exist yet",
    desc: "Startup pitches, product design and sustainability challenges judged by industry mentors.",
    tags: ["Startup Pitch", "Ideathon", "Green Tech"],
  },
  {
    id: "electronics",
    name: "Electronics",
    color: "#ffd23d",
    Icon: CircuitBoard,
    tagline: "Where circuits come alive",
    desc: "Embedded systems, PCB design and IoT builds. Solder, debug and power up something new.",
    tags: ["Circuit Quest", "IoT Build", "PCB Design"],
  },
];

export type Experience = {
  id: string;
  name: string;
  Icon: LucideIcon;
  color: string;
  blurb: string;
  items: string[];
  meta: string;
};

export const EXPERIENCES: Experience[] = [
  {
    id: "workshops",
    name: "Workshops",
    Icon: Wrench,
    color: "#35e0ff",
    blurb: "Hands-on labs led by practitioners. Walk in with curiosity, walk out with a working build.",
    items: ["Intro to Robotics & ROS", "Prompt-to-Product with LLMs", "Embedded C on ARM", "3D Printing & CAD Basics"],
    meta: "24 labs · limited seats",
  },
  {
    id: "exhibitions",
    name: "Exhibitions",
    Icon: Telescope,
    color: "#5b7bff",
    blurb: "Walk through prototypes, research demos and student projects in the open innovation gallery.",
    items: ["Student Prototype Gallery", "Open Research Showcase", "Rover & Drone Display", "Retro Computing Corner"],
    meta: "Open all 3 days",
  },
  {
    id: "hackathon",
    name: "Hackathon",
    Icon: Trophy,
    color: "#c04dff",
    blurb: "Twenty-four hours, one problem statement, and a room full of people who refuse to sleep.",
    items: ["Team formation mixer", "Mentor office hours", "Midnight build sprint", "Final demo & judging"],
    meta: "24 hours · teams of 2–4",
  },
  {
    id: "talks",
    name: "Keynotes & Talks",
    Icon: Mic,
    color: "#3dffb0",
    blurb: "Founders, researchers and engineers on stage, sharing the work shaping the next decade.",
    items: ["Opening keynote", "Future of Autonomy panel", "Open-source in the AI era", "Founders fireside chat"],
    meta: "Speakers to be announced",
  },
  {
    id: "xr",
    name: "XR Zone",
    Icon: Glasses,
    color: "#ff8a3d",
    blurb: "Step into immersive worlds: VR demos, AR installations and spatial-computing playgrounds.",
    items: ["VR Racing Pods", "AR Sandbox", "Spatial Design Studio", "Hologram Gallery"],
    meta: "Drop in, no booking",
  },
];

export type ScheduleItem = { time: string; title: string; venue: string; tag: string; desc: string };

export const SCHEDULE: { day: string; date: string; theme: string; items: ScheduleItem[] }[] = [
  {
    day: "DAY 01",
    date: "12 MAR",
    theme: "Ignition",
    items: [
      { time: "09:00", title: "Gates Open & Check-in", venue: "Main Plaza", tag: "Arrival", desc: "Collect your badge, kit and arena map." },
      { time: "10:30", title: "Opening Ceremony & Keynote", venue: "Innovation Arena", tag: "Keynote", desc: "The festival launches with a keynote and a live reveal." },
      { time: "12:30", title: "Robotics Qualifiers", venue: "Arena A", tag: "Robotics", desc: "Bots take their first runs on the qualifier track." },
      { time: "14:00", title: "Workshop: Prompt-to-Product", venue: "Lab 2", tag: "Workshop", desc: "Build a small AI product from scratch in 3 hours." },
      { time: "18:00", title: "Hackathon Kick-off", venue: "Hall C", tag: "Hackathon", desc: "Problem statements drop. The 24-hour clock starts." },
    ],
  },
  {
    day: "DAY 02",
    date: "13 MAR",
    theme: "Overdrive",
    items: [
      { time: "09:30", title: "AI / ML Data Duel", venue: "Lab 1", tag: "AI / ML", desc: "Teams race to the top of the live leaderboard." },
      { time: "11:00", title: "Exhibition Opens", venue: "Gallery Hall", tag: "Exhibit", desc: "Prototypes and research demos open to everyone." },
      { time: "13:00", title: "Esports Quarterfinals", venue: "Arena B", tag: "Gaming", desc: "Brackets narrow as the crowd gets louder." },
      { time: "15:30", title: "Panel: Future of Autonomy", venue: "Innovation Arena", tag: "Talk", desc: "Engineers discuss where autonomous systems go next." },
      { time: "19:00", title: "Circuit Quest Finals", venue: "Lab 4", tag: "Electronics", desc: "Debug, solder and power up against the clock." },
    ],
  },
  {
    day: "DAY 03",
    date: "14 MAR",
    theme: "Singularity",
    items: [
      { time: "09:00", title: "Hackathon Final Demos", venue: "Hall C", tag: "Hackathon", desc: "Three-minute demos, live judging, no slides allowed." },
      { time: "11:30", title: "Startup Pitch Finals", venue: "Innovation Arena", tag: "Innovation", desc: "Finalists pitch to mentors and investors." },
      { time: "14:00", title: "Robotics Grand Finale", venue: "Arena A", tag: "Robotics", desc: "The fastest, strongest and smartest bots collide." },
      { time: "16:30", title: "Awards & Closing Ceremony", venue: "Innovation Arena", tag: "Ceremony", desc: "Winners are crowned, and next year is announced." },
      { time: "18:30", title: "Afterglow Concert", venue: "Main Plaza", tag: "Social", desc: "Lights, music and a drone show to close it out." },
    ],
  },
];

export type Sponsor = { name: string; Icon: LucideIcon; tier: "title" | "associate" | "partner" };

export const SPONSORS: Sponsor[] = [
  { name: "Quantum Forge", Icon: Atom, tier: "title" },
  { name: "Helix Dynamics", Icon: Hexagon, tier: "associate" },
  { name: "Orbitron Labs", Icon: Orbit, tier: "associate" },
  { name: "Voltaris", Icon: Zap, tier: "associate" },
  { name: "Skyline Rocketry", Icon: Rocket, tier: "partner" },
  { name: "Cobalt Systems", Icon: Cpu, tier: "partner" },
  { name: "Aurora Satellite", Icon: Satellite, tier: "partner" },
  { name: "Ember Robotics", Icon: Flame, tier: "partner" },
];
