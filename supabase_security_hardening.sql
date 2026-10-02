-- DUWAZ production database hardening
-- Review in Supabase SQL Editor before running. Every statement is idempotent.

-- Service-message threads and sender identity.
ALTER TABLE store_messages
    ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES student(id),
    ADD COLUMN IF NOT EXISTS conversation_root_id BIGINT REFERENCES store_messages(id),
    ADD COLUMN IF NOT EXISTS from_customer BOOLEAN NOT NULL DEFAULT FALSE;

-- Payment webhook idempotency and lookup.
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS yoco_checkout_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS yoco_webhook_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_yoco_webhook_id
    ON orders (yoco_webhook_id)
    WHERE yoco_webhook_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_student_date
    ON orders (student_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_business_date
    ON orders (business_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date
    ON orders (status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_yoco_checkout
    ON orders (yoco_checkout_id);

CREATE INDEX IF NOT EXISTS idx_store_messages_business_sent
    ON store_messages (business_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_messages_customer_sent
    ON store_messages (customer_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_messages_status_sent
    ON store_messages (status, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_store_messages_root_sent
    ON store_messages (conversation_root_id, sent_at ASC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_push_subscriptions_endpoint
    ON push_subscriptions (endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_student_active
    ON push_subscriptions (student_id, active);

-- RLS is intentionally not enabled by this script: the application uses its
-- own JWT authentication rather than Supabase Auth (auth.uid()). Add policies
-- only after mapping authenticated Supabase identities to student.id, and test
-- every backend query with the service role and the public client separately.

-- Retention review query. Do not delete automatically until legal retention
-- periods and dispute/accounting requirements are approved.
-- SELECT COUNT(*) AS old_resolved_messages
-- FROM store_messages
-- WHERE status = 'RESOLVED'
--   AND sent_at < NOW() - INTERVAL '24 months';
