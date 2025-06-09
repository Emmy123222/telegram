-- Production database schema for tgBTC Request & Pay

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address VARCHAR(255) UNIQUE NOT NULL,
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
CREATE TABLE payment_requests (
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
    transaction_hash VARCHAR(255),
    
    -- Foreign key constraints
    CONSTRAINT fk_sender FOREIGN KEY (sender_address) REFERENCES profiles(address),
    CONSTRAINT fk_receiver FOREIGN KEY (receiver_address) REFERENCES profiles(address)
);

-- Transactions table
CREATE TABLE transactions (
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
    CONSTRAINT fk_request FOREIGN KEY (request_id) REFERENCES payment_requests(id),
    CONSTRAINT fk_from_profile FOREIGN KEY (from_address) REFERENCES profiles(address),
    CONSTRAINT fk_to_profile FOREIGN KEY (to_address) REFERENCES profiles(address)
);

-- Contract deployments table
CREATE TABLE contract_deployments (
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
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_notification_user FOREIGN KEY (user_address) REFERENCES profiles(address)
);

-- Create indexes for better performance
CREATE INDEX idx_payment_requests_sender ON payment_requests(sender_address);
CREATE INDEX idx_payment_requests_receiver ON payment_requests(receiver_address);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_at ON payment_requests(created_at);
CREATE INDEX idx_payment_requests_expires_at ON payment_requests(expires_at);

CREATE INDEX idx_transactions_request_id ON transactions(request_id);
CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_notifications_user_address ON notifications(user_address);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON payment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO profiles (address, telegram_user_id, username, first_name) VALUES
('EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', 123456789, 'alice_crypto', 'Alice'),
('EQD__________________________________________0vo', 987654321, 'bob_btc', 'Bob'),
('EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y', 555666777, 'charlie_ton', 'Charlie');

-- Insert sample payment requests
INSERT INTO payment_requests (sender_address, receiver_address, amount, message, status) VALUES
('EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', 'EQD__________________________________________0vo', 0.001, 'Coffee payment', 'pending'),
('EQD__________________________________________0vo', 'EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y', 0.0025, 'Lunch split', 'completed'),
('EQAvDfWFG0oYX19jwNDNBBL1rKNT9XfaGP9HyTb5nb2Eml6y', 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG', 0.005, 'Weekly payment', 'expired');

SELECT 'Production database schema created successfully!' as message;
