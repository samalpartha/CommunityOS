# Unified App Blueprint (Android Studio + Java)

## Working Name: We already have

**Goal:** One app that helps people **find support, give support, report community issues, build habits, and access accessibility-first tools** using a shared **Mission + Trust + Proof** backbone.

---

## 1) Unified Product Structure (No duplication)

### Feature Lanes (all share the same backend and data model)

1. **Find Help Near Me**
   Food banks, shelters, community services, hospitals.
2. **Donate & Route Essentials**
   Food donation + logistics via hubs (food banks, churches, shelters, schools).
3. **Medimate Exchange**
   Blood donor matching + medicine vendor listing (logistics only; no medical advice).
4. **Safety Reports**
   Non-vigilante crime/safety incident reporting with moderation and privacy controls.
5. **Environment Habits**
   Small habit missions + local challenges.
6. **Accessibility Voice Assistant**
   Voice-to-email (blind-friendly) + future voice navigation.
7. **Internal Team Helpdesk**
   Skill-based matching within a closed org domain (optional module).
8. **Volunteer Org Map**
   Global map + local volunteering missions.
9. **Social Impact Discovery**
   Startups + funding + events.

**Core rule:** Everything is either a **Directory item** (static resource) or a **Mission** (action with proof). This prevents feature sprawl.

---

## 2) Android Studio Project Setup (Java, modular)

### Modules

* `app` — navigation shell + common UI
* `core_common` — utilities, logging, constants
* `core_auth` — Google sign-in, roles
* `core_network` — Retrofit/OkHttp, interceptors, caching
* `core_db` — Room, DAOs, migrations
* `core_location` — fused location, geohash, geofencing
* `core_policy` — moderation + risk tiers + rate limits
* `core_proof` — proof object, signing, media upload
* `feature_directory` — services/hospitals/volunteer orgs
* `feature_missions` — create/accept/complete/verify mission flows
* `feature_voice` — TTS/STT + voice email
* `feature_environment` — habits/challenges
* `feature_helpdesk` — internal matching
* `feature_discovery` — startups/funding/events

### Dependencies (proven, performant)

* **Retrofit + OkHttp** (timeouts, retry, cache)
* **Room** (offline-first)
* **WorkManager** (uploads, sync)
* **ViewModel + LiveData**
* **Glide** (images)
* **Google Maps + Places**
* **Firebase Auth + FCM** (optional but recommended for hackathon velocity)
* **Crashlytics + Performance Monitoring** (recommended)

---

## 3) Unified Data Model (Room)

You need two pillars:

## A) Directory entities (Find Help, Hospitals, Volunteer Orgs)

### `DirectoryItem`

* `id` (String)
* `type` (FOOD_BANK, SHELTER, HOSPITAL, VOLUNTEER_ORG, COMMUNITY_SERVICE, PHARMACY_VENDOR)
* `name`
* `address`
* `lat`, `lng`
* `phone`, `website`
* `hoursJson`
* `tagsJson` (diet support, languages, services)
* `source` (GooglePlaces / PartnerUpload / Curated)
* `updatedAt`

### `Hub`

Pickup/drop safe points for donations and distribution.

* `hubId`
* `orgId`
* `name`, `address`, `lat`, `lng`
* `hoursJson`
* `verificationStatus` (PENDING/VERIFIED)
* `allowedMissionTypesJson`

## B) Mission entities (everything “actionable”)

### `Mission`

* `missionId`
* `lane` (ESSENTIALS, PEOPLE, PLACES, HEALTH, ENVIRONMENT, HELP_DESK)
* `type` (DONATION_PICKUP, DONATION_DROP, CHECK_IN_CALL, HAZARD_REPORT, FIX_VERIFY, HABIT, BLOOD_REQUEST, MED_REQUEST, INTERNAL_HELP)
* `title`, `description`
* `category`, `severity`
* `riskTier` (0–3)
* `status` (DRAFT, POSTED, MATCHED, IN_PROGRESS, COMPLETED, VERIFIED, CLOSED, DISPUTED)
* `creatorUserId`
* `assignedUserId` (nullable)
* `orgId` (nullable)
* `hubId` (nullable)
* `lat`, `lng`, `geoHash`
* `timeWindowStart`, `timeWindowEnd`
* `constraintsJson` (allergens, language, mobility, etc.)
* `createdAt`, `updatedAt`

### `Proof`

* `proofId`
* `missionId`
* `type` (BEFORE_PHOTO, AFTER_PHOTO, HANDOFF_QR, SESSION_COMPLETE)
* `mediaUri` (local) / `mediaUrl` (remote)
* `capturedAt`
* `captureLat`, `captureLng`
* `hash` (sha256 of file)
* `signerUserId`
* `signature` (mock first, real later)
* `verificationStatus` (PENDING/ACCEPTED/REJECTED)
* `notes`

### `Incident`

* `incidentId`
* `missionId`
* `reporterUserId`
* `subjectUserId` or `orgId`
* `severity`
* `reason`
* `status`
* `createdAt`

---

## 4) Core Flows (One UX pattern across all lanes)

### Home screen: “What can I do in 10 minutes?”

Tabs (not separate apps):

* **Find** (Directory)
* **Missions** (action)
* **Post** (create mission)
* **Voice** (accessibility)
* **Profile**

Mission cards are consistent:

