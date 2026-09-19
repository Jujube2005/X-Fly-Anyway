-- =============================================================================
-- Migration: 20260920040000_external_api_tokens_refresh_expiry.sql
-- Description: Add absolute refresh token expiration to external_api_tokens
-- =============================================================================

ALTER TABLE public.external_api_tokens
ADD COLUMN refresh_expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days');

CREATE INDEX idx_external_api_tokens_refresh_expires_at ON public.external_api_tokens(refresh_expires_at);
