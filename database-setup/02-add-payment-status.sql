-- Migration: Add payment_status column to transactions table
-- Description: Adds paymentStatus and paidDate columns to track payment status of transactions
-- Date: 2024-12-03
-- 
-- HOW TO USE:
-- 1. First, restart the API (npm run start:dev) to let TypeORM create the columns automatically
-- 2. Then run this script to update existing records:
--    docker exec -i expense-tracker-db psql -U admin -d expense_tracker < database-setup/02-add-payment-status.sql
--    OR connect to pgAdmin and run this script

-- Update all existing records to have 'pending' status (they were inserted before this feature)
UPDATE transactions 
SET "paymentStatus" = 'pending' 
WHERE "paymentStatus" IS NULL;

-- Create index for faster filtering by payment status (if not exists)
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON transactions("paymentStatus");

-- Create composite index for common query patterns (if not exists)  
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions("userId", "paymentStatus");

SELECT 'Payment status migration completed! ' || COUNT(*) || ' records updated.' as result
FROM transactions WHERE "paymentStatus" = 'pending';
