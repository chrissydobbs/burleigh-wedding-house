# Burleigh Wedding House — Technical Plan

## Context

BWH is a full-service luxury wedding platform (one site: burleighweddinghouse.com.au) run by a single non-technical founder who delivers the core services herself (celebrant, planner, stylist, candle maker). The platform must let her operate the whole business daily without a developer, give couples genuinely excellent free tools that convert them into service clients, and be architected so the full 18–24 month vision (voice notes, wedding-day app, living AI, native mobile) can layer on later **without rebuilding the foundation**.

**Three decisions confirmed with the founder:**
1. **Monetisation:** couple-facing tiers — Free (basic) / Tier 1 / Tier 2 — reached **two warm ways** (the founder chose both): unlocked free through any contact/booking with her, **and** a clearly-priced, beautifully-presented "Burleigh Bride" membership couples can join themselves. Neither hidden/"invisible" (sneaky) nor a cold "sign up and pay" SaaS wall (impersonal). She needs to make money; both routes do, while staying personal. Resolved in §1.
2. **Email:** two tools — Resend (transactional) + a marketing platform (Loops).
3. **Build pace:** Claude Code is the builder. Estimates are AI-paced; the real schedule constraint is founder content + external account setup + QA, not code generation.

Every decision below is checked against: *(a) can a solo dev build/maintain it, (b) can a non-technical founder operate it daily, (c) does it support the full vision without a rebuild.*

---

## 1. The central decision: how couples reach the paid tiers (read first)

Two constraints rule out the obvious models. The founder wants to earn from couples (tiers: Free / Tier 1 / Tier 2) — but **not hidden/"invisible" subscriptions** (sneaky) and **not the cold "sign up and give us your money" SaaS model** (impersonal). The brief adds: no pricing page in the nav, no mid-flow paywall, never feels sold to. **The founder chose both warm routes below — she needs to make money, and both do, while staying personal.**

- **Free tier is genuinely excellent**, never a crippled demo. Everything emotional and trust-building is free forever: the AI Style Consultation, Your Wedding Story, the moodboard, a smart checklist, a simple budget, a basic guest list, browsing the Collective/real weddings, the countdown. The magic is never gated.
- **Route 1 — unlocked through her (free, relationship-led).** Booking a BWH service, or even a free consultation/chat, grants the full experience. Her clients never see a price on a feature; they're welcomed into everything as part of the relationship.
- **Route 2 — a warm, named membership couples can join themselves.** A clearly-presented "Burleigh Bride" membership with an honest price and a join button — dressed as being welcomed into her world (her voice, a personal welcome note when someone joins), never a cold "subscribe" wall. This is how self-serve couples who never book her still become revenue.
- **Paid access gates power/convenience, never the magic** — full budget with benchmarks + payment schedules, guest manager (import/contact-collector/groups/messaging), seating chart, vendor manager + contract storage, digital invitations, the wedding website, registry, run sheet, day-of guest experience.

So money is neither hidden nor cold — it's **transparent and personal**, arriving two warm ways: opened freely through a real relationship, or joined openly via a beautifully-presented membership. Either way the founder's voice is on it; neither is a faceless machine charge.

**Architecturally this barely changes the build:** one entitlements system (Stripe Billing + `entitlements`/`plans` config the founder controls, §3) powers both routes. What changes is the *trigger* (relationship/consult, or a warm membership join — not a checkout-first funnel) and the *presentation* (an in-voice invitation + personal welcome, not a paywall). Same infrastructure, human experience.

**Complementary recurring revenue** (warm, not hidden): **service payment plans** (Stripe Billing instalments — feels like paying off a package with her), a **candle/anniversary club** (post-wedding product from Burleigh Candle Co. — never touches the wedding journey), and **Collective vendor membership tiers** (B2B, openly priced to vendors). White-label SaaS for other wedding pros is a possible future line — the data model leaves room; we don't build for it now.

---

## 2. Proposed stack (with honest tradeoffs)

Core stack is 5 tools; the founder's two-email choice makes Loops a deliberate 6th (flagged).

