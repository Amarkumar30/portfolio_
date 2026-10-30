export interface SkillCategory {
  title: string;
  items: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  role: string;
  collaborationNote?: string;
  built: string[];
  hardPart: string;
  next: string;
  stack: string[];
  image?: { src: string; alt: string };
  links: ProjectLink[];
  featured: boolean;
}

export const contactEmail = "amar.kumar.career@gmail.com";

export const siteContent = {
  name: "Amar Kumar",
  role: "Software Engineer",
  availability: "Open to SDE internships & roles",
  tagline:
    "Software engineer building full-stack products — and researching how brands get found when AI answers the question.",
  intro: [
    "I study Computer Science at South Asian University in Delhi and work as a research intern on Generative Engine Optimization.",
    "I build web products end to end, from the database schema to the last button. In research, I study how brands show up inside ChatGPT, Perplexity and Gemini — and why some never do.",
  ],
  footerLine:
    "Software engineer in Delhi. Building full-stack products and researching how brands get found in AI answers.",
  education: "B.Tech, Computer Science & Engineering · South Asian University, Delhi · 2024–2028",
  achievements: ["1st Prize, AvishkarX — CSI × SAU Ideathon"],
};

export const buildingToward = {
  title: "What I'm building toward",
  items: [
    {
      label: "Engineering",
      title: "Reliable full-stack systems",
      body: "I like turning messy workflows into simple products: clear data models, typed APIs, auth that holds up, and real-time updates where people actually need them.",
    },
    {
      label: "Research",
      title: "How brands get found by AI",
      body: "At SAU I research Generative Engine Optimization. I'm developing Hinglish-GEO-Bench, which tests whether an LLM's brand recommendation shifts when the same question is asked in Hinglish, and the Indian Brand Visibility Score (IBVS), a measurable score for a brand's presence in generative answers.",
    },
    {
      label: "Building",
      title: "A GEO company for Indian brands",
      body: "The long-term plan is a startup that helps Indian brands see and improve how they appear in AI answers. Research first, then a product that follows the evidence.",
    },
  ],
  closing:
    "Most tools for AI search are being built for English-first markets. I'd like to build some from India, for the way India actually searches.",
};

export const aboutStory = {
  title: "Engineer, researcher, and slowly, a founder.",
  paragraphs: [
    "I like turning messy workflows into simple products. A hostel's complaint process, a juice bar's order queue: the hard part is rarely the code. It's understanding how people actually work, then building something they don't have to think about.",
    "My research started with something small. My roommate bought a water purifier by asking ChatGPT one question. He never opened a website. The brand that won that sale didn't win it on Google, and I wanted to know why the model picked it. That question became my research internship at SAU on Generative Engine Optimization.",
    "To me, engineering, research and business are one track. Research tells me what's true about how AI answers are formed. Engineering is how I measure it at scale — query pipelines, evaluation harnesses, scoring. And the business question is right there: if customers ask AI before they ask Google, brands need to know whether they exist in that answer. That's the company I want to build one day, for Indian brands first.",
    "I also run a YouTube channel, Signal Clear. It's my practice in explaining ideas clearly, which turns out to be most of engineering and nearly all of research.",
  ],
  teamNote:
    "Right now I want to join a team that ships real products and cares how they're built — where I can own features end to end, get honest code review, and learn from engineers better than me.",
};

export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "C++", "SQL"],
  },
  {
    title: "Frameworks",
    items: ["React", "Node.js", "Express", "NestJS", "tRPC"],
  },
  {
    title: "Backend",
    items: ["REST APIs", "JWT authentication", "Role-based access control", "Socket.IO"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MySQL", "Prisma", "Drizzle ORM"],
  },
  {
    title: "AI",
    items: ["RAG pipelines", "LLM integration (Gemini API)", "GEO research"],
  },
  {
    title: "Tools",
    items: ["Git & GitHub", "Docker (basic)", "Vercel", "Render"],
  },
];

export const familiarWith = ["Redis", "pgvector", "advanced Socket.IO patterns"];

export const contactContent = {
  title: "Let's talk.",
  intro:
    "If you're hiring for an SDE internship or role, working on AI search or GEO, building a startup, or want to collaborate on research, I'd like to hear from you.",
  topics: [
    "SDE internships and full-time roles",
    "GEO, AI search and brand visibility",
    "Early-stage startups and product ideas",
    "Research collaborations",
  ],
  note: "Email is the quickest way to reach me.",
};

// TODO(amar): add GitHub/demo links and a screenshot (image: { src, alt }) for each project.
export const projects: Project[] = [
  {
    slug: "hostel-management-platform",
    title: "Hostel Management Platform",
    summary:
      "One place for hostel room allocation, complaints and policy questions — with live complaint updates and an assistant that answers from the hostel's own rules.",
    problem:
      "Hostel operations usually run on spreadsheets, group chats and manual approvals. Students can't see where their complaint stands, and wardens answer the same policy questions again and again.",
    role: "Team project at SmartHack. I worked across the stack, mostly on authentication, the REST APIs and real-time complaint updates.",
    collaborationNote:
      "Built as a team at SmartHack. Ownership was split across the team; this page describes my part.",
    built: [
      "Role-based access for three kinds of users — students, wardens and admins — each with their own flows.",
      "JWT authentication with refresh tokens, and 10+ REST endpoints for room allocation and complaint management.",
      "Real-time complaint notifications over Socket.IO, so status changes reach students without a refresh.",
      "Contributed to a RAG chatbot (Gemini + pgvector) that answers hostel policy questions from a PostgreSQL knowledge base.",
      "Supported an anonymous complaint flow that keeps the student's identity hidden.",
    ],
    // TODO(amar): confirm this was the hardest part for you, or replace it.
    hardPart:
      "Anonymous complaints that still need follow-up. Wardens shouldn't see who filed a complaint, but the system still has to route updates back to the right student. Storing a salted hash of the identity, instead of the identity itself, made both possible.",
    // TODO(amar): confirm or replace with what you would actually do next.
    next: "Add an audit log for warden actions, and test the chatbot against a fixed set of policy questions before trusting it with more.",
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
    links: [],
    featured: true,
  },
  {
    slug: "freshsip-ordering-platform",
    title: "FreshSip",
    summary:
      "Online ordering for a local juice bar: customers order and pay by UPI, and staff track every order on a live dashboard.",
    problem:
      "At a busy counter, orders come in by phone and in person, and payments are confirmed by glancing at a phone screen. Orders get missed and nobody knows what's ready.",
    // TODO(amar): confirm whether FreshSip was solo or a team project.
    role: "I built the ordering flow, the payment integration and the admin dashboard.",
    built: [
      "Customer ordering flow with a type-safe tRPC API between the React frontend and the Express backend.",
      "Razorpay UPI checkout, so an order is confirmed only after payment.",
      "A real-time admin dashboard that moves orders through Pending → Confirmed → Ready → Completed.",
      "MySQL with Drizzle ORM for data access, and Docker for a consistent local setup.",
    ],
    // TODO(amar): confirm this was the hardest part for you, or replace it.
    hardPart:
      "Keeping payment state and order state in agreement. An order should only reach the counter once the UPI payment is confirmed, and the dashboard has to show status changes the moment they happen.",
    // TODO(amar): confirm or replace with what you would actually do next.
    next: "Handle payment webhooks with idempotency checks, and give the owner a simple daily sales summary.",
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
    links: [],
    featured: true,
  },
];

export const socialLinks = [
  {
    label: "Email",
    href: `mailto:${contactEmail}`,
    display: contactEmail,
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
