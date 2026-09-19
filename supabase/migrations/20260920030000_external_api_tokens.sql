-- =============================================================================
-- Migration: 20260920030000_external_api_tokens.sql
-- Description: Create external_api_tokens table for Phase 4 Sprint 1
-- =============================================================================

CREATE TABLE public.external_api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    refresh_token_hash TEXT NOT NULL UNIQUE,
    scopes TEXT[] NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and token lookup
CREATE INDEX idx_external_api_tokens_token_hash ON public.external_api_tokens(token_hash);
CREATE INDEX idx_external_api_tokens_refresh_token_hash ON public.external_api_tokens(refresh_token_hash);
CREATE INDEX idx_external_api_tokens_expires_at ON public.external_api_tokens(expires_at);
CREATE INDEX idx_external_api_tokens_is_revoked ON public.external_api_tokens(is_revoked);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_external_api_tokens_updated_at
BEFORE UPDATE ON public.external_api_tokens
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.external_api_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admin can read, insert, update tokens
CREATE POLICY "Super admins can manage external_api_tokens"
    ON public.external_api_tokens
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );
