# Burleigh Wedding House — handoff from cloud session to VS Code

> **Read me first.** This file is the single source of truth for everything decided and built in the cloud Claude session. Pull this branch in VS Code, read this file, then `docs/TECHNICAL_PLAN.md`, and you'll be fully up to speed.

---

## Where this lives

- **GitHub repo:** `chrissydobbs/burleigh-wedding-house`
- **Branch:** `claude/bwh-technical-plan-ZbBqB` (do all work here for now, then merge to main when ready)
- **In VS Code:** open the repo, switch to that branch, `git pull`. Everything below is in it.

> ⚠️ **Heads up about "things everywhere":** the cloud session can't see what you've been building locally in VS Code. When you pull this branch in, compare with what you already had locally and merge thoughtfully. The cloud session's view of the repo is whatever's been committed to this branch — nothing more.

---

## Confirmed product direction (the most important thing)

After reviewing competitor audits (Easy Weddings, The Knot, Zola) and an AI-first "marketplace" concept ("Vow"), the founder **chose path 1**:

- **Keep Burleigh Wedding House as her own full-service wedding business.** She is the real celebrant, planner and stylist. The warmth and the fact that the planner is a real, present person is the whole moat.
- **Use AI as her behind-the-scenes assistant** (drafting vendor enquiries, smart checklists, RSVP chasing, quote normalisation, auto-seating, AI-drafted wedding website) **and as couple-facing magic** (the Style Consultation that turns a vision into a story and a mood).
- **The concierge is Chrissy.** AI never replaces her — it handles the admin so she can be present for the parts that matter.
- **We are explicitly NOT building a venture-scale vendor marketplace.**

This is locked into `docs/TECHNICAL_PLAN.md` §0 (Confirmed product direction).

---

## Monetisation (locked in)

Couples never pay for the emotional/free tier (Style Consultation, story, mood, basic checklist, basic budget, basic guest list, browsing the Collective, countdown).

Two warm routes to the paid planning suite (the founder chose **both**):

1. **Unlocked through her** — booking any service or even a free consultation/chat grants the full suite. Her real clients never see a price on a feature.
2. **A warm "Burleigh Bride" membership** — couples can join themselves at a transparent price, dressed up as being welcomed into her world. Personal welcome note from Chrissy when they do.

Architectures are identical (Stripe Billing + entitlements config the founder controls). What differs is the trigger and the presentation. **Never a "Subscribe Now" wall.**

Complementary revenue (per the plan): service payment plans, the $49 guide, Collective vendor listings, and a future candle/anniversary club (separate from the wedding journey).

---

## Stack (locked in)

- **Next.js 15** (App Router, TypeScript, Tailwind, shadcn/ui)
- **Supabase** (Postgres, Auth, Storage, Realtime, Edge Functions, pgvector)
- **Stripe** (Checkout, Billing, Customer Portal)
- **Anthropic Claude API** — default `claude-sonnet-4-20250514`, held in one config constant so upgrading to the latest Claude is a one-line change
- **Resend** (transactional) + **Loops** (marketing) — two-tool email choice confirmed
- **Netlify** (hosting; Netlify MCP wired up)
- **Integrated custom admin** — NOT a headless CMS. One system, one login, in-place page editing.

Full detail in `docs/TECHNICAL_PLAN.md` §2.

---

## Her copy and tone preferences (read before writing any couple-facing words)