**1. Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui — framework & UI**
- *Why:* we need both a content/SEO marketing site (home, services, real weddings, guides — SEO is a named requirement) **and** a rich logged-in app (planning tools, admin). Next.js does both well: server components for SEO, route handlers for Stripe/webhooks, and the cleanest path to a future Expo/React Native app sharing TS types and the Supabase client (Phase 4, no rebuild). shadcn/ui is copy-in, fully ownable components — we can hit a luxury aesthetic with zero lock-in.
- *Tradeoff:* App Router has a learning curve. Astro would be better for pure content but weak for the heavy app side; Remix/React Router 7 is fine but smaller ecosystem. Next.js wins on covering both halves.

**2. Supabase — Postgres + Auth + Storage + Realtime + Edge Functions + pgvector**
- *Why:* one tool covers most of the backend. Postgres fits the relational data model perfectly. **Magic-link auth is exactly the "Your Wedding, no password ever" requirement.** Storage holds photos/contracts/voice notes. **Realtime is the killer feature for the wedding-day live run sheet and RSVP dashboard — built in, no extra tool.** Row Level Security keeps each couple's data isolated. pgvector is ready for Phase 4 AI personalisation. Low lock-in (standard Postgres).
- *Tradeoff:* RLS policies must be written and tested carefully (security-critical). Alternative (Clerk + Neon + S3) means 3 tools and glue code; Supabase consolidates.

**3. Stripe — Checkout + Billing + Customer Portal**
- *Why:* Checkout for one-off (candles, hire deposits, the $49 guide, service deposits); Billing for the couple membership tiers **and** service payment-plan instalments; Customer Portal for self-serve management. Transaction-based, no monthly fee. Webhooks → Next.js route → Supabase updates entitlements/orders.
- *Tradeoff:* **Stripe Connect** (paying Collective vendors / automated commission splits) carries heavy KYC complexity — **deferred**; start with affiliate links + manual commission tracking.

**4. Anthropic Claude API — all AI**
- *Why:* Style Consultation (hero), checklist/budget generation, enquiry triage + draft replies, content drafting, later contract extraction. Prompt caching on the large static "founder voice + BWH knowledge" context to cut cost; tool-use JSON for reliable structured outputs.
- *Model:* default to the brief's `claude-sonnet-4-20250514`, held in **one config constant** so upgrading to the latest Claude (4.x family) is a one-line change. Test the most capable current model specifically for the Style Consultation, since founder-voice quality is the make-or-break.

**5. Resend — transactional email** (magic links via Supabase custom SMTP, booking/order/RSVP confirmations, .ics attachments, instant $49 guide delivery). React Email templates reuse the site's design system.

**6. Loops — marketing email** (the list, journey automations tied to wedding milestones, abandoned-consultation nudges, seasonal campaigns, broadcasts). App emits events (`consultation_completed`, `wedding_date_set`) to drive flows; founder composes campaigns in a clean editor.
- *Honest note:* this is the one place we exceed the 5-tool discipline. Justified by the founder's explicit choice and because marketing automation is genuinely different from transactional. The lean alternative (defer Loops, use Resend Broadcasts) stays at 5 — fallback if we want a leaner launch.

**Hosting: Netlify** (recommended over Vercel) — the project already has a Netlify MCP connected, so Claude Code can manage deploys directly and the founder gets a simple dashboard; full Next.js support, env vars, branch deploys, wildcard subdomains for wedding sites. Vercel is the equally-valid alternative with the tightest Next.js integration; no lock-in either way.

**CMS decision (brief asked me to evaluate): integrated custom admin, NOT a headless CMS.**
The founder needs **one place** for content *and* operations (enquiries, bookings, payments, run sheets). A headless CMS only does content — she'd still need a custom admin for operations, i.e. two systems and two logins, which fails the "one intuitive place" test. Content and operations are also intertwined (a real-wedding feature links to a booking; a Collective profile links to enquiries). Page text/images are handled by a small **content-blocks** system (editable in-place, no developer). Tradeoff: I build the admin CRUD myself — but with Next.js + Supabase + shadcn this is fast and gives an on-brand, Instagram-simple tool. *Fallback if admin build cost balloons:* Payload CMS embedded in Next.js (single codebase) — noted, not recommended first.

---

## 3. Data model (high level)

`wedding` is the hub; everything couple-facing hangs off it. Admin-managed content is global and referenced by couple features.

