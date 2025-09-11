-- Rollback script for rule_section table migration
-- Use this if you need to revert the changes

-- Step 1: Drop the rule_section table (this will cascade to remove all sections)
DROP TABLE IF EXISTS rule_section CASCADE;

-- Step 2: Verify rollback
SELECT 'Rollback completed. rule_section table has been removed.' as status;
