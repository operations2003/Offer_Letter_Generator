-- =============================================================================
-- AI-POWERED OFFER LETTER GENERATOR: PRODUCTION DDL SCHEMA
-- =============================================================================
-- Features:
--  - Strict Data Segregation: AI-generated vs HR-confirmed data
--  - Support for Timestamps, Status, Versioning, Validation, and Soft Deletion
--  - Future HRMS & ATS integration hooks (external IDs and event payloads)
--  - Deterministic Audit Trail & Document Integrity Checksums
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUMS & DOMAIN TYPES
-- =============================================================================

CREATE TYPE user_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);

CREATE TYPE candidate_document_type_enum AS ENUM (
    'RESUME',
    'INTERVIEW_FEEDBACK',
    'COMPENSATION_PROOF',
    'APPROVAL_MEMO',
    'OTHER'
);

CREATE TYPE document_processing_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE ai_extraction_status_enum AS ENUM (
    'SUCCESS',
    'LOW_CONFIDENCE',
    'PARTIAL',
    'FAILED'
);

CREATE TYPE ai_task_type_enum AS ENUM (
    'CANDIDATE_DATA_EXTRACTION',
    'SALARY_BENCHMARK_CHECK',
    'POLICY_COMPLIANCE_CHECK',
    'CUSTOM_CLAUSE_DRAFTING',
    'COMPENSATION_ANOMALY_DETECTION'
);

CREATE TYPE template_category_enum AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP',
    'EXECUTIVE',
    'CONSULTANT'
);

CREATE TYPE offer_status_enum AS ENUM (
    'DRAFT_AI',            -- Initial draft derived from AI extraction
    'HR_REVIEW',           -- HR has reviewed / adjusted parameters
    'PENDING_APPROVAL',    -- Submitted to Compensation / Finance / Department Approver
    'APPROVED',            -- Formally approved for issuance
    'ISSUED',              -- Sent to candidate (PDF generated & active)
    'ACCEPTED',            -- Signed/accepted by candidate
    'DECLINED',            -- Candidate rejected offer
    'EXPIRED',             -- Validity window lapsed
    'WITHDRAWN',           -- Revoked by employer prior to acceptance
    'REVISED'              -- Superseded by a newer offer version
);

CREATE TYPE generated_doc_type_enum AS ENUM (
    'OFFER_LETTER_PDF',
    'COMPENSATION_ANNEXURE_PDF',
    'NDA_DOCUMENT_PDF',
    'SIGNED_OFFER_LETTER_PDF'
);

CREATE TYPE audit_actor_type_enum AS ENUM (
    'USER',
    'SYSTEM',
    'AI_WORKER',
    'CANDIDATE'
);

CREATE TYPE audit_action_enum AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'OVERRIDE',
    'APPROVE',
    'REJECT',
    'ISSUE',
    'DOWNLOAD',
    'ACCEPT',
    'DECLINE',
    'REVOKE',
    'DELETE'
);

-- =============================================================================
-- 2. COMPANIES
-- =============================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    legal_name VARCHAR(255),
    domain VARCHAR(255),
    logo_storage_path TEXT,
    headquarters_address JSONB,
    settings JSONB NOT NULL DEFAULT '{
        "default_currency": "USD",
        "date_format": "YYYY-MM-DD",
        "fiscal_year_start_month": 4,
        "require_two_step_approval": false,
        "default_offer_validity_days": 7
    }'::JSONB,
    
    -- Future HRMS Integration Hook
    external_hrms_company_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_companies_code ON companies(code);
CREATE INDEX idx_companies_external_hrms_id ON companies(external_hrms_company_id);

