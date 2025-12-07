-- Add Kakao login support for customers
-- This allows customers to login with Kakao OAuth

-- Make hashed_password nullable (for Kakao-only accounts)
ALTER TABLE customers ALTER COLUMN hashed_password DROP NOT NULL;

-- Add kakao_id field
ALTER TABLE customers ADD COLUMN IF NOT EXISTS kakao_id VARCHAR;

-- Create index for faster kakao_id lookups
CREATE INDEX IF NOT EXISTS idx_customers_kakao_id ON customers(kakao_id);

-- Create unique constraint for kakao_id per instructor
-- (Same Kakao user can be customer of multiple instructors)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_instructor_kakao
ON customers(instructor_id, kakao_id)
WHERE kakao_id IS NOT NULL;
