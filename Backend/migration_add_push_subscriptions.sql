-- Migration: Add push_subscriptions table for storing user push notification subscriptions

CREATE TABLE push_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT,
    auth_key TEXT,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Foreign key constraint
    CONSTRAINT fk_push_subscriptions_student 
        FOREIGN KEY (student_id) 
        REFERENCES student(student_id) 
        ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_push_subscriptions_student_active 
    ON push_subscriptions(student_id, active);

CREATE INDEX idx_push_subscriptions_active 
    ON push_subscriptions(active);

CREATE INDEX idx_push_subscriptions_endpoint 
    ON push_subscriptions(endpoint);

-- Add comment for clarity
COMMENT ON TABLE push_subscriptions IS 'Stores push notification subscriptions for users. Each row represents a browser/device that has subscribed to push notifications.';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'The push service endpoint URL provided by the browser';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'VAPID public key for encryption (base64 encoded)';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication secret for VAPID (base64 encoded)';
COMMENT ON COLUMN push_subscriptions.subscribed_at IS 'Timestamp when the subscription was created';
COMMENT ON COLUMN push_subscriptions.last_active IS 'Last time a push was sent to this subscription';
COMMENT ON COLUMN push_subscriptions.active IS 'Whether this subscription is still valid (inactive if endpoint expired)';
