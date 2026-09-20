# DUWAZ Security Hardening Notes

This document captures the core production-hardening changes applied for the current application while preserving the existing architecture and stack.

## Scope

- Spring Boot API backend
- React + Vite frontend
- PostgreSQL via Supabase
- Yoco payment gateway
- Resend OTP email flows
- Vercel + Render deployment

## High-priority changes implemented

### 1. Secrets are now environment driven

The application no longer relies on embedded secrets in source-controlled config files.

Required environment variables:

- DATABASE_URL
- DB_USERNAME
- DB_PASSWORD
- JWT_SECRET
- JWT_EXPIRATION
- SMTP_HOST
- SMTP_PORT
- SMTP_USERNAME
- SMTP_PASSWORD
- RESEND_API_KEY
- AT_USERNAME
- AT_API_KEY
- YOCO_SECRET_KEY
- FRONTEND_URL
- SENTRY_DSN
- APP_ENVIRONMENT
- GOOGLE_MAPS_ENABLED
- GOOGLE_MAPS_API_KEY

The backend will fail fast at startup if the JWT secret is missing or too short.

### 2. JWT configuration is enforced

- Missing JWT secret is rejected at startup.
- Secret length validation prevents weak or truncated signing keys.
- Tokens remain signed with HMAC-SHA and server-side validation is used before authentication.

### 3. CORS is restricted

The application uses the centralized CORS configuration in SecurityConfig instead of wildcard origins on individual controllers.

Allowed origins are intentionally limited to:

- http://localhost:5173
- http://localhost:5174
- http://localhost:8081
- http://localhost:3000
- https://duwaz.co.za
- https://www.duwaz.co.za

### 4. Security headers are enabled

The backend now applies the following protections:

- HSTS with subdomain inclusion and preload
- frame options deny
- content security policy
- strict-origin referrer policy

### 5. Input validation was tightened

The following DTOs now validate incoming data before processing:

- RegisterRequest
- PaymentInitiateRequest

Validation includes email format enforcement, password length checks, required fields, and positive item quantities.

### 6. Sensitive mailer defaults were removed

The default SMTP username/password placeholders were replaced with environment-driven values so the app no longer ships with fake production credentials.

## Remaining operational recommendations

These are the most important follow-ups before production release:

1. Rotate and store the production JWT secret in your deployment secret manager.
2. Provision PostgreSQL credentials in Render/Supabase and never commit them to source control.
3. Set the correct Yoco webhook secret / verification strategy and validate webhook signatures.
4. Restrict Supabase storage and database access with least-privilege policies.
5. Configure rate limiting and brute-force protection on login and OTP endpoints.
6. Enable HTTPS-only deployment and TLS certificate management for all DNS endpoints.
7. Verify that frontend and API domains are consistent across Vercel and Render.
8. Review the full production environment for legacy secrets in build artifacts and deployment logs.

## Manual deployment checklist

- [ ] Set all env vars in Render/Vercel
- [ ] Configure production DB credentials
- [ ] Configure JWT secret with a 32+ byte value
- [ ] Configure Yoco API key and webhook verification
- [ ] Set correct frontend URL
- [ ] Verify Supabase RLS and access policies
- [ ] Confirm outgoing email service configuration
- [ ] Test login, registration, OTP, and payment endpoints in staging
- [ ] Review audit logs and failed-auth monitoring
