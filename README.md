# Community Hero - The Community Operating System

**A unified platform to find support, give help, and build resilient communities.**

## 🚀 Live Demo: [https://community-hero-prod.web.app](https://community-hero-prod.web.app)

---

## 📖 About

**Community Hero** is a "Community Operating System" designed to bridge the gap between those in need and those who can help. It combines a real-time directory of essential services with gamified civic engagement ("Missions") and accessibility-first tools like Voice Mode.

**Core Philosophy:** Mission + Trust + Proof.

---

## 💔 The Problem

CommunityOS solves critical inefficiencies in the civic ecosystem:

- **For Schools:** 42% of college applicants inflate volunteer hours, and counselors spend 15+ hours/week manually verifying them.
- **For Cities:** Disaster response relies on outdated phone trees, with no real-time way to mobilize volunteers during crises.
- **For Nonprofits:** High no-show rates and an inability to engage Gen Z volunteers effectively.

---

## 🏆 Key Differentiators

Why CommunityOS is different:

1. ✅ **AI-Verified Integrity:** The only platform using Gemini AI to verify photos and cryptographically sign hour logs.
2. ✅ **Crisis-Ready:** "Swarm Mode" instant mobilizes volunteers for emergencies (hurricanes, missing persons).
3. ✅ **Offline-First:** Mesh networking capabilities allow coordination even when cell service helps fail.
4. ✅ **Student-Centric:** Gamified "Missions" and digital badges designed for the next generation of civic leaders.

---

## 🏗 System Architecture

### 1. High-Level Overview

The system follows a serverless architecture leveraging **Firebase** for backend services and **React** for a responsive frontend.

```mermaid
graph TD
    User([End User]) <--> Frontend["React PWA \n(Firebase Hosting)"]
    
    subgraph "Firebase Backend (Serverless)"
        Frontend <--> Auth[Authentication]
        Frontend <--> Firestore[Firestore DB]
        Frontend <--> Functions["Cloud Functions \n(Node.js)"]
        Functions <--> Storage[Cloud Storage]
    end
    
    subgraph "External Services"
        Functions <--> GMaps[Google Places API]
        Frontend <--> Gemini["Gemini Flash 1.5 API \n(Voice & AI)"]
    end
```

### 2. Frontend Architecture

Built with **Vite + React + TypeScript**. Logic is separated into reusable Services and UI Components.

```mermaid
graph LR
    subgraph "Views"
        Home[Home / Dashboard]
        Map[Service Map]
        Directory[Directory List]
        Mission[Mission Control]
        Voice[Voice Assistant]
    end

    subgraph "Services Layer"
        Places["placesService.ts \n(Google Maps Proxy)"]
        City["cityDataService.ts \n(311 & Mock Data)"]
        Gemini["geminiService.ts \n(AI Websocket)"]
        AuthService[authService.ts]
    end

    Home --> AuthService
    Map --> Places
    Directory --> Places
    Mission --> City
    Voice --> Gemini
```

### 3. Backend & Data Flow

**Cloud Functions** act as a secure proxy for third-party APIs and handle background synchronization.

```mermaid
sequenceDiagram
    participant Client as Frontend App
    participant Function as Cloud Function (Proxy)
    participant Firestore as Firestore DB
    participant Google as Google Places API

    Note over Client, Google: Location-Based Search Flow
    Client->>Function: Call proxyGooglePlaces(lat, lng, type)
    Function->>Google: Fetch Places (API Key Protected)
    Google-->>Function: JSON Response
    Function-->>Client: Cleaned Data
    Client->>Firestore: Cache Result (Optional)
```

---

## ✨ Key Features

### 🔍 Find Help (Directory Lane)

- **Real-time Map:** Locate Verified Food Banks, Shelters, and Hospitals.
- **Smart Filters:** "Open Now", "Wheelchair Accessible".
- **Mesh Mode:** Offline-ready data indicators for low-connectivity areas.

### 🛡️ Give Support (Missions Lane)

- **Civic Action:** Gamified missions (e.g., "Report Hazard", "Donate Food").
- **Verification:** "Before & After" photo proof for trust.
- **Impact Tracking:** Earn "Impact Credits" and badges.

### 🎙️ Accessibility (Voice Lane)

- **Hands-Free Mode:** powered by **Gemini Multimodal Live API**.
- **Natural Conversation:** Ask "Where is the nearest food bank?" and get spoken directions.
- **Visual Context:** The AI can "see" your screen to help explain complex forms.

---

## 🤝 Impact & Beneficiaries

Community Hero serves a three-sided ecosystem designed to build community resilience:

1. **Seekers (Those in Need):**
    - **Benefit:** Instantly find verified, open, and accessible critical services (food banks, shelters, medical aid) without navigation barriers.
    - **Features:** Voice-first interface for accessibility, generic terms search, and offline-ready maps.

2. **Heroes (Volunteers & Citizens):**
    - **Benefit:** A tangible way to contribute to their local community through micro-volunteering.
    - **Features:** Gamified "Missions" to verify resources, report hazards, or distribute aid; earn "Impact Credits" for civic engagement.

3. **Providers (NGOs & Government):**
    - **Benefit:** Real-time data on resource availability and community needs.
    - **Features:** Dashboard for verified organizations to update status, view crowd-sourced insights, and coordinate relief efforts.

---

## 🔮 Future Roadmap & Scaling

### Scaling Strategy

- **Global Localization (i18n):** Expanding support for 20+ languages to serve diverse communities worldwide.
- **Federated Architecture:** Moving towards a federated instance model where local governments can host their own "CommunityOS" nodes while sharing critical data.
- **Offline Mesh Networks:** Implementing peer-to-peer data sync (via Bluetooth/WiFi Direct) for use in disaster zones with zero connectivity.

### Upcoming Features

- **Blockchain Integration:** Immutable ledger for "Impact Credits" to ensure transparency in donations and volunteer rewards.
- **Predictive AI:** Using Gemini to predict resource shortages based on user search trends and seasonal data.
- **Government API Integrations:** Direct hooks into city 311 systems for automatic ticket generation from user reports.

---

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS (via custom CSS)
- **Backend:** Firebase (Auth, Firestore, Cloud Functions).
- **AI:** Google Gemini Flash 1.5 (Multimodal Live API).
- **Maps:** Google Maps Platform (Places API, Geocoding).
- **Build/Deploy:** GitHub Actions, Firebase Hosting.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/samalpartha/CommunityOS.git
   cd CommunityOS
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file with your Firebase and Google API keys:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_GOOGLE_PLACES_API_KEY=...
   VITE_GEMINI_API_KEY=...
   ```

4. **Run Locally**

   ```bash
   npm run dev
   ```

### Deployment

**Deploy to Production:**

```bash
npm run build
firebase deploy
```
