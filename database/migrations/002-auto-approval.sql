-- Optional one-time migration for listings created by version 1.1.
-- Review old pending records before running this. New version 1.2 submissions
-- are approved automatically by the Worker and do not require this query.

UPDATE sites
SET status = 'approved',
    approved_at = COALESCE(approved_at, created_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP,
    rejection_reason = ''
WHERE status = 'pending';
