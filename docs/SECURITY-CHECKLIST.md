# DUWAZ Security Checklist

## Configuration and secrets

- [ ] JWT_SECRET is set in the deployment environment
- [ ] DATABASE_URL / DB_USERNAME / DB_PASSWORD are set in the production environment
- [ ] SMTP_USERNAME and SMTP_PASSWORD are configured for the chosen mail provider
- [ ] YOCO_SECRET_KEY is configured for live payments
- [ ] FRONTEND_URL matches the production frontend domain
- [ ] SENTRY_DSN is set only if error reporting is active
- [ ] No hardcoded production credentials remain in source-controlled config files

## API security

- [ ] CORS is restricted to known production origins
- [ ] Authentication is required for protected user endpoints
- [ ] Public endpoints are explicitly whitelisted only where needed
- [ ] Webhook endpoints are verified and protected from replay or tampering
- [ ] Failed login and OTP flows are rate-limited
- [ ] Input validation is enforced on request DTOs
- [ ] Security headers are enabled through the backend runtime configuration

## Authentication and authorization

- [ ] Passwords are hashed with BCrypt
- [ ] Email verification is enforced before login for customer accounts
- [ ] Driver and student roles are checked before privileged actions
- [ ] Order and payment ownership checks exist before mutation
- [ ] Admin-only endpoints reject unauthorized callers

## Payment and external services

- [ ] Yoco payment session is created with valid metadata
- [ ] Webhook payload validation is implemented before marking payments as paid
- [ ] Duplicate webhook events are handled safely
- [ ] Payment state transitions are not allowed to be tampered with without verification
- [ ] Transaction reconciliation logic is reviewed for revenue-split correctness

## Data and infrastructure

- [ ] Supabase RLS is enabled and checked
- [ ] Storage policies restrict user access to their own files
- [ ] Database credentials are not embedded in application artifacts
- [ ] TLS is enforced on all public endpoints
- [ ] DNS and certificate configuration are verified
- [ ] Production logs do not expose tokens, raw passwords, or payment data

## Verification

- [ ] Application builds successfully after security changes
- [ ] Security tests are run for authentication and payment edge cases
- [ ] Manual smoke test confirms the app works in a staging deployment
- [ ] Incident response and alerting paths are documented
