# Database Architecture: AI-Powered Offer Letter Generator

This directory contains the production database definitions for the **Standalone Offer Letter Generator**.

## Files
1. `init_schema.sql`: Pure PostgreSQL DDL script with custom enums, constraints, foreign keys, indices, and updated_at triggers.
2. `../backend/prisma/schema.prisma`: Complete Prisma schema for type-safe query generation, migrations, and developer tooling.
3. `../shared/types/models.ts`: Shared TypeScript interfaces and data-segregation types.

---

## Entity Relationship Overview

| Model / Table | Primary Responsibility | Data Segregation & Integrity | Soft Delete | Future Integration Hook |
|---|---|---|:---:|---|
| **`companies`** | Organization tenant boundary | Defines default currencies & validity settings | `deleted_at` | `external_hrms_company_id` |
| **`roles` & `users`** | Authentication & RBAC | Granular permissions (`offers:create`, `offers:approve`, etc.) | `deleted_at` | `external_hrms_user_id` |
| **`candidates`** | Candidate profiles | Email uniqueness per company boundary | `deleted_at` | `external_ats_candidate_id`, `external_hrms_employee_id` |
| **`candidate_documents`** | Resumes, feedback memos | SHA-256 integrity hash & storage path | `deleted_at` | File metadata & raw text buffer |
| **`ai_extracted_data`** | Advisory AI data extracted from documents | **Strictly separated from legal terms**. Stores confidence scores (0.0-1.0), source snippets, raw JSON | N/A (Immutable) | Provider/model agnostic (`OLLAMA`, `GROQ`, `OPENAI`) |
| **`offer_templates`** | Template definitions | Categorized (Full-time, Intern, Executive) | `deleted_at` | Active pointer to published version |
| **`template_versions`** | Immutable template revisions | Handlebars markup, styling, placeholders schema | Immutable | Version number locking |
| **`offers`** | The central domain entity | **Clean Separation**: Holds `ai_suggested_terms` (advisory) alongside `hr_confirmed_terms` (authoritative) and `human_overrides` | `deleted_at` | `external_hrms_offer_id`, `external_ats_application_id` |
| **`offer_versions`** | Complete audit snapshots | Immutable revision history with delta diffs | Immutable | Full state replayability |
| **`offer_status_logs`** | State transition history | Tracks every status change (`DRAFT_AI` -> `HR_REVIEW` -> `APPROVED` -> `ISSUED`) | Immutable | Transition actor & reason |
| **`ai_processing_suggestions`** | Interactive advisory checks | Policy checks, salary band recommendations, custom clause drafting | N/A | HR accept/reject notes |
| **`generated_documents`** | Final rendered PDFs | Cryptographic SHA-256 hash, verification tokens, tamper evidence | `deleted_at` | Download link for future onboarding export |
| **`audit_logs`** | Append-only security ledger | Actor, Action, Old State, New State, IP, User Agent | Strictly Append-Only | System compliance |
