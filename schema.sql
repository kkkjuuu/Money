CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS transactions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    type VARCHAR(20) NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    reason TEXT,

    created_at TIMESTAMP DEFAULT NOW()

);