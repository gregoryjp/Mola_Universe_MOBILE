# Module Moments (Mobile)

**Technical spec/implementation document**
**Status:** Approved
**Version:** 1.0
**Last reviewed:** 2026-09-17
**Owner:** Gregory

Adapted from `docs/module-template.md` for a mobile feature module
(domain/data/presentation vertical slice, see `docs/architecture.md`).

---

## §0 — How to read this document

Describes the design, scope, and implementation of the Moments module in Mobile.

**For implementers:** the slice is complete; sections §5 and §8 are the reference.
**For reviewers:** §3 and §4 hold the decisions and the boundaries.
**For Gregory:** §9 lists what is deliberately left out and why.

---

## §1 — Context and problem

A household needs to organise a plan: a gathering with a date, or a quick
decision among its members. The backend module already exists
(`Mola_Universe_APP/src/modules/moments/`) with a full contract; Mobile had
**nothing** for it — no domain, no data, no presentation.

That meant a household could create a Moment from another client and never see
it or answer it from the phone, which is where an RSVP actually happens.

---

## §2 — Concept

A Moment is a **gathering (EVENT) or a decision (POLL)**, scoped to a household,
with two independent ways of answering:

| Who | How they answer | Where it is stored |
|---|---|---|
| Household member | RSVP buttons in the app (`GOING` / `NOT_GOING`) | `MomentParticipant.response` |
| External guest | A tokenised web page reached from an email | `MomentExternalInvite.status` |

The two never mix: the app never receives the external invite token, so it can
only create and list those invites, never answer them. See §9.

EVENT moments with a date are synced into the household calendar **by the
backend** (`syncCalendarEvent`, non-blocking). The app only reads back the
resulting `calendarEventId`.

---

## §3 — Technical decisions

| Decision | Why | Rejected alternative |
|---|---|---|
| Mirror the slice of Calendar (domain port + DTO + mapper + `RepositoryImpl`) | Consistency: a reader who knows Calendar reads Moments for free | A one-off fetch-in-hook module |
| `apiClient.getRaw/postRaw/...` | The moments controllers answer with the resource itself (`res.json(result.data)`), not the `{ success, data }` envelope | The enveloped client → would need a fake unwrap |
| Create/update bodies carry only the fields the caller defined | Every backend schema is `additionalProperties: false` | Sending `undefined` keys → 400 |
| Put the RSVP in `postRaw` with `{ response }` | That is the exact validator (`RespondToMomentSchema`) | Inventing a richer payload |
| Creator-only actions are **gated in the UI** (`createdBy === currentUser.id`) | The backend answers 403; showing buttons that always fail is a lie | Showing them and surfacing the 403 |
| RSVP UI shows **counts** + your own answer, not a per-person list | The backend exposes participants by `userId` only and `IHouseholdMemberDTO` has no name or email — a list would mean printing raw ids | Rendering `userId` values |
| Zona de juegos as an explicit, honest placeholder in EVENT moments | The space was asked for; the logic is backend 3b | Building a fake games UI |
| No optimistic update on RSVP | The participants live in the detail payload; the refetch is the source of truth | Optimistic cache surgery for a sub-second action |

---

## §4 — Exact scope

**Does:**

- ✅ List the household's Moments (flat array, no pagination).
- ✅ Read one Moment with its participants.
- ✅ Create a Moment (EVENT / POLL) with title, description, detail, date.
- ✅ Edit a Moment (title, description, detail, date).
- ✅ Cancel a Moment (`status: 'CANCELLED'`) without deleting it.
- ✅ Delete a Moment.
- ✅ RSVP: **Voy** (`GOING`) / **No puedo** (`NOT_GOING`).
- ✅ Invite an external guest by email and list the invites with their status.
- ✅ Link to the household calendar event the backend synced.
- ✅ Reserve the games area inside EVENT moments.

**Does NOT do (out of scope):**

- ❌ **El Impostor** logic — backend 3b.
- ❌ **Puntaje libre** (free scoring) — backend 3b.
- ❌ **Game state** in progress — backend 3b.
- ❌ **Game engine** in Mobile — backend 3b.
- ❌ Answering an external invite from the app — the token only travels in the
  email link and the answer is collected on that web page.
- ❌ Reading or writing `game-results` — the two routes exist
  (`/moments/:id/game-results`, verified at `openapi.ts:6981`) but belong to the
  game engine.

---

## §5 — Architecture (slice layout)

```
src/domain/moments/
├── entities/Moment.ts                      # types, enums, inputs
└── repositories/MomentRepository.ts        # port + MomentResult

src/data/moments/
├── dtos/momentDtos.ts                      # mirrors the backend payloads
├── mappers/momentMappers.ts                # DTO <-> domain
└── repositories/MomentRepositoryImpl.ts    # apiClient + RawResult

src/presentation/moments/
├── hooks/useMoments.ts                     # queries: list, detail, invites
├── hooks/useMomentMutations.ts             # create, update, delete, RSVP, invite
├── components/MomentCard.tsx               # list row
├── components/RsvpSection.tsx              # Voy / No puedo + counts
├── components/MomentInvitesSection.tsx     # external guests
└── screens/
    ├── MomentsListScreen.tsx
    ├── MomentDetailScreen.tsx
    └── MomentFormScreen.tsx                # create and edit
```

