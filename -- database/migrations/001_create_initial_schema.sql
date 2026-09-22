-- database/migrations/001_create_initial_schema.sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    subscription_plan VARCHAR(20) DEFAULT 'free',
    subscription_ends_at TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_plan ON users(subscription_plan);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    type VARCHAR(10) CHECK (type IN ('expense', 'income')),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, user_id)
);

-- Insert default categories
INSERT INTO categories (name, emoji, type, is_default) VALUES
('Groceries', '🛒', 'expense', TRUE),
('Utility Bills', '💡', 'expense', TRUE),
('Salary', '💼', 'income', TRUE),
('Personal Spending', '👤', 'expense', TRUE),
('Clothing', '👔', 'expense', TRUE),
('Lifestyle Activities', '🎯', 'expense', TRUE),
('Dining Out', '🍽️', 'expense', TRUE),
('Entertainment', '🎬', 'expense', TRUE),
('Transportation', '🚗', 'expense', TRUE),
('Healthcare', '🏥', 'expense', TRUE),
('Education', '📚', 'expense', TRUE),
('Other', '📦', 'expense', TRUE);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    type VARCHAR(10) CHECK (type IN ('expense', 'income')) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL,
    receipt_image_url VARCHAR(500),
    is_ocr_processed BOOLEAN DEFAULT FALSE,
    ocr_confidence DECIMAL(3,2),
    tags TEXT[],
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(20) CHECK (recurring_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurring_end_date DATE,
    split_transactions JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transactions_recurring ON transactions(is_recurring) WHERE is_recurring = TRUE;

-- Create budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    period_type VARCHAR(20) DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    alert_threshold DECIMAL(5,2) DEFAULT 75.00 CHECK (alert_threshold >= 0 AND alert_threshold <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category_id, start_date)
);

-- Create investments table
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    principal DECIMAL(12,2) NOT NULL CHECK (principal > 0),
    purchase_date DATE,
    current_value DECIMAL(12,2),
    expected_return DECIMAL(5,2),
    actual_return DECIMAL(5,2),
    return_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN current_value IS NOT NULL AND principal > 0 
            THEN ROUND(((current_value - principal) / principal * 100)::numeric, 2)
            ELSE NULL
        END
    ) STORED,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AI insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_filter VARCHAR(100),
    date_range_start DATE,
    date_range_end DATE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_actionable BOOLEAN DEFAULT TRUE,
    action_items JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_investments_user_type ON investments(user_id, type);
CREATE INDEX idx_ai_insights_user_unread ON ai_insights(user_id, is_read);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_transactions_user_category_date ON transactions(user_id, category_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, transaction_date DESC);