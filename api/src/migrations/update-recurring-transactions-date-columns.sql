-- Update recurring_transactions table to use timestamp instead of date
-- for better date/time handling with timezones

ALTER TABLE recurring_transactions 
ALTER COLUMN next_execution TYPE TIMESTAMP USING next_execution::timestamp;

ALTER TABLE recurring_transactions 
ALTER COLUMN end_date TYPE TIMESTAMP USING end_date::timestamp;

ALTER TABLE recurring_transactions 
ALTER COLUMN last_executed_at TYPE TIMESTAMP USING last_executed_at::timestamp;