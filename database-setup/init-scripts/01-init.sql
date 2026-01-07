-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE installment_status AS ENUM ('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('open', 'closed', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    "isActive" BOOLEAN DEFAULT TRUE,
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50),
    "isActive" BOOLEAN DEFAULT TRUE,
    "sortOrder" INTEGER DEFAULT 0,
    "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Credit cards table
CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    "closingDay" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "totalLimit" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period VARCHAR(7) NOT NULL,
    status invoice_status DEFAULT 'open',
    "totalAmount" DECIMAL(12,2) DEFAULT 0,
    "paidAt" TIMESTAMP,
    "closingDate" DATE,
    "dueDate" DATE,
    "creditCardId" UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP,
    UNIQUE("creditCardId", period)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    "transactionDate" DATE NOT NULL,
    "competencyPeriod" VARCHAR(7) NOT NULL,
    metadata JSONB,
    notes TEXT,
    "isRecurring" BOOLEAN DEFAULT FALSE,
    "recurringTransactionId" UUID,
    "isProjected" BOOLEAN DEFAULT FALSE,
    "projectionSource" VARCHAR(20),
    "confidenceScore" DECIMAL(5,2),
    "paymentStatus" VARCHAR(20) DEFAULT 'pending' CHECK ("paymentStatus" IN ('pending', 'paid', 'overdue')),
    "paidDate" DATE,
    "categoryId" UUID REFERENCES categories(id) ON DELETE SET NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Card transactions table
CREATE TABLE IF NOT EXISTS card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    "transactionDate" DATE NOT NULL,
    "invoicePeriod" VARCHAR(7) NOT NULL,
    "isInstallment" BOOLEAN DEFAULT FALSE,
    "installmentNumber" INTEGER,
    "totalInstallments" INTEGER,
    "parentTransactionId" UUID REFERENCES card_transactions(id),
    "creditCardId" UUID NOT NULL REFERENCES credit_cards(id) ON DELETE CASCADE,
    "categoryId" UUID REFERENCES categories(id) ON DELETE SET NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Installment plans table
CREATE TABLE IF NOT EXISTS installment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    "financedAmount" DECIMAL(10,2) NOT NULL,
    "installmentValue" DECIMAL(10,2) NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "totalInterest" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,2),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    "totalPaid" DECIMAL(10,2) DEFAULT 0,
    "totalDiscount" DECIMAL(10,2) DEFAULT 0,
    "paidInstallments" INTEGER DEFAULT 0,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Installments table
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "installmentNumber" INTEGER NOT NULL,
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2),
    "discountAmount" DECIMAL(10,2) DEFAULT 0,
    "dueDate" DATE NOT NULL,
    "paidDate" DATE,
    status installment_status DEFAULT 'pending',
    notes TEXT,
    metadata JSONB,
    "installmentPlanId" UUID NOT NULL REFERENCES installment_plans(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(10,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    interval INTEGER DEFAULT 1,
    "nextExecution" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "maxExecutions" INTEGER,
    "executionCount" INTEGER DEFAULT 0,
    "lastExecutedAt" TIMESTAMP,
    "isCompleted" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    notes TEXT,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "categoryId" UUID REFERENCES categories(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions("transactionDate");
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions("categoryId");
CREATE INDEX IF NOT EXISTS idx_card_transactions_user_id ON card_transactions("userId");
CREATE INDEX IF NOT EXISTS idx_card_transactions_credit_card_id ON card_transactions("creditCardId");
CREATE INDEX IF NOT EXISTS idx_card_transactions_date ON card_transactions("transactionDate");
CREATE INDEX IF NOT EXISTS idx_installments_installment_plan_id ON installments("installmentPlanId");
CREATE INDEX IF NOT EXISTS idx_installment_plans_user_id ON installment_plans("userId");
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories("userId");
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards("userId");
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions("userId");
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_execution ON recurring_transactions("nextExecution");
CREATE INDEX IF NOT EXISTS idx_invoices_credit_card_id ON invoices("creditCardId");
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices("userId");
