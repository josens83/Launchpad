-- ============================================
-- GDPR Consent Records Migration
-- Tracks user consent for GDPR compliance
-- ============================================

-- Create consent_records table
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT false,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure we track consent changes properly
    CONSTRAINT valid_category CHECK (category IN ('necessary', 'analytics', 'marketing', 'preferences'))
);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_timestamp ON consent_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_category ON consent_records(user_id, category);

-- Enable Row Level Security
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own consent records
CREATE POLICY "Users can view own consent records"
    ON consent_records
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own consent records
CREATE POLICY "Users can insert own consent records"
    ON consent_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to get latest consent for a user
CREATE OR REPLACE FUNCTION get_user_consent(p_user_id UUID)
RETURNS TABLE (
    category VARCHAR(50),
    granted BOOLEAN,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (cr.category)
        cr.category,
        cr.granted,
        cr.timestamp
    FROM consent_records cr
    WHERE cr.user_id = p_user_id
    ORDER BY cr.category, cr.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_consent(UUID) TO authenticated;

-- ============================================
-- Data Export Request Table (GDPR Right to Portability)
-- ============================================

CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    download_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_data_export_user_id ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON data_export_requests(status);

-- Enable RLS
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own export requests
CREATE POLICY "Users can view own export requests"
    ON data_export_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own export requests
CREATE POLICY "Users can create export requests"
    ON data_export_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Data Deletion Request Table (GDPR Right to Erasure)
-- ============================================

CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reason TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_deletion_status CHECK (status IN ('pending', 'scheduled', 'processing', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_user_id ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_status ON data_deletion_requests(status);

-- Enable RLS
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own deletion requests
CREATE POLICY "Users can view own deletion requests"
    ON data_deletion_requests
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create their own deletion requests
CREATE POLICY "Users can create deletion requests"
    ON data_deletion_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can cancel their own pending deletion requests
CREATE POLICY "Users can update own pending deletion requests"
    ON data_deletion_requests
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');
