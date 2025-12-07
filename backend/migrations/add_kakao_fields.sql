-- Add Kakao login fields to instructors table

ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS kakao_client_id VARCHAR,
ADD COLUMN IF NOT EXISTS kakao_client_secret VARCHAR,
ADD COLUMN IF NOT EXISTS kakao_redirect_uri VARCHAR,
ADD COLUMN IF NOT EXISTS kakao_enabled BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_instructors_kakao_enabled ON instructors(kakao_enabled);