* lane icon + time estimate + distance
* safety tier icon
* proof required icon
* “Accept” / “Complete” / “Upload Proof”

---

## 5) Safety, Trust, and Moderation (must-have for “help people”)

### Risk tiers (enforced in code)

* **Tier 0:** no-contact (hazard report, environment habit check, directory browsing)
* **Tier 1:** public-space handoffs only (hub pickup/drop)
* **Tier 2:** audio-only interactions (check-in calls)
* **Tier 3:** in-home/high vulnerability (disabled by default)

### Policy-as-code (`core_policy`)

Implement a central evaluator:
`PolicyDecision evaluate(User, Mission, Action)`

Rules examples:

* Tier 1 handoff requires verified hub or org.
* Tier 2 requires verified phone + no incidents in last 30 days.
* Any flagged content → mission stays OPEN and goes to triage.
* Rate limits: new user can accept max N missions/day.

### Gemini integration (only where it matters)

* Text moderation: spam, harassment, solicitation
* Optional: image sanity checks (blur explicit content, irrelevant images)
* Do not market as “diagnosis”; it’s safety moderation.

---

## 6) Optimization Plan (Android Studio specific)

### Map + directory performance

* Use marker clustering
* Query by bounding box / radius
* Cache by geoHash tiles (Room)
* Lazy load details and images

### Missions performance

* Use Paging 3 for feeds
* Avoid heavy JSON parsing on main thread
* Use DiffUtil in RecyclerView

### Media optimization

* Resize before upload (e.g., max 1280px)
* Compress JPEG quality (70–80)
* Upload in WorkManager with retry/backoff
* Store thumbnails locally

### Offline-first sync

* Directory sync: daily + manual refresh
* Mission sync: near-real-time via polling or FCM
* Proof upload: background

### App stability

* Strict timeouts on OkHttp
* Circuit breaker: if AI moderation fails, default to safe route
* Crashlytics + performance traces

---

## 7) Unified Implementation Tasks (Executable Task Board)

## Phase 1: Foundation (Backbone)

1. Create modules and base navigation
2. Implement `core_network` (Retrofit, OkHttp cache, interceptors)
3. Implement `core_db` (Room entities + DAOs)
4. Implement `core_location` (fused provider + geoHash utility)
5. Implement `core_policy` (risk tier checks + rate limits)
6. Implement `core_proof` (media capture + file hashing)

**Exit criteria**

* App runs, logs in, stores directory and missions locally.
* Core policy gates are enforced server-side or locally if no backend.

## Phase 2: Directory Lane (Find Help)

1. Implement Places search + filters
2. Directory list + map view with clustering
3. Directory item details page
4. Favorite/save and offline access

**Exit criteria**

* User can find food banks/hospitals/shelters near them with stable performance.

## Phase 3: Missions Lane (Places + Essentials MVP)

1. Hazard report mission with before-photo
2. Owner routing (simple: category → org queue)
3. Completion + after-photo proof
4. Verification + closure
5. Essentials: hub-based pickup/drop missions with QR

**Exit criteria**

* Full lifecycle: report → route → complete → verify → close with proof.

## Phase 4: Voice Lane (Accessibility MVP)

1. Voice state machine: To → Subject → Message → Confirm
2. TTS prompts + SpeechRecognizer
3. JavaMail sending via WorkManager
4. Accessibility QA (TalkBack, large tap target, haptics)

**Exit criteria**

* A blind user can send an email using voice-only flow reliably.

## Phase 5: Medimate MVP (Logistics only)

1. Request blood / request medicine missions (structured forms)
2. Match donors/vendors near me
3. Contact masking or controlled reveal (basic)
4. Proof of handoff (optional)

**Exit criteria**

* Requests can be posted and matched without exposing sensitive data.

## Phase 6: Environment Habits

1. Habit missions with streak tracking
2. Local challenges (geo-limited)
3. Reminders via WorkManager

**Exit criteria**

* Users can adopt habits through small mission loops.

## Phase 7: Optional Modules

* Internal helpdesk (Google workspace sign-in + topic matching)
* Social impact discovery (startups/funding/events)
* Global volunteer map (10k orgs with tile caching)

---

## 8) “Help People” Upgrades (what makes this meaningful)

To ensure it genuinely helps, add these high-value features early:

* **Hubs**: safe pickup/drop points (churches, schools, shelters)
* **Referral links**: partners create links to intake requests
* **Triage queue**: ambiguous requests go to partner review
* **Privacy modes**: anonymous reporting and approximate location default
* **Proof templates**: simple checklists that prevent failure in the real world

---

## 9) What to write in Android Studio “Instructions / Notes”

Add a `docs/` folder with:

* `ARCHITECTURE.md` (modules, data flow)
* `OFFLINE_FIRST.md` (Room + sync rules)
* `POLICY_ENGINE.md` (risk tiers, rate limits)
* `MAP_PERFORMANCE.md` (clustering + tile caching)
* `ACCESSIBILITY_VOICE.md` (voice state machine)
* `RUNBOOK.md` (how to run, debug, release)

---

## 10) Immediate next step

If you share:

1. Your current package structure, and
2. Whether you already have a backend (or local-only for hackathon),

I will produce:

* the exact folder/module layout in Android Studio,
* the Room entity classes (Java),
* the Retrofit interfaces,
* and a step-by-step “build order” with commit milestones.
