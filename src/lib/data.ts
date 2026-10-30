export interface SkillCategory {
  title: string;
  items: string[];
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

// TODO(amar): add the Signal Clear channel URL so it can be linked from About and socialLinks.
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