**Account & access**
- `users` (Supabase auth, magic link) · `weddings` (names, date, region, guest_count, budget_total, style_tags, status: lead→planning→booked→married, plan_tier) · `couple_members` (links partners to a wedding)
- `plans` + `entitlements` (config: which features each tier unlocks) · `subscriptions` (Stripe sub per wedding → drives entitlements; a service booking grants Tier 2)

**Planning tools** — `checklists`/`checklist_tasks` (group, due-offset, status, linked service/vendor, custom flag) · `budgets`/`budget_categories`/`budget_line_items` (estimate/quote/actual/payment_due) · `guests` + `guest_groups` · `tables` + seating assignments · `couple_vendors`/`vendor_payments`/`vendor_documents`/`vendor_messages` · `documents` · `notes` · `run_sheets`/`run_sheet_items` (audience-visibility flags, realtime)

**Vision & AI** — `style_consultations` (inputs + AI outputs) · `wedding_briefs` (versioned working doc) · `moodboards`/`moodboard_items` (refs to media) · `ai_generations` (audit log: model, tokens, latency, cost — built from day one)

**Guest experience** — `invitations`/`invitation_recipients` · `wedding_websites` (subdomain slug, sections, password, locale) · `guest_uploads` (day-of album)

**Commerce & CRM** — `enquiries` (source, type, ai_category, ai_draft_reply, status) · `quotes`/`bookings` (deposit, contract, status) · `consultation_bookings` (.ics) · `messages` (founder↔couple thread) · `voice_notes` (audio ref, prompt_reason, sent_at) · `orders`/`payments` · `registry`/`registry_items` (universal + cash fund + group gifting + thank-you tracker + commission) · `referrals`/`affiliate_clicks` (Block campaign attribution)

**Admin content (global)** — `services`/`service_packages` (+ pricing) · `products`/`product_variants`/`inventory` (candles, favours) · `hire_items`/`hire_availability` (date-based) · `collective_vendors` (editorial profile, gallery, endorsement, tags, listing_tier, listing subscription)/`vendor_applications` · `real_weddings` (editorial + SEO) · `guides` · `content_blocks` (editable page text/images) · `media` (BWH photography library, style-tagged — feeds moodboards & galleries)

Relationships: one `wedding` → many checklist tasks, budget items, guests, vendors, documents, a run sheet, invitations, a website, a registry, briefs, bookings, messages, voice notes, orders. Global content is referenced by couple features (Style Consultation pulls moodboard images from `media`; checklist tasks link to `services`/`collective_vendors`). `subscriptions` + `entitlements` gate tool access by tier. RLS isolates each wedding; admin role bypasses for the founder only.

---

## 4. Route / page architecture

**Public (SEO, server-rendered):** `/` · `/services` + `/services/[slug]` · `/collective` + `/collective/[vendor]` · `/real-weddings` + `/real-weddings/[slug]` · `/guides` + `/guides/[slug]` · `/shop` + `/shop/[product]` · `/hire` + `/hire/[item]` · `/guide` ($49 download) · `/about` · `/contact` · `/start` (AI Style Consultation — the hero entry) · `/book` (consultation booking)

**Wedding guest sites:** `names.burleighweddinghouse.com.au` → middleware rewrite to `/w/[slug]` (wildcard DNS).

**Auth:** magic-link flow only — no signup page; account self-creates on first save/email capture.

**"Your Wedding" (couple app, authed):** `/your-wedding` (dashboard: countdown, story, gentle next-steps) · `/checklist` · `/budget` · `/guests` · `/seating` · `/vendors` · `/invitations` · `/website` · `/registry` · `/run-sheet` · `/documents` · `/messages` · `/brief` · `/orders`. Below-tier features show a soft, in-voice upgrade invitation — never a paywall modal.

**Wedding-day public views (no login, tokenised URLs):** `/day/[token]` (guest experience: live timeline, photo upload, find-your-seat, message couple) · `/run/[token]?view=vendor|party` (run-sheet views).

