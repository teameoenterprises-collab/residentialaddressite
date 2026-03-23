# CLAUDE.md — The Residential Address: Complete Shared Brain
> Definitive reference for both Cowork (Claude Desktop) and Claude Code (Antigravity IDE).
> Both environments read this file. Update it whenever anything changes.
> **Last updated: 2026-03-23** — full rewrite after deep repo scan by Claude Code.

---

## The Business

**Company:** The Residential Address (Everest Ventures Group LLC, registered in Florida)
**Founder:** Tahmid (teameoenterprises@gmail.com | tahmid20@gmail.com)
**Website:** https://theresidentialaddress.com
**GitHub:** https://github.com/teameoenterprises-collab/theresidentialaddress
**GitHub Account:** teameoenterprises-collab
**Hosting:** Vercel (auto-deploys on every push to `main`)
**Stack:** Custom HTML/JS, no framework, deployed as static site

**One-line pitch:** A US residential address + lease agreement + utility bills for non-US founders, so they can pass KYC at US banks (Mercury, Stripe, Capital One, Alliant) and payment processors.

**Core problem solved:** Virtual mailboxes are flagged as CMRA in the USPS database — banks auto-reject them. A real residential lease passes every KYC check.

**Pricing:** $79/month billed annually ($948 upfront). No setup fee. Money-back guarantee.

**Additional services:**
- LLC Formation
- ITIN Application ($400)
- Bank Assistance
- US Phone (eSIM) — $500

**Primary CTAs:** WhatsApp (+16474367072) and Telegram
**Current status:** Pre-revenue, website live, 20+ early social proof founders listed

---

## Target Audience

Non-US founders primarily in:
- 🇳🇬 Nigeria, 🇮🇳 India, 🇵🇰 Pakistan, 🇧🇩 Bangladesh
- 🇵🇭 Philippines, 🇰🇪 Kenya, 🇬🇭 Ghana
- 🇦🇪 UAE, 🇲🇾 Malaysia, 🇫🇷 France, 🇩🇪 Germany, 🇹🇷 Turkey, 🇪🇬 Egypt
- 40+ countries total

**Their pain:** Can't open Mercury, Stripe, Capital One because they don't have a US residential address.

---

## The Website — Full File Structure

**Repo root:** `https://github.com/teameoenterprises-collab/theresidentialaddress`
**Local working copy (Mac):** `/Users/tahmidnur/.gemini/antigravity/scratch/theresidentialaddress`
**Second clone (for Claude Code):** `/Users/tahmidnur/theresidentialaddress`

### Core pages (root level)
| File | URL | Purpose |
|------|-----|---------|
| `index.html` | `/` | Homepage / main landing page |
| `us-address-service.html` | `/us-address-service` | US Residential Address service page |
| `llc-formation.html` | `/llc-formation` | LLC Formation service page |
| `itin-application.html` | `/itin-application` | ITIN Application service page |
| `bank-assistance.html` | `/bank-assistance` | Bank Account Assistance page |
| `us-phone.html` | `/us-phone` | US Phone (eSIM) service page |
| `about.html` | `/about` | About page |
| `blog.html` | `/blog.html` | Redirects to `/blog/` (legacy, kept for backward compat) |
| `privacy.html` | `/privacy` | Privacy Policy |
| `style.css` | — | Global stylesheet (dark theme, gold accents, Inter font) |

### Blog infrastructure (created 2026-03-23)
| File | URL | Purpose |
|------|-----|---------|
| `blog/index.html` | `/blog` | Blog index — fetches and renders posts from blogs.json |
| `blog/blogs.json` | — | **Post index** — the source of truth for all blog posts |
| `blog/blog-template.html` | — | Template for the Content Agent to clone when writing new posts |
| `blog/posts/why-virtual-mailboxes-cause-bank-rejections.html` | `/blog/posts/why-virtual-mailboxes-cause-bank-rejections` | Post 1 |
| `blog/posts/wyoming-vs-delaware-llc.html` | `/blog/posts/wyoming-vs-delaware-llc` | Post 2 |