-- =============================================================================
-- 3. USERS & ROLES (RBAC)
-- =============================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of scopes: ["offers:create", "offers:approve", etc]
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    title VARCHAR(100),
    status user_status_enum NOT NULL DEFAULT 'ACTIVE',
    
    -- Future HRMS Integration Hook
    external_hrms_user_id VARCHAR(100),
    
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_external_hrms_id ON users(external_hrms_user_id);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- =============================================================================
-- 4. CANDIDATES
-- =============================================================================
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    current_title VARCHAR(150),
    current_employer VARCHAR(200),
    current_location VARCHAR(150),
    experience_years NUMERIC(4,1),
    
    -- Future ATS / HRMS Integration Hooks
    external_ats_candidate_id VARCHAR(100),
    external_hrms_employee_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_company_candidate_email UNIQUE (company_id, email, deleted_at)
);

CREATE INDEX idx_candidates_company ON candidates(company_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_external_ats ON candidates(external_ats_candidate_id);
CREATE INDEX idx_candidates_external_hrms ON candidates(external_hrms_employee_id);

-- =============================================================================
-- 5. CANDIDATE DOCUMENTS (Resumes, Notes, Memos)
-- =============================================================================
CREATE TABLE candidate_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    document_type candidate_document_type_enum NOT NULL DEFAULT 'RESUME',
    original_file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL_ENCRYPTED', -- e.g. LOCAL_ENCRYPTED, S3_COMPATIBLE
    sha256_checksum VARCHAR(64) NOT NULL,
    extracted_text TEXT,
    processing_status document_processing_status_enum NOT NULL DEFAULT 'PENDING',
    processing_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_cand_docs_candidate ON candidate_documents(candidate_id);
CREATE INDEX idx_cand_docs_status ON candidate_documents(processing_status);

-- =============================================================================
-- 6. AI EXTRACTED DATA (Strict Separation: Advisory, Untrusted, Confidence-Tagged)
-- =============================================================================
CREATE TABLE ai_extracted_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    document_id UUID NOT NULL REFERENCES candidate_documents(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,      -- e.g. 'OLLAMA_LOCAL', 'GROQ_FREE', 'OPENAI'
    model_name VARCHAR(100) NOT NULL,        -- e.g. 'llama-3.3-70b-versatile', 'mistral-7b'
    latency_ms INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    
    -- Overall confidence score calculated across all extracted fields (0.00 to 1.00)
    overall_confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    extraction_status ai_extraction_status_enum NOT NULL DEFAULT 'SUCCESS',
    
    -- Structured payload with field-level confidence & source evidence snippets
    -- Format: {
    --   "candidate_name": {"value": "Jane Doe", "confidence": 0.98, "snippet": "Jane Doe, Senior Engineer"},
    --   "offered_role": {"value": "Staff Engineer", "confidence": 0.85, "snippet": "Offered: Staff Engineer"},
    --   "base_salary": {"value": 165000, "confidence": 0.72, "snippet": "Base: $165,000 / year"}
    -- }
    structured_fields JSONB NOT NULL DEFAULT '{}'::JSONB,
    
    -- Raw LLM JSON completion for debugging and replayability
    raw_provider_response JSONB NOT NULL DEFAULT '{}'::JSONB,
    
    -- Validation warnings (e.g. "Joining date falls on a weekend", "Base salary exceeds standard band")
    validation_warnings JSONB NOT NULL DEFAULT '[]'::JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_extracted_doc ON ai_extracted_data(document_id);
CREATE INDEX idx_ai_extracted_candidate ON ai_extracted_data(candidate_id);

-- =============================================================================
-- 7. OFFER TEMPLATES & TEMPLATE VERSIONS
-- =============================================================================
CREATE TABLE offer_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category template_category_enum NOT NULL DEFAULT 'FULL_TIME',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_offer_templates_company ON offer_templates(company_id);

CREATE TABLE template_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES offer_templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_markup TEXT NOT NULL, -- Handlebars/HTML format
    header_markup TEXT,
    footer_markup TEXT,
    style_css TEXT,
    
    -- Schema of placeholders required by this template:
    -- e.g. ["candidate.name", "compensation.base_salary", "dates.joining_date"]
    placeholders_schema JSONB NOT NULL DEFAULT '[]'::JSONB,
    
    change_summary VARCHAR(255),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_template_version UNIQUE (template_id, version_number)
);

CREATE INDEX idx_template_versions_template ON template_versions(template_id);

-- Point active template to its current published version
ALTER TABLE offer_templates
    ADD COLUMN current_version_id UUID REFERENCES template_versions(id) ON DELETE SET NULL;

-- =============================================================================
-- 8. OFFERS (Primary Entity - Clean AI vs HR Segregation)
-- =============================================================================
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE RESTRICT,
    template_version_id UUID NOT NULL REFERENCES template_versions(id) ON DELETE RESTRICT,
    offer_reference_number VARCHAR(50) NOT NULL UNIQUE,
    current_status offer_status_enum NOT NULL DEFAULT 'DRAFT_AI',
    current_version_number INTEGER NOT NULL DEFAULT 1,
    
    -- -------------------------------------------------------------------------
    -- DATA SEPARATION PILLAR
    -- -------------------------------------------------------------------------
    -- 1. AI-Generated Data Reference (Advisory / Traceable)
    ai_extracted_data_id UUID REFERENCES ai_extracted_data(id) ON DELETE SET NULL,
    ai_suggested_terms JSONB NOT NULL DEFAULT '{}'::JSONB,
    
    -- 2. HR-Confirmed / Final Data (Governing Legal Authority)
    -- Typed canonical columns for indexing, querying & reporting:
    job_title VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    band_grade VARCHAR(50),
    reporting_manager_name VARCHAR(150),
    reporting_manager_title VARCHAR(150),
    work_location VARCHAR(150) NOT NULL,
    employment_type template_category_enum NOT NULL DEFAULT 'FULL_TIME',
    proposed_joining_date DATE NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    
    -- Compensation Structure (Confirmed by HR)
    base_salary NUMERIC(14,2) NOT NULL,
    hra_allowance NUMERIC(14,2) DEFAULT 0.00,
    special_allowances NUMERIC(14,2) DEFAULT 0.00,
    performance_bonus NUMERIC(14,2) DEFAULT 0.00,
    joining_bonus NUMERIC(14,2) DEFAULT 0.00,
    total_ctc NUMERIC(14,2) NOT NULL,
    equity_details JSONB DEFAULT NULL, -- e.g. {"grant_type": "RSU", "units": 1000, "vesting_years": 4}
    benefits_summary JSONB DEFAULT '[]'::JSONB,
    
    -- Complete normalized HR JSON document used for rendering template
    hr_confirmed_terms JSONB NOT NULL DEFAULT '{}'::JSONB,
    
    -- Explicit record of what HR changed from the AI recommendation
    human_overrides JSONB NOT NULL DEFAULT '[]'::JSONB,
    
    -- -------------------------------------------------------------------------
    -- WORKFLOW, APPROVAL & VALIDITY
    -- -------------------------------------------------------------------------
    assigned_recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    
    issued_at TIMESTAMPTZ,
    offer_valid_until DATE,
    responded_at TIMESTAMPTZ,
    candidate_response_notes TEXT,
    
    -- Candidate Secure Access Portal Token (Hashed for security)
    candidate_portal_token_hash VARCHAR(128),
    candidate_portal_token_expires_at TIMESTAMPTZ,
    
    -- -------------------------------------------------------------------------
    -- FUTURE HRMS & ATS INTEGRATION PORTS
    -- -------------------------------------------------------------------------
    external_hrms_offer_id VARCHAR(100),
    external_ats_application_id VARCHAR(100),
    hrms_sync_status VARCHAR(50) DEFAULT 'NOT_SYNCED', -- e.g. 'NOT_SYNCED', 'SYNCED', 'FAILED'
    hrms_synced_at TIMESTAMPTZ,
    
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_offers_company ON offers(company_id);
CREATE INDEX idx_offers_candidate ON offers(candidate_id);
CREATE INDEX idx_offers_status ON offers(current_status);
CREATE INDEX idx_offers_ref_num ON offers(offer_reference_number);
CREATE INDEX idx_offers_external_hrms ON offers(external_hrms_offer_id);
CREATE INDEX idx_offers_portal_token ON offers(candidate_portal_token_hash);

-- =============================================================================
-- 9. OFFER VERSIONS & HISTORY (Complete Immutable Revisions)
-- =============================================================================
CREATE TABLE offer_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    template_version_id UUID NOT NULL REFERENCES template_versions(id) ON DELETE RESTRICT,
    
    -- Snapshot of all terms at this version
    snapshot_terms JSONB NOT NULL,
    -- JSON diff showing exact modifications made in this iteration
    diff_from_previous JSONB NOT NULL DEFAULT '{}'::JSONB,
    change_reason TEXT,
    
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_offer_version UNIQUE (offer_id, version_number)
);

