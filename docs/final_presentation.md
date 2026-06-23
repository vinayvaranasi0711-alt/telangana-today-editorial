# Final Presentation: Review 3 Slide Deck
**Project**: AI Localisation & Regional Language Adaptation Assistant  
**Client**: Telangana Today (telanganatoday.com)  
**Team**: 3 Students (Frontend, Backend & AI, Testing & Deployment)  

---

## Slide 1: Cover Page
* **Title**: AI Localisation & Regional Language Adaptation Assistant
* **Context**: Final Review 3 Presentation
* **Host Publication**: Telangana Today
* **Team Roles**:
  * Student 1: Frontend & User Experience
  * Student 2: Backend, Database & AI prompt engineering
  * Student 3: Quality Testing & Deployment

---

## Slide 2: Problem Statement & Context
* **Current Scenario**: Telangana Today journalists write drafts in English, which are manually translated and localized into Telugu.
* **The Challenges**:
  * Literal translations read as stiff and miss colloquial nuances.
  * Inconsistent styling across regional dialects (Hyderabadi vs. Warangal).
  * No centralized audit trail or analytics dashboard.
  * Dependency on a small team of language editors creates publication delays.

---

## Slide 3: Project Goals
* **Goal 1**: Develop a zero-training single-page React interface for editors.
* **Goal 2**: Implement an Express.js API server to route requests and manage histories.
* **Goal 3**: Optimize prompt templates (Prompt v4) to enforce active voice, media terminology, and target dialects.
* **Goal 4**: Secure endpoints via rate limiters and log ratings for quality analytics.
* **Goal 5**: Run automated test suites to ensure zero-failure code performance.

---

## Slide 4: System Architecture & Data Flow
* **Frontend Layer**: React SPA featuring visual character counters, preset templates, copy-to-clipboard actions, and Unicode-aligned print frames.
* **Backend Layer**: Node.js Express server handling API routing, security rate limits, and fallback mock controllers.
* **AI Layer**: Google Gemini API endpoints routing Prompt v4 rules.
* **Database Layer**: Local flat JSON database (`db.json`) supporting collections for translations and ratings.

---

## Slide 5: The Prompt Evolution (v1 to v4)
* **Prompt v1**: Basic literal translation prompt. (Score: **2.1/5.0**)
* **Prompt v2**: Adds tone selectors. (Score: **3.4/5.0**)
* **Prompt v3**: Enforces JSON response formats and cultural notes. (Score: **4.6/5.0**)
* **Prompt v4**: Enforces active voice, maps English idioms to Telugu equivalents, and refines regional dialects. (Score: **4.9/5.0**)

---

## Slide 6: Admin Analytics Dashboard
* **Real-time Overview Metrics**: Displays total generations, feedback rates, and average ratings.
* **Usage Trends**: Custom SVG charts tracking translation volume and quality scores.
* **Linguistic Preference Bars**: Compares tone (Standard, Colloquial, Formal) and dialect (Hyderabadi, Warangal, Standard) distributions.
* **Leaderboard & Reviews**: Identifies top journalist contributions and hosts a scrollable log of user feedback comments.

---

## Slide 7: Quality Evaluation & Testing Results
* **Test Plan**: Covered 11 integration test scenarios (endpoints, validation, error retry, database CRUD, and rate limiters).
* **Execution Status**: 100% test pass rate achieved on the final integration suite.
* **Linguistic Quality Verification**: Evaluated on 10 news stories, achieving an average quality score of **4.85 / 5.0** (Target threshold: $\ge 4.0$).

---

## Slide 8: Deployment Architecture
* **Frontend Client**: Deployed on Vercel with HTTPS enabled.
* **Backend API**: Deployed on Render running Node.js environments.
* **Secrets Management**: Deployed using secure environment variables (`GEMINI_API_KEY`, `VITE_API_URL`).
* **Database Transition**: Outlined schema mapping to migrate the JSON db to Supabase (PostgreSQL).

---

## Slide 9: Project Achievements & Conclusion
* **Key Achievements**:
  * Replaced manual localization workflows with a centralized digital system.
  * Verified active-voice translations with regional Telugu dialects.
  * Protected servers from request flooding using rate limiters.
* **Future Outlook**:
  * Integrate the tool directly into Telangana Today's CMS.
  * Fine-tune open-source models (e.g. Llama 3) to reduce API dependencies.