- **First person from Chrissy**, warm and sincere. Like she's speaking to a friend over coffee.
- **No em dashes.** Use commas, semicolons, full stops, or parentheses. Em dashes read as AI-written.
- **Not markety, not generic.** Specific, heartfelt, personal.
- **No Burleigh Candle Co.** for now — removed from couple-facing copy until further notice.
- **Phrases that landed well:** "It starts with a conversation, not a contract." / "Let's do this together." / "Made with love on the east coast." / "You're in good hands. Chrissy x"
- **Avoid:** "AI", "magic", "story written just for you", "we" (use "I" — it's her), "Composing…", anything that sounds like a machine.

---

## How we're building from here (the discipline)

The founder asked to **slow down and build feature by feature** — one feature, designed and built properly on its own, finished and felt-right, before the next. Then stitch together at the end. The all-in-one prototype is just a sketch to work from, **not** the real thing.

**Current focus:** the **Your Wedding** couple dashboard (see brief below).

**Queued, in order to be picked by founder:**
- Home page (the front door, the brand voice)
- Style Consultation (the hero magic moment)
- Founder inbox (her daily home base, AI-drafted replies)
- Checklist tool
- Budget tool
- Guests + RSVP
- Seating plan
- Wedding website builder
- Request-a-quote
- Wedding-day live screen (run sheet + guest experience + photo upload)

---

## The Your Wedding brief (current feature)

**Purpose:** a couple's quiet planning home. Every time they open it, three feelings at once:
- **Calm and reassured** — "we don't have to figure this out alone."
- **Held and looked after** — "Chrissy has got us."
- **Excited and inspired** — "this is actually happening, and it's going to be beautiful."

**What's on it:**
- Their names (serif, generous), a gentle countdown, "Welcome back, [name]"
- A pulled-out story line in Chrissy's voice ("It will be heritage and timeless. A warm afternoon, golden light, candles by sundown, and just the two of you and the people you love.")
- A personal note from Chrissy with avatar, signature, a voice-note pill, and a soft "open the photographer shortlist" link
- A small 3–4 image inspiration strip (real photography over a gradient fallback)
- "Quiet doors" — small serif text links to checklist / budget / guests / seating / suppliers / wedding website (no big buttons; they're signposts)
- The warm "two ways in" invitation card (book a chat / explore Burleigh Bride)
- A soft signature footer: *You're in good hands. Chrissy x*

**What it isn't:**
- Booked / contacted / saved counts (that's Easy Weddings)
- Walls of stats or dashboards
- Anything that feels like work the moment you open it

**Current build:** `features/your-wedding/index.html` — a self-contained single HTML file, mobile-first, using Cormorant Garamond + Jost, palette of ivory / sage / gold / blush / charcoal. Gentle staggered fade-in on load.

---

## What's in the repo right now

| Path | What it is |
|---|---|
| `HANDOFF.md` | This file. |
| `docs/TECHNICAL_PLAN.md` | The full technical plan. §0 confirmed direction, §1 monetisation, §2 stack, §3 data model, §4 routes, §5 admin, §6 AI architecture, §7 phased build, §8 risks. |
| `prototype/index.html` | The all-in-one rough sketch — every view stitched together as in-page sections (home, consultation, results, dashboard, checklist, budget, guests, seating, request-a-quote, wedding website). Useful as a reference for the *feel*. **Not the real thing.** |
| `features/your-wedding/index.html` | The first feature built properly on its own — the couple dashboard. This is the new pattern: one file, focused, polished. |
| `netlify.toml` | Publishes `/prototype` as a static preview (when Netlify is happy). |

---

## Competitive context (reference only)

The founder uploaded two HTML documents from a separate Claude desktop session:
- `easyweddingsaudit.html` — an exhaustive feature audit of Easy Weddings, with The Knot and Zola comparison, AI opportunities mapped onto every feature, and a "what to steal" verdict.
- `vowmockups.html` — full mockups for an AI-first wedding marketplace ("Vow").

**These files live on her local machine, not in this repo.** They are reference for product thinking only. Path 1 (BWH personal brand + AI as her assistant) is the chosen direction; "Vow" is a different business we explicitly said no to.

**Best AI ideas to fold in** (always as Chrissy's assistant, in her voice, never as a faceless concierge):
- AI-drafted vendor enquiries that reference each vendor's specifics + the couple's must-haves.
- Smart, adaptive checklist that removes tasks once a category is booked and adds region-specific tasks (e.g., QLD vs TAS marriage cert).
- Budget benchmarked to real east-coast prices, with trade-off suggestions.
- Side-by-side quote normalisation when multiple vendors reply.
- Auto-seat from relationship/dietary/age constraints, refinable by chat.
- Wedding website drafted from the couple's existing answers (no blank template).
- RSVP chasing through the channel each guest prefers.

---

## Open questions / next things to decide

- Which feature to focus on next, once Your Wedding feels right.
- Domain registration (`burleighweddinghouse.com.au`) and DNS.
- Real photography library to replace Unsplash placeholders.
- When to set up Supabase project + Stripe account (Phase 0 prep).

---

## Session log (most recent first)

1. **Built `features/your-wedding/index.html`** — first feature properly on its own, hitting all three feelings.
2. **Reset to feature-by-feature discipline.** Founder said the all-in-one prototype had got sprawly. Picked Your Wedding first.
3. **Locked in path 1** (personal brand + AI as her assistant) after reviewing Easy Weddings audit + Vow mockups. Updated `TECHNICAL_PLAN.md` §0.
4. **Added wedding website builder** to prototype (drafts the couple's guest site from their details).
5. **Added guest list + RSVP, seating plan, request-a-quote, "invite your partner"** to prototype.
6. **Added budget tool + Your Team & Suppliers panel** to prototype dashboard.
7. **Added interactive timeline checklist** to prototype.
8. **Rewrote all prototype copy** in Chrissy's voice (no em dashes, no AI tone, removed Burleigh Candle Co.). Consolidated prototype into a single self-contained `index.html`.
9. **Built initial multi-page prototype** (home, services, collective, style consultation, your-wedding, shop).
10. **Wrote `docs/TECHNICAL_PLAN.md`** — stack, data model, routes, admin, AI architecture, phased build, risks.
11. **Confirmed monetisation** = both routes (relationship unlock + warm Burleigh Bride membership).
12. **Confirmed email** = Resend + Loops.
13. **Confirmed stack and architectural choices.**

---

## Starter prompt for Claude Code in VS Code

Paste this into Claude Code after pulling the branch:

> Read `HANDOFF.md` and `docs/TECHNICAL_PLAN.md` first. We are building Burleigh Wedding House feature by feature in the `features/` directory. The first feature, "Your Wedding" (couple dashboard), is at `features/your-wedding/index.html`. The discipline is: one feature, designed and polished on its own, before moving to the next.
>
> Keep Chrissy's voice in everything you write: first person, warm, sincere, no em dashes, no marketing tone, no candle business for now. The all-in-one `prototype/index.html` is the rough sketch we work from, not the real thing.
>
> Ask me before starting a new feature, and ask me before any large architectural decision.

---

*Last updated by cloud Claude session, 28 May 2026.*