CREATE INDEX idx_offer_versions_offer ON offer_versions(offer_id);

-- =============================================================================
-- 10. OFFER STATUS LIFECYCLE LOG
-- =============================================================================
CREATE TABLE offer_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    from_status offer_status_enum NOT NULL,
    to_status offer_status_enum NOT NULL,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_status_logs_offer ON offer_status_logs(offer_id);

-- =============================================================================
-- 11. AI PROCESSING & SUGGESTIONS (Interactive Advisory Capabilities)
-- =============================================================================
CREATE TABLE ai_processing_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    task_type ai_task_type_enum NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    
    prompt_context JSONB NOT NULL,      -- Context given to AI (salary band, role, etc)
    ai_suggestion JSONB NOT NULL,       -- Advisory response from AI
    
    is_accepted_by_hr BOOLEAN DEFAULT FALSE,
    hr_feedback_notes TEXT,
    hr_reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    hr_reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_suggestions_offer ON ai_processing_suggestions(offer_id);
CREATE INDEX idx_ai_suggestions_task ON ai_processing_suggestions(task_type);

-- =============================================================================
-- 12. GENERATED DOCUMENTS (Hashed, Rendered PDFs & Annexures)
-- =============================================================================
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    offer_version_id UUID REFERENCES offer_versions(id) ON DELETE SET NULL,
    document_type generated_doc_type_enum NOT NULL DEFAULT 'OFFER_LETTER_PDF',
    
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL_ENCRYPTED',
    file_size_bytes BIGINT NOT NULL,
    
    -- Digital Verification & Tamper Evidence
    sha256_checksum VARCHAR(64) NOT NULL,
    verification_token VARCHAR(64) NOT NULL UNIQUE,
    is_final_legal_document BOOLEAN NOT NULL DEFAULT FALSE,
    
    generated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_gen_docs_offer ON generated_documents(offer_id);
CREATE INDEX idx_gen_docs_verification ON generated_documents(verification_token);
CREATE INDEX idx_gen_docs_checksum ON generated_documents(sha256_checksum);

-- =============================================================================
-- 13. AUDIT LOGS (Immutable Append-Only Security Ledger)
-- =============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    actor_type audit_actor_type_enum NOT NULL,
    actor_id UUID,                     -- User ID, or NULL for public candidate actions
    entity_type VARCHAR(50) NOT NULL,   -- e.g. 'OFFER', 'CANDIDATE', 'DOCUMENT', 'TEMPLATE'
    entity_id UUID NOT NULL,
    action audit_action_enum NOT NULL,
    action_description TEXT NOT NULL,
    
    -- State transitions (old vs new state captures human overrides & approvals)
    previous_state JSONB,
    new_state JSONB,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Note: No UPDATE or DELETE triggers on audit_logs. It is strictly append-only.
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- 14. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_candidate_documents_updated_at BEFORE UPDATE ON candidate_documents FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_offer_templates_updated_at BEFORE UPDATE ON offer_templates FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