**Admin (founder, authed + role):** `/admin` (dashboard) · `/enquiries` (inbox + AI drafts) · `/bookings` · `/weddings` · `/messages` + `/voice-notes` (record & send from mobile) · `/collective` (+ applications) · `/real-weddings` · `/guides` · `/services` · `/shop` · `/hire` · `/content` (in-place page editing) · `/media` · `/email` (campaigns via Loops) · `/registry` · `/analytics` · `/settings` (availability, plan-tier config). Admin is **mobile-first** — the founder runs it from an iPad/phone.

---

## 5. Admin structure — the "iPad with coffee" experience

The `/admin` dashboard is a daily action surface, plain language, big touch targets, one-tap actions:
1. **New enquiries** with an AI-drafted reply already written in her voice → read, tweak, approve/send.
2. **Human-moment prompts** — "Send a hello to [couple] — they finished their style consultation 14 hrs ago" → tap to **record a 30-sec voice note** (device mic → Supabase Storage) → send. ~90 seconds, done.
3. **Upcoming bookings & payments** due.
4. **This week** — simple revenue + enquiry summary.
5. **Today's wedding** (if any) — live run-sheet controls.

Content editing is **in-place** (open a page preview, tap text/image, edit, save) — not a form-field CMS. Adding a service, candle product, Collective vendor, or publishing a real-wedding feature are guided flows in plain English. Everything she does daily is reachable in one or two taps with no jargon.

---

## 6. AI feature architecture

**Shared pattern:** a server-side `lib/ai/` module wrapping the Anthropic SDK. One model constant. **Prompt caching** on a large static context block = founder-voice guide + BWH knowledge base (services, QLD/TAS rate ranges, regions, Collective vendors, style vocabulary). Each feature = cached context + feature instruction + wedding data. Outputs are **tool-use JSON** matching typed schemas so we store/render reliably. Every call logged to `ai_generations` (model, tokens, cost, latency). **Anything couple-facing-as-the-founder is human-in-the-loop** — AI drafts, founder approves; never auto-sent.

**Flows:**
1. **Style Consultation (hero):** free text (+ optional Web Speech voice → transcript, + ≤5 images) → email gate creates "Your Wedding" → Claude returns `{ wedding_story (founder voice), style_tags[], moodboard: media_ids[], recommended_services[] + rationale, collective_shortlist[] (3–5 + endorsement), suggested_next_step }`. **Moodboard images are selected from the tagged BWH `media` library — not generated — so it's always on-brand and owned.** Store on `style_consultations`; render results page + email (Resend); notify founder + emit Loops event; enqueue a voice-note prompt.
2. **Checklist generation:** date/region/guest_count/style/budget → grouped tasks with due-offsets + service/vendor links; regeneration merges without clobbering user customisations.
3. **Budget allocation:** total + region + guest_count → category allocations using a founder-editable rate table (kept in DB so it stays current) + benchmarks.
4. **Enquiry triage + draft reply:** inbound → categorise + draft in her voice referencing their details → founder approves → Resend.
5. **Content drafting:** real-wedding writeups, guides, Collective profiles → AI draft → founder edits → publish.
6. **Contract extraction (Phase 4):** uploaded PDF → Claude extracts key dates/payment milestones → populates `vendor_payments` + reminders. **Never trusted blindly — human verifies.**
7. **Personalisation (Phase 4):** pgvector embeddings improve recommendations as data accrues. Pipes (pgvector, `ai_generations`) run from day one.

---

## 7. Build sequence (AI-paced) + honest schedule

Because Claude Code builds it, **code generation is the fast part.** The real schedule is gated by: founder content (photography library, services, pricing, copy), external setup (Stripe, domain + wildcard DNS, Loops, legal/contract templates, calendar), browser QA of each flow, and founder training. Estimates below are "focused build blocks" (≈ a concentrated Claude Code session) plus the human dependency; calendar ranges assume part-time founder availability for content/review.

**Phase 0 — Foundations (the pipes).** Design system, core Supabase schema (wedding hub, magic-link auth, **entitlements/plans scaffold**, `media`, `ai_generations`, realtime, subdomain-rewrite middleware), admin shell, content-blocks, Netlify deploy. Everything later phases plug into. *~1 week of build blocks.*

