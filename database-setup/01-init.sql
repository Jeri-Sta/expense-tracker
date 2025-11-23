#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    
    -- Create schemas if needed
    CREATE SCHEMA IF NOT EXISTS expense_tracker;
    
    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO admin;
    GRANT ALL PRIVILEGES ON SCHEMA expense_tracker TO admin;
    
    -- Create initial tables will be handled by TypeORM migrations
    \echo 'Database initialization completed successfully!'
EOSQL