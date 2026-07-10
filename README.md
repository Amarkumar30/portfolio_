# Amar Kumar Portfolio & Blog

A polished personal portfolio and MDX-powered blog built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- MDX files stored locally in `content/blog`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

- `src/app`: routes, layout, API route
- `src/components/layout`: navbar, footer, theme handling
- `src/components/sections`: route-level reusable sections and cards
- `src/components/ui`: lower-level UI helpers
- `src/components/mdx`: custom MDX components
- `src/lib/data.ts`: editable portfolio data and seeded content
- `src/lib/blog.tsx`: blog loading and MDX compilation helpers
- `content/blog`: local MDX posts
- `public/resume.pdf`: resume download target

## Add a new blog post

1. Create a new file in `content/blog`, for example `my-new-post.mdx`.
2. Copy the frontmatter shape from `content/blog/geo-research-notes.mdx`.
3. Update `title`, `excerpt`, `date`, `tags`, and `category`.
4. Write MDX content below the frontmatter. You can use React components like `<Callout />`.
5. The `/blog` listing and the dynamic post route will include it automatically.

## Add a new project

1. Open `src/lib/data.ts`.
2. Add a new object to the `projects` array.
3. Fill in `slug`, `summary`, `problemStatement`, `stack`, `contributions`, placeholder media text, and links.
4. Set `featured: true` if you want the project preview to appear on the home page.

## Change the accent color or theme feel

1. Open `src/app/globals.css`.
2. Update the CSS variables in `:root` and `.dark`.
3. The main accent variables are `--accent`, `--accent-soft`, and `--accent-foreground`.
4. Background atmosphere and grid texture also live in `globals.css`.

## Setting up the contact form

The contact form is wired to `src/app/api/contact/route.ts` and sends email through Resend.

1. Create a free account at `resend.com` and generate an API key.
2. Copy `.env.local.example` to `.env.local`.
3. Fill in the values locally:

```bash
RESEND_API_KEY=your_key_here
CONTACT_TO_EMAIL=amar.kumar.career@gmail.com
CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>
```

4. Keep `.env.local` uncommitted. It is already covered by `.gitignore`.
5. For Vercel production deploys, open your Vercel project dashboard, go to `Settings -> Environment Variables`, and add the same keys there.
6. Redeploy after adding the production environment variables so the contact form can send from the deployed site.

## Resume placeholder

Place your real PDF resume at `public/resume.pdf`. A placeholder file is included so the download link resolves during development.

## Deploy to Vercel

1. Push the project to a Git repository.
2. Import the repository into Vercel.
3. Add any required environment variables in the Vercel project settings.
4. Deploy. The app is already structured for App Router hosting on Vercel.
