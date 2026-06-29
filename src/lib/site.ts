import logoAsset from "@/assets/logo.asset.json";
import profileAsset from "@/assets/profile.asset.json";
import {
  Globe, Smartphone, Bot, Cpu, Sparkles, Plug, Lightbulb,
  type LucideIcon,
} from "lucide-react";

export const LOGO_URL = logoAsset.url;
export const PROFILE_URL = profileAsset.url;

export const SITE = {
  name: "Vincent Gyan — VinTechAI",
  short: "VinTechAI",
  tagline: "AI Engineer • Full-Stack & Mobile Developer • Prompt Engineer",
  description:
    "I build intelligent software — AI agents, web platforms, and mobile apps that solve real problems. Based in Sunyani, Ghana.",
  email: "gyanvincent111222@gmail.com",
  whatsapp: "+233530335103",
  whatsappDisplay: "+233 530 335 103",
  github: "#",
  linkedin: "#",
  twitter: "#",
  location: "Sunyani, Ghana",
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SERVICES: Service[] = [
  { slug: "website-development", title: "Website Development",
    description: "Modern, fast, SEO-friendly websites and web platforms built with React and TypeScript.",
    icon: Globe },
  { slug: "mobile-app-development", title: "Mobile App Development",
    description: "Cross-platform iOS & Android apps with Flutter — production-grade architecture and UX.",
    icon: Smartphone },
  { slug: "ai-automation", title: "AI Automation",
    description: "Automate busywork with AI-driven workflows that integrate cleanly with your stack.",
    icon: Cpu },
  { slug: "ai-agent-development", title: "AI Agent Development",
    description: "Autonomous AI agents with tools, memory and guardrails — built for real production use.",
    icon: Bot },
  { slug: "prompt-engineering", title: "Prompt Engineering",
    description: "Reliable prompts, evaluation harnesses, and prompt pipelines that cut LLM cost and lift quality.",
    icon: Sparkles },
  { slug: "api-integration", title: "API Integration",
    description: "Connect anything to anything — REST, GraphQL, webhooks, third-party APIs, secure & resilient.",
    icon: Plug },
  { slug: "technical-consultation", title: "Technical Consultation",
    description: "Architecture reviews, AI strategy, and pragmatic guidance for shipping product faster.",
    icon: Lightbulb },
];

export const BLOG_CATEGORIES = [
  "All",
  "Artificial Intelligence",
  "Software Development",
  "Flutter Development",
  "AI Automation",
  "Prompt Engineering",
] as const;
