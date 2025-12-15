-- ============================================
-- Usage Tracking Enhancement Migration
-- Improved usage tracking for rate limiting
-- ============================================

-- Ensure usage table exists with proper structure
CREATE TABLE IF NOT EXISTS usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint for user, type, and month combination
    CONSTRAINT unique_usage_per_month UNIQUE (user_id, type, month)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_type ON usage(type);
CREATE INDEX IF NOT EXISTS idx_usage_month ON usage(month);
CREATE INDEX IF NOT EXISTS idx_usage_lookup ON usage(user_id, type, month);

-- Enable RLS
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own usage"
    ON usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- Function to increment usage (used by API routes)
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_count INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
    v_month VARCHAR(7);
BEGIN
    v_month := TO_CHAR(NOW(), 'YYYY-MM');

    INSERT INTO usage (user_id, type, count, month)
    VALUES (p_user_id, p_type, p_count, v_month)
    ON CONFLICT (user_id, type, month)
    DO UPDATE SET
        count = usage.count + p_count,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_usage(UUID, VARCHAR, INTEGER) TO authenticated;

-- Function to get current month usage
CREATE OR REPLACE FUNCTION get_current_usage(p_user_id UUID)
RETURNS TABLE (
    type VARCHAR(50),
    count INTEGER
) AS $$
DECLARE
    v_month VARCHAR(7);
BEGIN
    v_month := TO_CHAR(NOW(), 'YYYY-MM');

    RETURN QUERY
    SELECT u.type, u.count
    FROM usage u
    WHERE u.user_id = p_user_id
    AND u.month = v_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_usage(UUID) TO authenticated;

-- Function to check if user is within limits
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_count INTEGER;
    v_month VARCHAR(7);
BEGIN
    -- Unlimited check
    IF p_limit = -1 THEN
        RETURN TRUE;
    END IF;

    v_month := TO_CHAR(NOW(), 'YYYY-MM');

    SELECT COALESCE(count, 0) INTO v_current_count
    FROM usage
    WHERE user_id = p_user_id
    AND type = p_type
    AND month = v_month;

    RETURN COALESCE(v_current_count, 0) < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_usage_limit(UUID, VARCHAR, INTEGER) TO authenticated;