### Other folders
| Folder | Purpose |
|--------|---------|
| `assets/` | Images, logo, etc. |
| `agents/gravity-claw/` | The multi-agent Telegram bot system (TypeScript, Gemini) |
| `PrimesPortal/` | Unrelated side project (primecircle.html) |
| `residentalPortal/` | Customer portal (unfinished — Supabase schema, basic HTML) |
| `antigravity_browser/` | Chrome profile data (ignore) |
| `antigravity_system/` | Antigravity IDE internal workspace files (ignore) |

### SEO assets (created 2026-03-23)
- `sitemap.xml` — covers all core pages + blog posts
- `robots.txt` — allows all crawlers, blocks `/PrimesPortal/`, `/residentalPortal/`, `/agents/`, `/antigravity_browser/`, `/antigravity_system/`

---

## Blog System — How It Works

**The Content Agent workflow:**
1. Write a new post as an HTML file using `blog/blog-template.html` as the base
2. Save it to `blog/posts/{slug}.html`
3. Add an entry to `blog/blogs.json` with: title, slug, date, excerpt, category, country_tag, bank_tag, emoji
4. `git push origin main` → Vercel auto-deploys → post is live

**blogs.json schema:**
```json
{
  "posts": [
    {
      "title": "Post Title Here",
      "slug": "url-slug-no-spaces",
      "date": "YYYY-MM-DD",
      "excerpt": "150-char summary shown on blog index and homepage",
      "category": "Banking Compliance",
      "country_tag": "nigeria,india",
      "bank_tag": "mercury,stripe",
      "emoji": "🏦"
    }
  ]
}
```

**blog-template.html placeholders** (replace these when writing a new post):
- `{{POST_TITLE}}` — full post title
- `{{POST_SLUG}}` — URL slug (must match filename)
- `{{POST_EXCERPT}}` — meta description + card excerpt
- `{{POST_DATE}}` — ISO date (YYYY-MM-DD)
- `{{POST_DATE_FORMATTED}}` — Human readable (e.g. "Mar 23, 2026")
- `{{POST_CATEGORY}}` — Category tag (e.g. "Banking Compliance")
- `{{POST_EMOJI}}` — Hero emoji (e.g. "🏦 ❌ 📬")
- `{{POST_CONTENT}}` — Full HTML article body

**Paths inside blog posts** (`blog/posts/*.html`):
- CSS: `../../style.css`
- Logo: `../../assets/logo.png`
- Blog index link: `../index.html`
- Homepage links: `../../index.html`

---

## The Agent Fleet — Gravity Claw

**System name:** Gravity Claw
**Location:** `agents/gravity-claw/` in this repo
**Technology:** TypeScript, grammy (Telegram), Google Gemini API
**Running location:** Locally on Tahmid's Mac (NOT a separate VPS — deploy.ts and backup.ts both use Mac-specific paths)

**LLM used:** Google Gemini (via `@google/genai` — NOT Anthropic Claude)

### The 5 Active Bots

| Bot Name | Role | Telegram Token Var | MCP Filesystem? |
|----------|------|-------------------|-----------------|
| **Max** | Chief AI Officer / Orchestrator | `TELEGRAM_BOT_TOKEN` | ✅ Yes |
| **Asan** | Head of R&D (lead scraping, Reddit research) | `TELEGRAM_ASAN_TOKEN` | ❌ No |
| **MarkBTM** | Head of Sales (Reddit outreach, DMs) | `TELEGRAM_MARK_BTM_TOKEN` | ❌ No |
| **Vikas** | Head of Marketing (ad creative, strategy) | `TELEGRAM_VIKAS_TOKEN` | ❌ No |
| **Ahmad** | Head of Operations (SOPs, onboarding) | `TELEGRAM_AHMAD_TOKEN` | ❌ No |

### Gravity Claw Architecture

