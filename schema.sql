CREATE TABLE IF NOT EXISTS app_user (
    id INTEGER PRIMARY KEY,
    display_name VARCHAR(120) NOT NULL,
    coin_balance INTEGER NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    source_id VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    merchant VARCHAR(180) NOT NULL,
    category VARCHAR(80),
    amount NUMERIC(15, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(16) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    payment_method VARCHAR(40) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_source_id ON transactions (source_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions (amount);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_lower ON transactions (LOWER(merchant));

CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(300) NOT NULL,
    coin_cost INTEGER NOT NULL CHECK (coin_cost > 0),
    reward_type VARCHAR(40) NOT NULL,
    value_inr NUMERIC(12, 2) NOT NULL CHECK (value_inr > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS redemptions (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES app_user(id),
    reward_id VARCHAR(50) NOT NULL REFERENCES rewards(id),
    coins_spent INTEGER NOT NULL CHECK (coins_spent > 0),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
