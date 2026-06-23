# Project Objectives

This document outlines the core objectives of the AI Localisation & Regional Language Adaptation Assistant across the three primary roles: Frontend (UX), Backend & AI, and Testing.

## 1. Frontend & User Experience Objectives (Student 1)
* **Objective 1.1**: Design an intuitive, single-page dashboard layout that requires zero training for Telangana Today journalists.
* **Objective 1.2**: Provide visual indicator controls (such as input character counts, validation warnings, and loading animations) to guide the journalist.
* **Objective 1.3**: Build a responsive interface optimized for both desktop editors and mobile field journalists.
* **Objective 1.4**: Ensure rapid output interaction by implementing one-click copy-to-clipboard functionality for the Telugu adaptation.
* **Objective 1.5**: Create clear visual separation between the localized Telugu text and the accompanying cultural adaptation notes.

## 2. Backend & AI Objectives (Student 2)
* **Objective 2.1**: Establish a secure Node.js Express server to handle API routing, validation, and error management.
* **Objective 2.2**: Integrate the Gemini API using system instructions to enforce output structures (Telugu translation + cultural notes).
* **Objective 2.3**: Implement a prompt template (Prompt v3) that accurately processes tone adjustments (Standard, Colloquial, Formal) and regional dialect rules.
* **Objective 2.4**: Implement robust error handling for API timeouts, empty responses, and authentication failures with a graceful mock fallback.
* **Objective 2.5**: Standardize the JSON communication payload between backend and frontend to minimize latency.

## 3. Testing & Quality Objectives (Student 3)
* **Objective 3.1**: Write a comprehensive 12-case test plan covering normal inputs, edge cases (very short/long articles), and empty states.
* **Objective 3.2**: Establish a quality scoring matrix (scale of 1-5) to grade the relevance, accuracy, and flow of Telugu outputs.
* **Objective 3.3**: Construct 5 adversarial test inputs (e.g. non-English text, vague inputs, prompts trying to jailbreak) to verify LLM alignment.
* **Objective 3.4**: Ensure the API endpoint response latency remains low for standard drafts.
* **Objective 3.5**: Verify 100% of required fields (`Journalist`, `Inputs`, `English`) enforce client-side and server-side validation.
