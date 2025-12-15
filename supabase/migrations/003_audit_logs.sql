-- Audit Logs Table for GDPR Compliance
-- Stores tamper-evident audit trail for security-sensitive operations

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action details
  action VARCHAR(100) NOT NULL,
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure')),
  error_message TEXT,

  -- Actor information
  actor_id UUID NOT NULL,
  actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'system', 'webhook', 'admin')),
  actor_email VARCHAR(255),

  -- Target (optional)
  target_type VARCHAR(100),
  target_id VARCHAR(255),

  -- Request metadata
  ip_address INET,
  user_agent TEXT,

  -- Additional context
  metadata JSONB DEFAULT '{}',

  -- Tamper-evident integrity hash
  integrity_hash VARCHAR(64) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_actor_action ON audit_logs(actor_id, action);

-- Composite index for date range queries
CREATE INDEX idx_audit_logs_actor_date ON audit_logs(actor_id, created_at DESC);

-- RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid());

-- Only service role can insert (via server-side code)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No updates or deletes allowed (immutable log)
-- This is enforced by NOT creating UPDATE or DELETE policies

-- Comment explaining the table
COMMENT ON TABLE audit_logs IS 'GDPR-compliant audit log for security-sensitive operations. Records are immutable.';
COMMENT ON COLUMN audit_logs.integrity_hash IS 'SHA-256 hash of action, actor, target, and timestamp for tamper detection';
