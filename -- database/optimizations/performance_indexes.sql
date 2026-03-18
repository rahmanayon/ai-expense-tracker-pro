-- database/optimizations/performance_indexes.sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_tenant_date ON transactions(tenant_id, transaction_date DESC);
CREATE INDEX idx_budgets_user_active ON budgets(user_id) WHERE is_active = TRUE;