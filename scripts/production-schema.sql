-- Production database schema for tgBTC Request & Pay

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(255) UNIQUE,
    telegram_user_id BIGINT UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment requests table
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_address VARCHAR(255) NOT NULL,
    receiver_address VARCHAR(255),
    amount DECIMAL(20, 8) NOT NULL,
    message TEXT,
    contract_address VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'deployed', 'paid', 'completed', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    transaction_hash VARCHAR(255)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    request_id UUID,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    token_type VARCHAR(10) DEFAULT 'tgBTC',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    block_number BIGINT,
    gas_used DECIMAL(20, 8),
    gas_price DECIMAL(20, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_request FOREIGN KEY (request_id) REFERENCES payment_requests(id)
);

-- Contract deployments table
CREATE TABLE IF NOT EXISTS contract_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL,
    contract_address VARCHAR(255) UNIQUE NOT NULL,
    deployer_address VARCHAR(255) NOT NULL,
    deployment_hash VARCHAR(255),
    deployment_cost DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'deploying' CHECK (status IN ('deploying', 'deployed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_deployment_request FOREIGN KEY (request_id) REFERENCES payment_requests(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(255),
    telegram_user_id BIGINT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    network VARCHAR(20) NOT NULL,
    master_contract_address VARCHAR(255),
    telegram_bot_token VARCHAR(100),
    app_url VARCHAR(255),
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'failed', 'deprecated')),
    error_message TEXT,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitoring configuration table
CREATE TABLE IF NOT EXISTS monitoring_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_contract_address VARCHAR(255),
    telegram_bot_token VARCHAR(100),
    app_url VARCHAR(255),
    check_interval_minutes INTEGER DEFAULT 5,
    alert_thresholds JSONB,
    notification_channels JSONB,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_sender ON payment_requests(sender_address);
CREATE INDEX IF NOT EXISTS idx_payment_requests_receiver ON payment_requests(receiver_address);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_requests_expires_at ON payment_requests(expires_at);

CREATE INDEX IF NOT EXISTS idx_transactions_request_id ON transactions(request_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_telegram_user_id ON notifications(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_user_id ON profiles(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_address ON profiles(address);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_requests_updated_at ON payment_requests;
CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON payment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (only if tables are empty)
INSERT INTO profiles (address, telegram_user_id, username, first_name) 
SELECT 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', 123456789, 'alice_crypto', 'Alice'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE telegram_user_id = 123456789);

INSERT INTO profiles (address, telegram_user_id, username, first_name) 
SELECT 'EQD__________________________________________0vo', 987654321, 'bob_btc', 'Bob'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE telegram_user_id = 987654321);

INSERT INTO profiles (address, telegram_user_id, username, first_name) 
SELECT 'EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y', 555666777, 'charlie_ton', 'Charlie'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE telegram_user_id = 555666777);

-- Insert sample payment requests (only if table is empty)
INSERT INTO payment_requests (sender_address, receiver_address, amount, message, status) 
SELECT 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', 'EQD__________________________________________0vo', 0.001, 'Coffee payment', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM payment_requests);

INSERT INTO payment_requests (sender_address, receiver_address, amount, message, status) 
SELECT 'EQD__________________________________________0vo', 'EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y', 0.0025, 'Lunch split', 'completed'
WHERE NOT EXISTS (SELECT 1 FROM payment_requests WHERE amount = 0.0025);

INSERT INTO payment_requests (sender_address, receiver_address, amount, message, status) 
SELECT 'EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y', 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', 0.005, 'Weekly payment', 'expired'
WHERE NOT EXISTS (SELECT 1 FROM payment_requests WHERE amount = 0.005);

SELECT 'Production database schema created successfully!' as message;
