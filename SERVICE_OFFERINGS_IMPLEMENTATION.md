# Service Offerings & Push Notifications Implementation

Complete implementation summary for service offerings and push notifications in the Duwaz marketplace.

## Overview

This feature allows service providers (hairdressers, tutors, consultants, etc.) to list services alongside physical products. Service transactions skip payment and go directly to messaging for negotiation.

Push notifications keep users informed about orders and messages even when not on the website.

## Architecture

### Frontend Components

```
Frontend/
├── pages/
│   ├── ShopDashboardPage.tsx          # SERVICE/PRODUCT toggle when adding products
│   ├── ProductDetailPage.tsx          # Hide quantity, show "Message Seller" for services
│   ├── CartPage.tsx                   # Skip payment for services, redirect to messaging
│   ├── ServiceOrderPage.tsx           # NEW: Service inquiry messaging interface
│   └── AccountPage.tsx                # Notifications tab for push settings
├── components/
│   └── NotificationSettings.tsx       # NEW: Push notification toggle UI
├── hooks/
│   └── usePushNotifications.ts        # NEW: Service worker + notification logic
└── public/
    └── service-worker.js              # NEW: Background notification handler
```

### Backend Components

```
Backend/
├── controller/
│   └── NotificationController.java    # NEW: Subscription/notification endpoints
├── service/
│   └── PushNotificationService.java   # NEW: Notification delivery logic
├── repo/
│   └── PushSubscriptionRepository.java # NEW: Database queries
├── dto/
│   ├── PushSubscriptionDto.java       # NEW: Subscription payload
│   └── PushNotificationDto.java       # NEW: Notification payload
├── classesFolder/
│   └── PushSubscription.java          # NEW: Entity for storing subscriptions
└── migration_add_push_subscriptions.sql # NEW: Database schema
```

## Features Implemented

### 1. Service Offerings (Frontend)

**ShopDashboardPage.tsx**
```typescript
// Added to ProductFormData interface
productType: 'PRODUCT' | 'SERVICE'

// UI Changes:
// - Radio/toggle for PRODUCT vs SERVICE
// - Hide stock quantity field for services
// - Hide image upload for services
// - Services validated without images/stock
```

**ProductDetailPage.tsx**
```typescript
// For SERVICE type:
// ✓ Hide quantity selector (services are 1-off)
// ✓ Replace "Add to Cart" with blue "Message Seller" button
// ✓ No stock display
// ✓ Clicking button → /service-order/{shopId}
```

**CartPage.tsx**
```typescript
// For SERVICE items in cart:
// ✓ Hide delivery address section
// ✓ Hide payment method selector
// ✓ Show "Message Seller About Service" button
// ✓ onClick: redirect to /service-order/{shopId}
// ✓ Clear cart after redirecting
```

**ServiceOrderPage.tsx** (NEW)
```typescript
// Service transaction interface:
// ✓ Display shop info and logo
// ✓ Pre-fill service items and pricing
// ✓ Auto-generate inquiry message template
// ✓ Messaging form to contact seller
// ✓ Send via existing StoreMessage API
// ✓ Redirect to marketplace after sending
```

### 2. Push Notifications (Frontend)

**NotificationSettings.tsx** (NEW)
```typescript
// UI for enabling/disabling notifications
// ✓ Show subscription status
// ✓ Request browser permission
// ✓ Subscribe/unsubscribe toggle
// ✓ Integration with usePushNotifications hook
// ✓ Added to AccountPage → Notifications tab
```

**usePushNotifications.ts** (NEW)
```typescript
// Hook managing push notification logic
// ✓ Check browser support (Chrome, Firefox, etc.)
// ✓ Register service worker at /service-worker.js
// ✓ Request notification permission
// ✓ Subscribe to push (POST /api/notifications/subscribe)
// ✓ Unsubscribe (POST /api/notifications/unsubscribe)
// ✓ Show local notifications (for testing)
// ✓ Send subscription endpoint to backend
```

**service-worker.js** (NEW)
```javascript
// Background notification handler
// ✓ Listen for push events
// ✓ Parse notification data
// ✓ Display notification with title, body, icon
// ✓ Handle notification clicks
// ✓ Route to order tracking or messages page
// ✓ Handle notification close events
```

### 3. Push Notifications (Backend)

