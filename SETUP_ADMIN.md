# Setting up the admin

This takes about 10 minutes. When you're done, you'll be able to log in at `https://www.amarkumar.dev/admin/login`, write something, and see it live on the site a minute or two later.

You need: access to GitHub as `Amarkumar30`, access to the Vercel project, and Node.js on your computer.

> The admin only works on the live site once this code is on `main` and deployed.

---

## 1. Create a GitHub token (repository-scoped)

This token lets the site commit content to **this one repository only**.

1. Open GitHub → your avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `amarkumar.dev admin`
3. **Expiration:** pick a date, for example 90 days or 1 year. Add a calendar reminder to rotate it.
4. **Resource owner:** `Amarkumar30`
5. **Repository access:** **Only select repositories** → `Amarkumar30/portfolio_`
6. **Permissions** → **Repository permissions** → **Contents:** **Read and write**. Leave everything else as it is. GitHub adds "Metadata: Read-only" automatically.
7. Click **Generate token** and copy it (it starts with `github_pat_`). GitHub shows it only once.

If `main` has branch protection that blocks direct pushes, the admin can't commit. Either allow it, or point `GITHUB_BRANCH` at a branch that auto-merges.

## 2. Choose a password and generate its hash

Pick a long password (at least 12 characters; a passphrase is fine). In the project folder, run:

```bash
node scripts/hash-password.mjs "your long password here"
```

It prints two lines. For Vercel, use the first one (the plain `$2b$12$…` value). The password itself is never stored anywhere; only this hash is.

Then generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

If your shell saves history, clear the hash command from it afterwards.

## 3. Add the environment variables in Vercel

Go to Vercel → **portfolio project** → **Settings** → **Environment Variables**. Add each of these and tick **Production** and **Preview**:

| Name | Value |
| --- | --- |
| `ADMIN_USERNAME` | a username you choose |
| `ADMIN_PASSWORD_HASH` | the `$2b$12$…` hash from step 2 |
| `ADMIN_SESSION_SECRET` | the random secret from step 2 |
| `GITHUB_TOKEN` | the `github_pat_…` token from step 1 |
| `GITHUB_OWNER` | `Amarkumar30` |
| `GITHUB_REPO` | `portfolio_` |
| `GITHUB_BRANCH` | `main` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.amarkumar.dev` |

If they aren't set already, also add the contact form variables: `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.

**About Preview:** with `GITHUB_BRANCH=main`, publishing from a preview deployment still commits to `main` and updates the live site. If you'd rather test on previews without touching the live site, set `GITHUB_BRANCH` to another branch (for example `revamp`) for the **Preview** environment only.

Then redeploy so the variables take effect: **Deployments** → latest production deployment → **⋯** → **Redeploy**.

## 4. Publish a test note

1. Open `https://www.amarkumar.dev/admin/login` and log in.
2. Click **New**, choose **Notes**, give it a title (for example "Testing the admin"), and write a line in the body.
3. Click **Publish**. You should see *"Published — live in ~1–2 min"* and a link.
4. On GitHub you'll see a new commit, `content(notes): publish "Testing the admin"`. In Vercel, a deploy starts.
5. Once that deploy finishes, open `https://www.amarkumar.dev/notes`. The note is there.
6. Back in `/admin`, click **Delete** on the test note (or **Unpublish** to keep it as a draft).

After you've logged in once, a small **Admin** link appears in the footer — only in your browser.

---

## Using the admin locally

You don't need a GitHub token to try the admin on your machine.

1. Create `.env.local` with `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`. Use the **second** line printed by the hash script (the one with `\$`), because Next.js would otherwise read `$2b` as a variable.
2. Leave `GITHUB_TOKEN` empty and run `npm run dev`.
3. At `http://localhost:3000/admin/login`, anything you publish is written straight into `content/` and `public/uploads/`. Review it with `git diff` and commit it yourself.

## Changing things later

- **New password:** run the hash script again, update `ADMIN_PASSWORD_HASH` in Vercel, then redeploy.
- **Log out everywhere:** change `ADMIN_SESSION_SECRET` (or `ADMIN_USERNAME`) and redeploy. Every existing session stops working.
- **Token expired or leaked:** revoke it on GitHub, create a new one (step 1), update `GITHUB_TOKEN`, then redeploy.

## Troubleshooting

| What you see | Likely cause |
| --- | --- |
| "Admin login isn't configured on this deployment" | One of `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` or `ADMIN_SESSION_SECRET` is missing, or the secret is under 32 characters. Redeploy after adding them. |
| "Invalid credentials" with the right password | The hash doesn't match the password. Regenerate it and paste the full value. |
| "Too many attempts" | 5 wrong passwords in 15 minutes. Wait, or redeploy to reset. |
| "Publishing isn't configured" | `GITHUB_TOKEN` isn't set for this environment. |
| "Something went wrong while talking to GitHub" | The token expired, doesn't include this repository, lacks Contents: read & write, or `main` is protected. Check the Vercel function logs. |
| Published, but the site hasn't changed | Wait for the Vercel deploy to finish. Check that the GitHub integration is connected and that the deploy didn't fail. |
| An uploaded image is broken in the editor preview | Expected: new images exist only after the next deploy. |

---

## Private planner (/future)

`/future` is a private planner for exams, quizzes, interviews and plans. Only you can see it: without an admin session it's an ordinary 404. Events are kept in an Upstash Redis database, never in this repository, because the repository is public. Changes save instantly, with no commit or redeploy.

Until Redis is connected, `/future` shows "Storage isn't set up yet" after you log in. Setup takes about 5 minutes on Upstash's free tier, with no credit card.

1. Open Vercel → your **portfolio** project → **Storage** tab → **Create Database**. (Or go to **Marketplace** and search **Upstash**.)
2. Choose **Upstash for Redis** → **Continue**. Pick the **Free** plan and a primary region near your Vercel functions. They run in Washington D.C. (`iad1`) unless you've changed it, so choose **US East**.
3. Name it, for example `portfolio-future`, then **Create**.
4. On the **Connect Project** screen, choose this project and tick **Production** and **Preview** (Development is optional). Leave the environment variable prefix empty.
5. Check **Settings → Environment Variables**. You should see `KV_REST_API_URL` and `KV_REST_API_TOKEN`; some versions of the integration add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` instead. Either pair works. If you set a prefix in step 4, the names will start with it and won't be found: remove the connection and connect again without a prefix.
6. Redeploy: **Deployments** → latest production deployment → **⋯** → **Redeploy**.
7. Log in at `/admin/login`. The dashboard now has a **Future** card; open it, or go to `/future` directly.

**Preview deployments** use the same database as production when Preview is ticked, so they show your real events (still only after you log in).

**Backups:** **Export JSON** at the bottom of `/future` downloads every event. **Import JSON** loads such a file back: events are added, ones with the same id are replaced, and nothing else is deleted. The file is checked in full before anything is saved. Use it to move to another database, or to keep a copy.

**Locally:** without the Redis variables, `npm run dev` keeps events in `.data/future.json`. That folder is git-ignored and is never committed. To use the real database locally instead, copy the two variables into `.env.local`.

| What you see | Likely cause |
| --- | --- |
| `/future` is a 404 | You're not logged in, or the session expired. Log in at `/admin/login` first. |
| "Storage isn't set up yet" | The Redis variables aren't set for this environment, or you haven't redeployed since adding them. |
| "Couldn't reach storage" | Upstash is unreachable or the token was rotated. Check the database in Vercel → Storage, and the function logs. |