**Phase 1 — Foundation / revenue from day one.** Marketing site (home/services/about/contact, editable); shop + hire (browse + enquiry) + $49 guide → Stripe Checkout + Resend delivery; enquiry capture + admin inbox with AI drafts; consultation booking + .ics; list capture → Loops + Block-campaign affiliate tracking; **basic AI Style Consultation + "Your Wedding" account + results email + founder voice-note prompt** (low-code, high-impact — worth doing early); Stripe Billing scaffolding with plans defined (Free active). → *credible, takes bookings + orders, builds list, runs the campaign.* **Build: ~2–3 weeks; calendar to launch ~6–10 weeks** once Stripe/legal/content/QA are factored.

**Phase 2 — The Planning Hub.** Full Your Wedding (smart checklist, budget, guest manager, seating, vendor manager, docs, notes); Wedding Brief; **tiers go live** (Stripe subscriptions + entitlement gating + service-booking auto-grants Tier 2 + warm membership join + soft contextual upgrades); service package builder → quote → deposit → contract → post-booking portal + messages. **Build: ~3–4 weeks.**

**Phase 3 — Full Experience.** Digital invitations + save-the-dates + physical referral; personal wedding websites (subdomains); gift registry (universal + cash + group + thank-you + commission); wedding-day realtime run sheet + guest experience + tokenised views; Collective fully live (profiles, applications, listing-fee subs); real-weddings editorial + guides + media at scale; Spotify + calendar export. **Build: ~4–6 weeks.**

**Phase 4 — Living Platform.** Voice notes + AI prompts everywhere; smart contract reading; Google/Outlook/Apple calendar + tasks + iCal feed; native mobile app (Expo, sharing types + Supabase); anniversary care + permanent archive; pgvector personalisation; white-label groundwork if pursued. **Ongoing.**

---

## 8. Risks, complexity, and simpler paths

**Flagged as genuinely complex / risky:**
- **Tier philosophy** — getting the "doesn't feel sold to" presentation right is the biggest product risk. Mitigation in §1: free tier stays excellent, magic never gated, clients get Tier 2 free, no pricing page in nav, warm membership + editorial upgrades only.
- **RLS / data isolation** — couples must never see each other's data; admin role separation must be tested hard. Security-critical.
- **Wedding-day realtime run sheet** — it's live at a real wedding on poor venue signal; needs robust offline/reconnect handling and real-device testing.
- **Subdomain wedding sites** — wildcard DNS + middleware rewrite; moderate, supported on Netlify/Vercel.
- **Contract extraction (P4)** — never trust blindly; always human-verify.
- **Web Speech API** — Safari/browser quirks; always provide a text fallback.
- **AI cost / abuse** — free Style Consultation is open to the public; rate-limit + cap, plus prompt caching and `ai_generations` cost logging.

**Simpler paths I recommend taking:**
- Integrated shadcn admin instead of a headless CMS (one system for the founder).
- **Select** moodboard images from the BWH library instead of generating them (on-brand, owned, cheaper, faster).
- Affiliate links + manual commission tracking instead of Stripe Connect at launch (skip KYC complexity).
- Supabase Realtime instead of a separate websocket service.
- Start the wedding website single-language (structure for i18n, defer multilingual).
- Reuse React Email templates for both Resend sends and in-app previews.
- Consider deferring Loops (use Resend Broadcasts) if a leaner launch is wanted — keeps the stack at 5.

---

## 9. Deliverable & verification

**Plan completeness check** (this is a planning artifact, not running code): stack with tradeoffs ✓, data model ✓, route architecture ✓, admin structure ✓, AI architecture (prompts/data flow/output/storage) ✓, build sequence with estimates ✓, risks + simpler paths ✓, monetisation/tier reconciliation ✓.

**How each future phase gets verified end-to-end** (for when we build): run the app locally + on a Netlify branch deploy; drive each flow in a real browser (Style Consultation → account → email; Stripe test-mode purchase → webhook → entitlement; enquiry → AI draft → approve → Resend; wedding-day run sheet on two devices for realtime). Code correctness via TS + tests; **feature correctness via actually using it in the browser**, never assumed.

**Immediate next step:** build a clickable Phase 1 prototype (public site + Style Consultation + "Your Wedding" account), starting with Phase 0 scaffolding (the pipes), so every later feature plugs in without a rebuild.
