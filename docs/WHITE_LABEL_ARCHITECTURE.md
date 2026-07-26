# White-label architecture

**Date:** 2026-07-21  
**Prompt:** 89 — White-Label Readiness  
**Status:** Architecture only — **do not ship a full white-label product in this prompt**  
**Domain:** `src/domain/branding/`  
**Service stub:** `src/services/branding/branding-service.ts`  
**Schema stub:** `BrandingProfile` (1:1 with `Organization`)  
**Flag:** `whiteLabel` (`NEXT_PUBLIC_FF_WHITE_LABEL`, **default off**)

---

## Intent

Some future B2B customers (typically `org_enterprise`) may need co-branded experiences:

| Configuration | Purpose |
| --- | --- |
| **Logo** | Header / email / share chrome |
| **Brand colors** | Accent (and optional surface) tokens |
| **Domain** | Custom hostname (reserved; not routed yet) |
| **Email templates** | From-name / subject slots (not a CMS) |

TheStrongestManager remains the platform brand. White-label is an **overlay** on platform defaults — never a fork of the app.

Related: `docs/ORG_GYM_DASHBOARD.md`, `docs/ORG_BILLING.md`, `docs/MOBILE_READINESS.md`, `src/config/site.ts`, `src/app/globals.css`.

---

## Design principle — separate branding from core

```text
┌─────────────────────────────────────────────────────────────┐
│  UI / email / share surfaces                                │
│  Consume BrandingConfig (displayName, logo, CSS vars)       │
│  Do NOT hard-code customer logos, colors, or From names     │
└────────────────────────────┬────────────────────────────────┘
                             │ resolveBranding({ organizationId? })
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  src/domain/branding/                                       │
│  BrandingConfig · mergeBrandingConfig · platform defaults   │
└────────────────────────────┬────────────────────────────────┘
                             │ (future) load BrandingProfile
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Organization (tenant) + BrandingProfile stub               │
│  Platform defaults ← siteConfig + globals.css               │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Owns branding? |
| --- | --- |
| `src/domain/branding/` | **Yes** — types, defaults, merge, CSS-var map |
| `src/config/site.ts` | Platform name / domain only |
| `src/app/globals.css` | Platform design tokens |
| Org dashboard / coach UI | **No** customer-specific hard-coding |
| Middleware / DNS | **Not yet** — do not read `customHostname` |

---

## `BrandingConfig` shape

```ts
BrandingConfig {
  displayName: string
  logoUrl: string | null
  faviconUrl: string | null
  colors: { accent, accentForeground, background, foreground } // null = keep platform
  domain: { customHostname, pathPrefix }  // reserved
  email: {
    fromName, fromAddress, footerText,
    templateSlots: [{ key, subjectOverride }]  // password_reset | org_invite | …
  }
  isWhiteLabel: boolean
  engineVersion: "white_label.v1"
}
```

Pure helpers:

- `getPlatformBrandingDefaults()` — from `siteConfig`
- `mergeBrandingConfig(overlay)` — customer overlay on defaults
- `brandingColorsToCssVars(colors)` — for a **future** org shell only

---

## Persistence stub

`BrandingProfile` (optional row per `Organization`):

- `displayName`, `logoUrl`, `faviconUrl`
- `colorsJson`, `emailJson`
- `customHostname`, `pathPrefix` — **stored only; unused by routing**
- `status`: `draft` | `active` | `archived`

No admin UI, no asset upload pipeline, no DNS automation in this prompt.

`resolveBranding()` returns platform defaults when:

- flag `whiteLabel` is off (default), or
- no profile / archived profile

---

## Email templates (readiness)

| Do | Do not |
| --- | --- |
| Named slots (`password_reset`, `org_invite`, …) | Full HTML email CMS |
| Override From name / subject via config | Per-tenant React Email editor in product |
| Keep `sendEmail` as the delivery adapter | Duplicate Resend calls in UI |

Today `src/services/email/send-email.ts` still uses `EMAIL_FROM` / platform name. Wiring `resolveBranding().email` into send paths is a **later** incremental step.

---

## Domain (custom hostname)

| Ready now | Explicitly deferred |
| --- | --- |
| Column + config field | Host-based middleware routing |
| Docs for TLS / DNS checklist (below) | Wildcard cert automation |
| | Multi-tenant cookie isolation redesign |

**Future checklist (not built):**

1. Customer CNAME → platform edge  
2. TLS certificate provisioning  
3. Host → `Organization` / `BrandingProfile` lookup  
4. Session cookie domain strategy  
5. Entitlement: only plans that include white-label (e.g. enterprise)

---

## Entitlement hook (later)

Document only — do not gate product features on white-label yet:

- Likely tied to `org_enterprise` / a future `OrgPlanLimits.whiteLabel` flag in `src/domain/org-billing/`
- Flag `whiteLabel` stays **off** until a controlled pilot

---

## What this prompt does **not** ship

- Custom-domain routing or middleware host switching  
- Logo upload UI or CDN pipeline  
- Design-token editor for customers  
- Email template CMS  
- Marketplace “white-label storefront”  
- Changing public `/pricing` or marketing brand for all visitors  

---

## Incremental adoption path

1. **Now:** domain module + `BrandingProfile` stub + this doc + flag off  
2. **Next:** org-admin read-only preview of merged config (still no custom domain)  
3. **Later:** apply CSS vars on `/app/org/*` shell when `status=active`  
4. **Later:** pass email From/subject from `BrandingConfig`  
5. **Last:** custom domain + entitlement + ops runbooks  

---

## Feature flag

`NEXT_PUBLIC_FF_WHITE_LABEL` → `whiteLabel` (**default off**)

Honesty: white-label is architecture-ready; the live product brand remains TheStrongestManager.