**NotificationController.java** (NEW)
```java
// REST Endpoints:
// POST /api/notifications/subscribe
//   - Accepts PushSubscriptionDto with endpoint + VAPID keys
//   - Stores subscription for user
//   - Returns success response

// POST /api/notifications/unsubscribe
//   - Accepts endpoint
//   - Removes subscription from database
//   - Returns success response

// POST /api/notifications/send
//   - Accepts PushNotificationDto
//   - Sends to specific user
//   - For admin/system use

// GET /api/notifications/health
//   - Health check endpoint
```

**PushNotificationService.java** (NEW)
```java
// Notification management logic:
// ✓ subscribe(userId, subscription)
//   - Store subscription endpoint in database
//   - Handle duplicate subscriptions

// ✓ unsubscribe(endpoint)
//   - Remove subscription from database

// ✓ sendNotificationToStudent(userId, notification)
//   - Find all subscriptions for user
//   - Send to each active subscription
//   - Handle expired endpoints (mark inactive)

// ✓ sendBroadcastNotification(notification)
//   - Send to all subscribed users

// ✓ cleanupInactiveSubscriptions()
//   - Remove subscriptions inactive >30 days
//   - Scheduled cleanup job ready
```

**PushSubscription.java** (NEW)
```java
// Database entity for storing push subscriptions
// Fields:
// - id: primary key
// - student: FK to student table
// - endpoint: push service URL (unique)
// - p256dhKey: VAPID public key (base64)
// - authKey: VAPID auth secret (base64)
// - subscribedAt: timestamp
// - lastActive: timestamp of last push
// - active: boolean for soft delete
```

**PushSubscriptionRepository.java** (NEW)
```java
// Database queries:
// - findByStudentAndActiveTrue(Student)
// - findByActiveTrue()
// - findByEndpoint(String)
// - deleteByEndpoint(String)
```

**DTOs**
```java
// PushSubscriptionDto
// - endpoint: String
// - keys: { p256dh, auth }

// PushNotificationDto
// - title: String
// - body: String
// - type: String (order, message, reward, etc.)
// - targetId: Long (orderId, messageId)
// - recipientId: Long (studentId)
```

**migration_add_push_subscriptions.sql**
```sql
-- Creates push_subscriptions table
-- Indexes on student_id, endpoint, active status
-- Foreign key constraint to student table
-- Cascade delete on student removal
```

## Database Schema

### Product Table
```sql
ALTER TABLE product ADD COLUMN IF NOT EXISTS 
  product_type VARCHAR(50) DEFAULT 'PRODUCT';
-- Values: 'PRODUCT' or 'SERVICE'
```

### Push Subscriptions Table
```sql
CREATE TABLE push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT,
  auth_key TEXT,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_push_subscriptions_student_active ON push_subscriptions(student_id, active);
CREATE INDEX idx_push_subscriptions_active ON push_subscriptions(active);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
```

## API Endpoints

### Notifications (New)

```
POST /api/notifications/subscribe
  Authorization: Bearer {token}
  Body: {
    endpoint: "https://push.service.com/...",
    keys: {
      p256dh: "...",
      auth: "..."
    }
  }
  Response: { message: "Successfully subscribed to notifications" }

POST /api/notifications/unsubscribe
  Authorization: Bearer {token}
  Body: {
    endpoint: "https://push.service.com/..."
  }
  Response: { message: "Successfully unsubscribed from notifications" }

POST /api/notifications/send
  Authorization: Bearer {token}
  Body: {
    title: "Order #123",
    body: "Your order has been confirmed",
    type: "order",
    targetId: 123,
    recipientId: 456
  }
  Response: { message: "Notification sent" }

GET /api/notifications/health
  Response: { message: "Notification service is running" }
```

### Products (Modified)

```
POST /api/products
  Body: {
    ...,
    productType: "SERVICE"  // NEW: optional, defaults to "PRODUCT"
  }
```

## Data Flow Diagrams

### Service Transaction Flow

```
Customer → Browse Services → View Detail → Message Seller
     ↓
  ServiceOrderPage (pre-filled with service)
     ↓
  Compose inquiry message
     ↓
  POST /api/messages/send
     ↓
  Clear cart, redirect to marketplace
     ↓
Seller receives notification about new message
```

### Push Notification Flow

```
User Account Page → Enable Notifications
     ↓
Browser permission prompt
     ↓
POST /api/notifications/subscribe + endpoint
     ↓
Backend stores PushSubscription
     ↓
Event occurs (order placed, message received)
     ↓
Backend: POST /api/notifications/send to user
     ↓
Service Worker receives push event
     ↓
Show notification (even if tab closed)
     ↓
User clicks → navigate to relevant page
```

