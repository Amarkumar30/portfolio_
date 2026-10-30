export interface SkillCategory {
  title: string;
  items: string[];
  note?: string;
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  problemStatement: string;
  collaborationNote?: string;
  stack: string[];
  contributions: string[];
  image?: { src: string; alt: string };
  links: ProjectLink[];
  featured: boolean;
}

export const quickHighlights = [
  {
    label: "Education",
    value: "B.Tech CSE, South Asian University, Delhi (2024-2028)",
  },
  {
    label: "Current Focus",
    value: "Generative Engine Optimization research and SDE interview prep",
  },
  {
    label: "Achievement",
    value: "1st Prize, AvishkarX - CSI x SAU Ideathon",
  },
] as const;

export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    items: ["Python", "C++", "JavaScript", "TypeScript", "SQL"],
  },
  {
    title: "Frameworks & Libraries",
    items: ["React", "Node.js", "Express", "NestJS", "Prisma ORM", "tRPC"],
  },
  {
    title: "Backend & APIs",
    items: [
      "REST APIs",
      "JWT Authentication",
      "Socket.IO",
      "Role-Based Access Control",
    ],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MySQL", "Drizzle ORM"],
  },
  {
    title: "DevOps & Tools",
    items: ["Docker (basic)", "Git/GitHub", "Render", "Vercel"],
  },
  {
    title: "AI/ML",
    items: ["RAG pipelines", "LLM integration (Gemini API)", "GEO research"],
  },
];

export const familiarWith = ["Redis", "pgvector", "advanced Socket.IO patterns"];

// TODO(amar): add GitHub/demo links and a screenshot (image: { src, alt }) for each project.
export const projects: Project[] = [
  {
    slug: "hostel-management-platform",
    title: "Hostel Management Platform",
    summary:
      "Collaborative SmartHack project for room allocation, complaints, and AI-assisted hostel support workflows.",
    problemStatement:
      "Hostel workflows often get fragmented across spreadsheets, ad hoc messaging, and manual approval loops. The team built a central platform to streamline room allocation, complaints, and policy queries across student, warden, and admin roles.",
    collaborationNote:
      "Built as a collaborative hackathon project at SmartHack, with ownership split across the team.",
    stack: [
      "NestJS",
      "React 19",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Socket.IO",
      "Docker",
      "Gemini API",
      "pgvector",
    ],
    contributions: [
      "Worked on the full-stack product flow for role-based access across student, warden, and admin journeys.",
      "Implemented secure JWT authentication with refresh-token support and helped shape 10+ REST endpoints for room allocation and complaint management.",
      "Integrated real-time complaint notifications with Socket.IO to reduce lag in operational updates.",
      "Contributed to the RAG-powered chatbot experience over a PostgreSQL knowledge base and supported the anonymous complaint flow using salted-hash identity preservation.",
    ],
    links: [],
    featured: true,
  },
  {
    slug: "freshsip-ordering-platform",
    title: "FreshSip",
    summary:
      "Full-stack ordering system for a local juice bar with UPI payments and a real-time order management dashboard.",
    problemStatement:
      "Small local food businesses often rely on phone calls or manual counters for orders, which makes order tracking and payment confirmation messy during busy hours. FreshSip was built to make ordering and status visibility simpler for both customers and operators.",
    stack: [
      "React 19",
      "TypeScript",
      "tRPC",
      "Express",
      "MySQL",
      "Drizzle ORM",
      "Razorpay",
      "Docker",
    ],
    contributions: [
      "Built the customer-facing ordering experience with a type-safe tRPC API layer between frontend and backend.",
      "Integrated Razorpay UPI payments to support smoother checkout and order confirmation.",
      "Implemented the admin dashboard workflow for status transitions from Pending to Confirmed, Ready, and Completed.",
      "Structured data access with Drizzle ORM and containerized the project for easier local setup and deployment consistency.",
    ],
    links: [],
    featured: true,
  },
];

export const socialLinks = [
  {
    label: "Email",
    href: "mailto:amar.kumar.career@gmail.com",
    display: "amar.kumar.career@gmail.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/Amarkumar30",
    display: "github.com/Amarkumar30",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/amar-kumar-745288289",
    display: "linkedin.com/in/amar-kumar-745288289",
  },
];

export const siteContent = {
  name: "Amar Kumar",
  tagline:
    "Computer Science undergraduate building reliable full-stack products and studying GEO in the age of LLM search.",
  intro:
    "I’m a Computer Science & Engineering undergraduate at South Asian University, Delhi, focused on shipping production-minded software and earning SDE opportunities at product companies and GCCs. My work sits at the intersection of full-stack engineering, developer-friendly systems, and research into how brands surface in AI-driven search experiences.",
  about:
    "My engineering journey has been shaped by curiosity, competitions, and the habit of turning ideas into working systems. Right now, I’m balancing Generative Engine Optimization research as a Research Intern at SAU with hands-on full-stack builds, hackathons, and steady SDE preparation centered on problem solving, system thinking, and execution speed.",
  personalNote:
    "I’m especially motivated by projects that turn messy real-world workflows into simple, dependable user experiences. That same instinct keeps me excited about building software: I like work that blends technical depth with clarity, usefulness, and momentum.",
  youtubeNote:
    "Alongside engineering work, I run Signal Clear, a YouTube channel that helps me practice communication, structured thinking, and content creation around ideas I care about.",
  education:
    "B.Tech in Computer Science & Engineering, South Asian University, Delhi, 2024-2028",
  currentFocus: [
    "Researching Generative Engine Optimization and how visibility shifts across LLM-driven answer engines.",
    "Preparing for SDE internships and full-time roles through off-campus applications, hackathons, and coding practice.",
    "Exploring the long-term path toward a GEO-focused startup for Indian brands.",
  ],
  achievements: [
    "1st Prize, AvishkarX - CSI x SAU Ideathon",
    "Consistent DSA practice across LeetCode and Codeforces with current focus on graphs, trees, dynamic programming, and arrays.",
  ],
  contactNote:
    "I’m especially interested in internship opportunities, product engineering teams that value ownership, and conversations around GEO, startups, or developer-focused products.",
};