Entry point: **Dashboard → Momentos** (`DashboardScreen.tsx`), matching how
Pets, SOS and Notifications are reached. The tab bar stays at the five sections
fixed by GAP 4.

---

## §6 — Enums and states

| Domain type | Values | Notes |
|---|---|---|
| `MomentType` | `POLL`, `EVENT` | Fixed at creation; the update schema has no `type` |
| `MomentStatus` | `OPEN`, `CANCELLED` | `CANCELLED` is reached through the update route |
| `ParticipantResponse` | `PENDING`, `GOING`, `NOT_GOING` | `PENDING` is the initial value and is never sent by the app |
| `InviteStatus` | `INVITED`, `ACCEPTED`, `DECLINED` | Owned by the invite web page, read-only in the app |

---

## §7 — Behavioural rules

1. **Creator-only writes.** `createdBy === user.id` gates Edit / Cancel / Delete
   in the UI. The backend is the authority (403 `UNAUTHORIZED`).
2. **Cancelling is not deleting.** A cancelled moment keeps its data, closes the
   RSVP and hides the answer buttons.
3. **RSVP needs a session.** The buttons are gated off while a moment is
   cancelled; the mutation itself requires an active household.
4. **Calendar link.** Only rendered when `calendarEventId` is not null, which
   only happens for EVENT moments with an event date.
5. **External invites need the creator.** Non-creators see the list but no form.

---

## §8 — API contract (verified read-only against the live routes)

Both sources agree; where they differ, the runtime route wins.

| Method | Path | Body | Success | Source |
|---|---|---|---|---|
| POST | `/households/:householdId/moments` | `CreateMomentSchema` | 201 + `Moment` | `openapi.ts:6650`, `momentRoutes.ts` |
| GET | `/households/:householdId/moments` | — | 200 + `Moment[]` | `openapi.ts:6650` |
| GET | `/households/:householdId/moments/:momentId` | — | 200 + `Moment & { participants }` | `openapi.ts:6725` |
| PATCH | `/households/:householdId/moments/:momentId` | `UpdateMomentSchema` | 200 + `Moment` | `openapi.ts:6725` |
| DELETE | `/households/:householdId/moments/:momentId` | — | 204, no body | `openapi.ts:6805`, controller |
| POST | `/households/:householdId/moments/:momentId/respond` | `{ response: GOING \| NOT_GOING }` | 200 + `MomentParticipant` | `openapi.ts:6809` |
| GET | `/households/:householdId/moments/:momentId/invites` | — | 200 + `MomentExternalInvite[]` | `openapi.ts:6854` |
| POST | `/households/:householdId/moments/:momentId/invites` | `{ email, name? }` | 201 + invite | `openapi.ts:6854` |
| POST | `/moments/invites/:inviteId/respond` | `{ token, response }` | — | `openapi.ts:6936` — **out of scope**, web page |
| POST/GET | `/households/:householdId/moments/:momentId/game-results` | — | — | `openapi.ts:6981` — **out of scope**, backend 3b |

Response shape: the controllers answer with `res.json(result.data)`, i.e. the
resource itself, never the `{ success, data }` envelope. Errors still arrive as
the envelope and are normalised by `MomentRepositoryImpl`.

---

## §9 — What is deliberately left out

| Item | Why | Unblocks when |
|---|---|---|
| Per-person participant list in the RSVP | `IHouseholdMemberDTO` carries no name or email — a list would print `userId` values | The backend exposes a display name for members |
| Answering an external invite in the app | The token only lives in the email link | A backend decision (never, if the web page stays the channel) |
| Game results, El Impostor, free scoring | Backend 3b | The game engine ships |
| Zona de juegos content | Same | Same |

---

## §10 — Tests

`tests/unit/moments/` — 56 tests, all green with `npm run verify`.

| File | Covers |
|---|---|
| `momentRepository.test.ts` | The 10 routes above: paths, methods, bodies, 204, error mapping, and that the invite payload never carries a token |
| `momentMappers.test.ts` | Nullable fields, optional-field omission on create/update, RSVP and invite bodies |
| `useMoments.test.tsx` | List, detail and invites; no query without an active household; error surfacing |
| `useMomentMutations.test.tsx` | Create, update, cancel, delete, both RSVP answers, invite; `NO_HOUSEHOLD` guard; 403 passthrough |
| `RsvpSection.test.tsx` | Counts, own answer, both presses, disabled state |
| `MomentCard.test.tsx` | Title/type/description, cancelled badge, tap |
| `MomentDetailScreen.test.tsx` | Full screen: data, RSVP gating on cancel, RSVP dispatch, calendar link, play area only for EVENT, creator gating with and without a session user, cancel/delete/edit |

Component tests need `react-native` stubbed: the package ships Flow sources the
Vite pipeline cannot parse and the suite runs in plain node. The shared stub is
`tests/helpers/reactNativeStub.ts` — shallow on purpose (it drives behaviour,
not styling).

---

## ✅ Completeness checklist

- [x] Every section has content (no "TBD")
- [x] Every API row in §8 is verified against the runtime route and `openapi.ts`
- [x] Every decision has a documented reason
- [x] Tests are described concretely
- [x] No "Open Decision" left unresolved
- [ ] Gregory has reviewed and approved — pending his review of the RSVP display (see §9)