## Configuration Required

### Environment Variables
```
VITE_API_URL=http://localhost:8080  # Frontend
```

### Backend
```
# Spring Boot (application.properties)
# Add any VAPID configuration when implementing WebPush

# Database
# Run migration_add_push_subscriptions.sql
# Run migration_add_product_type.sql (if not done)
```

### Service Worker
```
# Must be served from /service-worker.js
# Automatically registered by usePushNotifications hook
```

## Testing Guide

See **TESTING_SERVICE_OFFERINGS.md** for:
- Test scenarios (9 complete scenarios)
- Browser compatibility testing
- Troubleshooting guide
- Success criteria
- Performance testing
- Security checklist

## Limitations & Future Improvements

### Current Limitations
1. **No actual push delivery**: Backend prepared to send, but WebPush library not integrated yet
2. **No VAPID keys**: Need to generate and store VAPID keys for production
3. **No notification preferences**: Users get all notification types
4. **No cleanup job**: Inactive subscription cleanup not scheduled

### Future Enhancements
1. **WebPush Integration**: Use `web-push` library or Spring WebPush to actually deliver push notifications
2. **VAPID Configuration**: Set up VAPID key generation and management
3. **Notification Preferences**: Let users choose which notifications to receive
4. **Scheduled Cleanup**: Add @Scheduled cleanup of inactive subscriptions (>30 days)
5. **Notification Analytics**: Track open rates, click rates, delivery failures
6. **Rich Notifications**: Add images, actions (reply, accept, reject) to notifications
7. **Service Booking**: Add calendar/scheduling for service providers
8. **Rating Services**: Extend review system to services
9. **Service Categories**: Create dedicated service categories

## Migration Checklist

- [ ] Run product_type column migration
- [ ] Run push_subscriptions table migration
- [ ] Restart backend (loads new controller/service)
- [ ] Verify service-worker.js deployed to public folder
- [ ] Test service creation in shop dashboard
- [ ] Test service browsing in marketplace
- [ ] Test "Message Seller" flow
- [ ] Test push notification enable/disable
- [ ] Monitor backend logs for errors
- [ ] Verify database schema with `\dt push_subscriptions`

## Security Considerations

- ✅ JWT token validation in all notification endpoints
- ✅ Users can only see their own subscriptions
- ✅ Endpoint URL is unique (prevents duplicate subscriptions)
- ✅ Soft delete of subscriptions (never delete history)
- ⚠️ VAPID keys management needed (store securely)
- ⚠️ HTTPS required in production
- ⚠️ Add rate limiting for notification sending

## Support & Debugging

### Common Issues & Solutions

**Service not showing "Message Seller" button**
→ Check if `product_type` is set to 'SERVICE' in database

**Push notifications not subscribing**
→ Check browser console for permission errors
→ Verify `/api/notifications/subscribe` returns 200

**Service Worker not registering**
→ Verify `/service-worker.js` file exists
→ Check browser DevTools → Application → Service Workers
→ HTTPS required (or localhost for dev)

**Backend errors**
→ Check logs for `JwtTokenProvider` initialization
→ Verify repositories auto-wired correctly
→ Check database migration ran successfully

## Code Quality

- ✅ Error handling in all controllers
- ✅ Logging for debugging
- ✅ Database transactions for consistency
- ✅ Type safety (TypeScript frontend, Java backend)
- ✅ Reusable components (NotificationSettings)
- ✅ Separated concerns (service/repo/controller)
- ⚠️ Add unit tests for PushNotificationService
- ⚠️ Add integration tests for NotificationController

## Commit History

```
efbab1f9 - feat: Add backend push notification endpoints and services
cf944fb6 - feat: Implement browser push notifications (service worker + notification API)
88e4a9da - feat: Create ServiceOrderPage for service transactions
d265a94e - feat: Handle SERVICE items in CartPage
f877891e - feat: Handle SERVICE type in ProductDetailPage
d4dd52c3 - feat: Add SERVICE type toggle to product form
```

## Contributing Guidelines

When adding new notification types:
1. Add to `type` field in `PushNotificationDto`
2. Update service worker routing logic
3. Add test scenario to TESTING_SERVICE_OFFERINGS.md
4. Document in this file

When modifying service flow:
1. Update ServiceOrderPage if needed
2. Maintain backward compatibility
3. Update tests
4. Document changes here