```
Telegram messages
       ↓
grammy bot listener (per bot)
       ↓
Authorization check (AUTHORIZED_TELEGRAM_USER_ID)
       ↓
Group chat routing (name/mention-based focus state)
       ↓
processAgentMessage() [loop.ts]
       ↓
Gemini API + tool calls (iterative, max 15 iterations)
       ↓
Tools: filesystem (Max), RubeMCP (all), StitchMCP (all),
       generate_image, generate_pdf, get_time,
       remember_fact, search_memory, deploy_website
       ↓
SQLite memory (gravity_claw.db) — FTS5 full-text search
       ↓
Chat history saved to SQLite (survives restarts)
       ↓
Reply via Telegram (text or PDF/image if long)
```

### MCP Servers in Use

| MCP | Config | Purpose |
|-----|--------|---------|
| `filesystem` | `@modelcontextprotocol/server-filesystem` pointing to website root | Max edits website files |
| `StitchMCP` | `https://stitch.googleapis.com/mcp` (Google) | Google services integration |
| `RubeMCP` | `https://rube.app/mcp` | Reddit API + Airtable |

**Website root path (for Max's filesystem MCP):**
`/Users/tahmidnur/.gemini/antigravity/scratch/theresidentialaddress`

### Gravity Claw Tools

| Tool | Agent(s) | Purpose |
|------|---------|---------|
| `filesystem__read_text_file` / `filesystem__edit_file` | Max | Edit website HTML/CSS |
| `deploy_website` | Max | `git add -A && git commit && git push origin main` → triggers Vercel |
| `RubeMCP__search_posts` / `RubeMCP__search_comments` | Asan, MarkBTM | Reddit lead discovery |
| `RubeMCP__list_records` / `RubeMCP__create_record` | Asan, MarkBTM | Airtable CRUD |
| `RubeMCP__reddit_submit_comment` / `RubeMCP__reddit_submit_message` | MarkBTM | Post comments, send DMs |
| `generate_image` | Vikas | Generate marketing images |
| `generate_pdf` | All | Convert markdown/text to PDF for Telegram |
| `remember_fact` / `search_memory` | All | SQLite memory CRUD |
| `get_time` | All | Current timestamp |

### Memory System
- **Engine:** SQLite (`gravity_claw.db`) with FTS5 virtual table
- **Chat history:** Per-bot per-chat, max 20 turns rolling window, survives restarts
- **Memory search:** 4-strategy cascade: FTS5 exact → FTS5 OR → LIKE fallback → recency fallback
- **Categories:** `personal`, `business`, `hq`, `preferences`

### Auto-Backup
- Every 15 minutes (dev mode), rsync to:
  `~/Library/CloudStorage/GoogleDrive-teameoenterprises@gmail.com/My Drive/GravityClaw_Backup`
- Excludes: `node_modules`, `.git`

### How to Start Gravity Claw
```bash
cd /Users/tahmidnur/.gemini/antigravity/scratch/theresidentialaddress/agents/gravity-claw
# dev mode (auto-reload):
npm run dev
# production:
npm start
```

**Required .env vars:**
```
GEMINI_API_KEY=
TELEGRAM_BOT_TOKEN=          # Max
TELEGRAM_ASAN_TOKEN=         # Asan
TELEGRAM_MARK_BTM_TOKEN=     # MarkBTM
TELEGRAM_VIKAS_TOKEN=        # Vikas
TELEGRAM_AHMAD_TOKEN=        # Ahmad
AUTHORIZED_TELEGRAM_USER_ID= # Tahmid's Telegram numeric user ID
NODE_ENV=production           # Set this on Hostinger VPS to disable local backup
```

---

## Integrations — Connection Status

| Integration | Purpose | Status | Details |
|-------------|---------|--------|---------|
| **GitHub** | Website code + CI/CD | ✅ Active | `teameoenterprises-collab/theresidentialaddress` |
| **Vercel** | Auto-deploy from GitHub main | ✅ Active | Live at theresidentialaddress.com |
| **Telegram** | All 5 bots (Max, Asan, MarkBTM, Vikas, Ahmad) | ✅ Active | grammy polling |
| **Google Gemini API** | LLM for all bots | ✅ Active | Tahmid has Google Advanced (2TB) plan |
| **RubeMCP** | Reddit + Airtable via MCP | ✅ Connected | rube.app/mcp |
| **Airtable** | CRM — Reddit Leads table | ✅ Active | Base ID: `app4v0TIpyA6zMZCh`, Table: `Reddit Leads` |
| **WhatsApp** | CTA on website | ✅ Active | +16474367072 |
| **StitchMCP** | Google services via MCP | ✅ Connected | stitch.googleapis.com |
| **Google Drive** | Auto-backup of workspace | ✅ Active | teameoenterprises@gmail.com drive |
| **Make.com** | Automation bridge | 🔲 TODO | Not yet set up |
| **Meta (Facebook/Instagram)** | Paid ads | 🔲 TODO | Not yet running |
| **Substack** | Newsletter | 🔲 TODO | Not yet set up |
| **ManyChat** | Comment-to-DM automation | 🔲 TODO | Not yet set up |

---

## The Content Flywheel

**One pillar post → 15-20 content pieces**

```
SEO Research → finds keyword (40 countries × 4-5 banks = 150-200 articles)
        ↓
Long-form writer → 1500-2500 word pillar post
        ↓
Repurposing → 2 shorter SEO posts + 5 social captions + 3 UGC scripts + 1 email
        ↓
Content Agent commits HTML to /blog/posts/ + updates blogs.json
        ↓
git push → Vercel auto-deploys → live in ~30 seconds
```

**Top keyword clusters:**
- "US bank account for [country] founders"
- "why virtual mailbox gets rejected by [bank]"
- "CMRA flagged [bank] rejection"
- "US residential address for Stripe KYC"
- "[bank] non-US resident requirements"
- "how to open Mercury bank as foreigner"

---

## GitHub PAT — For Content Agent Auto-Commit

The Content Agent (Cowork) needs a GitHub Personal Access Token to push blog posts directly.

**Setup steps for Tahmid:**
1. Go to: GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `cowork-content-agent`
4. Expiration: 1 year (or no expiration)
5. Scopes: check **`repo`** (full repo access)
6. Click "Generate token" → copy it immediately
7. Store it in Cowork agent config so it can run:
   ```
   git clone https://{TOKEN}@github.com/teameoenterprises-collab/theresidentialaddress.git
   ```
   Or set it as a git credential helper.

**Status:** 🔲 TODO — Tahmid needs to generate this

---

## The Agent Stack — Full Roster

### Gravity Claw (Telegram, running locally)
| Agent | Name | Status | Role |
|-------|------|--------|------|
| Orchestrator | **Max** | ✅ EXISTS | Chief AI Officer — edits website, manages fleet |
| R&D Lead | **Asan** | ✅ EXISTS | Reddit lead scanning → Airtable |
| Sales Head | **MarkBTM** | ✅ EXISTS | Reddit outreach + DMs |
| Marketing Head | **Vikas** | ✅ EXISTS | Marketing creative + strategy |
| Ops Head | **Ahmad** | ✅ EXISTS | SOPs, onboarding |

### Cowork (Claude Desktop — Scheduled tasks)
| Agent | Name | Status | Role |
|-------|------|--------|------|
| Content Intelligence | (unnamed) | 🔲 BUILDING | Weekly "Steal Like an Artist" research |
| SEO + Blog Agent | **Rank** | 🔲 TODO | Writes posts, commits to GitHub (needs PAT) |
| Rex Orchestrator | **Rex** | 🔲 TODO | Daily morning briefing via Telegram |
| Ad Intelligence | **Scout** | 🔲 TODO | Meta ad performance monitoring |
| Competitor Intel | **Spy** | 🔲 TODO | Weekly competitor tracking |

### In-progress builds (Phase 2 from Gravity Claw task.md)
- YouTube transcript tool for Asan (native `tools/youtube.ts`)
- `antigravity_backlog.md` — Max logs complex engineering requests for Claude Code

---

## The Personalized Follow-up System

1. MarkBTM tags every lead: country, pain point, objection, buyer stage
2. Tags written to Airtable (`Reddit Leads` table, Base: `app4v0TIpyA6zMZCh`)
3. Chase (Follow-up Agent — TODO) reads tags → generates/selects matching content
4. Follow-up feels 1:1

Content library tagged by: country / bank / objection / buyer stage

---

## Digital Products (TODO)

**Ebook:** "The Non-US Founder's Complete US Business Setup Guide"
- Covers: LLC, address, banking, Stripe, ITIN, phone number
- Price: $27-47
- Purpose: Self-liquidating front-end offer — pays for Meta ads
- Funnel: Ebook buyers → upsell to $79/month address service
- Status: 🔲 TODO — Pen (Copy Agent) writes the content

---

## Key Business Context for All Agents

- Founder is Tahmid, based in Canada
- Business is pre-revenue — first priority is getting to first 10 paying customers
- $100k/month goal — requires ~1,000-1,300 customers at $79/month
- Main sales motion: Meta DM ads → MarkBTM closes in Telegram DMs
- Secondary: SEO organic → blog → WhatsApp/Telegram CTA
- **Voice/tone:** Direct, relatable, like a friend explaining a solution. Not salesy. Never corporate.
- Always lead with the CMRA pain point — it's the most specific and credible hook
- No Reddit outreach (Tahmid decided against it 2026-03-23)

---

## What Claude Code (Antigravity) Needs to Build Next

**DONE (2026-03-23):**
- ✅ Blog infrastructure (`/blog/`, `blogs.json`, `blog-template.html`, `blog-index.html`)
- ✅ Two existing posts migrated to `/blog/posts/`
- ✅ Homepage shows 3 latest posts from `blogs.json`
- ✅ OG meta tags + canonical on all pages
- ✅ `sitemap.xml` and `robots.txt`

**TODO — Priority order:**
1. **GitHub PAT** — Once Tahmid generates it, store in Cowork so Content Agent can auto-commit
2. **Vercel Analytics** — Add `<script>` tag from Vercel dashboard (privacy-friendly, free)
3. **Customer Portal** (`residentalPortal/`) — Basic Supabase schema exists, HTML scaffold exists, needs full build
4. **Max file map update** — Add `/blog/`, `blogs.json`, `sitemap.xml`, `robots.txt` to the `FILE_MAP` const in `agents/gravity-claw/src/agent/loop.ts` so Max knows about these new files
5. **Ebook landing page** — New page for the $27-47 ebook front-end offer
6. **Meta pixel** — Add to all pages once Meta ads are running

---

## Communication Bridge: Cowork ↔ Antigravity

**The bridge:** Airtable (shared data) + Make.com (TODO) + this CLAUDE.md file

- Gravity Claw bots read/write Airtable
- Cowork agents read/write Airtable (planned)
- Make.com will pipe events to Telegram (TODO)
- **CLAUDE.md** keeps both environments aligned — update this file on every major change and commit to GitHub

---

## Notes & Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-23 | No Reddit outreach | Tahmid decided against it |
| 2026-03-23 | Two Meta pages | Page 1: address service, Page 2: ebook |
| 2026-03-23 | Content flywheel approach | Long-form pillar → repurpose into all formats |
| 2026-03-23 | Personalized follow-ups | Each lead gets content matched to their country + pain point |
| 2026-03-23 | Airtable + Make as the bridge | Shared data layer between Cowork and Antigravity |
| 2026-03-23 | Blog uses blogs.json index | Content Agent just edits JSON + adds HTML file; no build step needed |
| 2026-03-23 | Gravity Claw runs on Mac | Not VPS — backup.ts and deploy paths confirm local Mac execution |
| 2026-03-23 | Gemini (not Claude) for bots | Tahmid has Google Advanced 2TB plan; Gravity Claw uses @google/genai |
