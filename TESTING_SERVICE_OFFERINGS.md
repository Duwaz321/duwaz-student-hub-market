# Testing Service Offerings & Push Notifications

Complete testing guide for the new service offerings and push notifications features in Duwaz marketplace.

## Prerequisites

- Backend running on `http://localhost:8080`
- Frontend running on development server
- Supabase database set up
- Two test accounts (service provider and customer)
- Browser with push notification support (Chrome, Firefox, Edge, Safari)

## Test Environment Setup

### 1. Database Migration

Run the following SQL commands in your Supabase database:

```sql
-- Add product_type column to product table (if not already done)
ALTER TABLE product ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'PRODUCT';

-- Create push_subscriptions table
CREATE TABLE push_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT,
    auth_key TEXT,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_push_subscriptions_student 
        FOREIGN KEY (student_id) 
        REFERENCES student(student_id) 
        ON DELETE CASCADE
);

CREATE INDEX idx_push_subscriptions_student_active 
    ON push_subscriptions(student_id, active);
CREATE INDEX idx_push_subscriptions_active 
    ON push_subscriptions(active);
CREATE INDEX idx_push_subscriptions_endpoint 
    ON push_subscriptions(endpoint);
```

### 2. Backend Setup

- Ensure `JwtTokenProvider` is available in your security config
- Restart backend to load new controller and service
- Verify `NotificationController` is loaded by checking logs

### 3. Frontend Setup

- Service Worker will auto-register at `/service-worker.js`
- Clear localStorage/sessionStorage for clean state
- Open DevTools console to see logs

---

## Testing Scenarios

### Scenario 1: Service Provider Creates a Service

**Goal**: Verify that service providers can create services instead of physical products.

**Steps**:
1. Log in as a service provider (shop owner)
2. Navigate to **Shop Dashboard** → **Add Product**
3. Fill in basic fields:
   - Name: "Website Design Consultation"
   - Price: 250.00
   - Description: "1-hour consultation for web design projects"
   - Category: Any category
4. **Toggle SERVICE instead of PRODUCT** (look for radio button/toggle near product type)
5. Notice that:
   - Stock quantity field is **hidden** (services don't need stock)
   - Image upload field is **hidden** (services don't require images)
6. Submit the form
7. **Expected Result**: Service is created and appears in the shop's product list

**Verification**:
- Check shop dashboard products list - service should appear
- Service should have `product_type: 'SERVICE'` in database
- No image or stock fields should be populated

---

### Scenario 2: Customer Browses and Discovers Service

**Goal**: Verify that services are visible in the marketplace with proper UI.

**Steps**:
1. Log in as a customer
2. Go to **Marketplace** → browse products
3. Find the service created in Scenario 1
4. Notice the service listing:
   - Service name is displayed
   - Price is shown
   - Description is visible
5. Click on the service
6. **Expected Result**: ProductDetailPage loads service

**Verification**:
- Service appears in marketplace category
- Service card/detail shows all information
- No stock quantity displayed
- No delivery address form (for services)

---

### Scenario 3: Customer Views Service Details & Messages Seller

**Goal**: Verify service detail page shows "Message Seller" instead of "Add to Cart".

**Steps**:
1. On the service detail page, notice:
   - **No quantity selector** (services are 1-off, no quantity needed)
   - **"Message Seller" button** (blue button, not brown "Add to Cart")
   - No stock information displayed
2. Click **"Message Seller"** button
3. **Expected Result**: Redirected to service order page with service pre-filled

**Verification**:
- Quantity controls are hidden
- Button text says "Message Seller"
- Button color is blue (distinct from product button)
- Button redirects to `/service-order/{shopId}`

---

### Scenario 4: Customer Adds Service to Cart (Edge Case)

**Goal**: Verify cart shows "Message About Service" for checkout.

**Steps**:
1. If user tries to add service via API or alternative means
2. View cart page with service items
3. Notice:
   - **Delivery address section is hidden**
   - **Payment method selector is hidden**
   - **Checkout button says "Message Seller About Service"**
   - Total shows but no payment methods

**Verification**:
- Address fields gone
- Payment options (Collection, Cash, Online) all hidden
- Button redirects to messaging instead of payment

---

### Scenario 5: Service Inquiry Flow (Full Service Transaction)

**Goal**: Verify complete service transaction flow from cart → messaging.

**Steps**:
1. Customer goes to service detail page
2. Clicks "Message Seller"
3. On ServiceOrderPage, verify:
   - Shop info card displays seller details
   - Service items are pre-filled and listed
   - Message template is auto-generated
   - Blue information banner explains service transaction
4. Edit the message if needed
5. Click **"Send Message"** button
6. **Expected Result**: 
   - Message sent to seller
   - Toast shows "✅ Message sent!"
   - Redirected to marketplace
   - Cart is cleared

**Verification**:
- Message API call succeeds (`/api/messages/send`)
- No payment processing attempted
- Cart cleared after sending
- User redirected correctly

---

### Scenario 6: Push Notification Subscription

**Goal**: Verify users can enable/disable push notifications.

**Steps**:
1. Log in as any user
2. Go to **Account** → **Notifications** tab
3. Click **"Enable"** button to subscribe
4. **Expected Result**:
   - Browser asks for notification permission
   - Toast shows "✅ Notifications enabled!"
   - Test notification appears
   - Button changes to "Disable"

**Verification**:
- Browser permission prompt appears
- `/api/notifications/subscribe` POST succeeds
- `PushSubscription` row created in database
- Service Worker registered
- Test notification displayed

---

### Scenario 7: Push Notification Unsubscribe

**Goal**: Verify users can disable notifications.

**Steps**:
1. User with notifications enabled
2. Go to **Account** → **Notifications** tab
3. Click **"Disable"** button
4. **Expected Result**:
   - Toast shows "Notifications disabled"
   - Button changes to "Enable"
   - Subscription removed from backend

**Verification**:
- `/api/notifications/unsubscribe` POST succeeds
- `PushSubscription` row deleted or marked inactive
- Button state updates correctly

---

### Scenario 8: Order Notification Flow

**Goal**: Verify push notifications are sent when orders are placed.

**Setup**:
1. Customer has notifications enabled
2. Seller has notifications enabled

**Steps**:
1. Customer places a physical product order (Collection/Cash delivery)
2. Check backend logs - service should send notification
3. **Expected Result**: 
   - Seller receives push notification about new order
   - Notification title: "New Order"
   - Notification body shows order details
   - Clicking notification opens order tracking page

**Verification**:
- `/api/notifications/send` called after order creation
- `PushSubscription` endpoints are in database
- Service Worker receives push event
- Notification appears even if tab is inactive

---

### Scenario 9: Message Notification Flow

**Goal**: Verify push notifications sent for new messages.

**Setup**:
1. Both service provider and customer have notifications enabled

**Steps**:
1. Customer sends service inquiry via ServiceOrderPage
2. Seller sees message notification
3. **Expected Result**:
   - Push notification about new message
   - Notification title: "New Message"
   - Notification body shows sender name and preview
   - Clicking notification opens admin/messages page

**Verification**:
- Notification received
- Notification data includes `type: 'message'`
- Clicking navigates to message page

---

## Browser Compatibility Testing

### Desktop Browsers
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if VAPID configured)
- [ ] Edge

### Mobile Browsers
- [ ] Chrome Android
- [ ] Firefox Android
- [ ] Safari iOS (limited support)

### Features to Verify per Browser
- [ ] Service Worker registration
- [ ] Notification permission prompt
- [ ] Push notification display
- [ ] Notification click handling
- [ ] Background notification display

---

## Troubleshooting

### Issue: Service Worker Not Registered

**Solution**:
```javascript
// Check in browser DevTools Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Active registrations:', regs);
});
```

**Common Causes**:
- HTTPS required (or localhost for dev)
- Service Worker file not found at `/service-worker.js`
- CORS issues

### Issue: Notifications Not Appearing

**Solution**:
1. Check notification permission: `Notification.permission`
2. Verify backend push delivery
3. Check service worker logs
4. Verify endpoint in database

### Issue: "Message Seller" Button Not Showing

**Solution**:
1. Verify product has `product_type: 'SERVICE'`
2. Check browser console for errors
3. Verify ProductDetailPage imports `MessageCircle` icon
4. Check CartItem type includes `productType` field

### Issue: Backend Compilation Errors

**Solution**:
1. Ensure `JwtTokenProvider` exists in security package
2. Check repository interfaces match entity
3. Run Maven clean build:
   ```bash
   mvn clean install
   ```

---

## Performance Testing

### Load Testing
- [ ] Test 100 concurrent notifications
- [ ] Verify subscription cleanup performance
- [ ] Check database index effectiveness

### Memory Leaks
- [ ] Monitor service worker memory
- [ ] Check for subscription cleanup in frontend
- [ ] Verify notification listeners removed on unsubscribe

---

## Security Checklist

- [ ] JWT token validation in NotificationController
- [ ] Subscription endpoint is HTTPS-only in production
- [ ] User can only see their own subscriptions
- [ ] Admin can't send notifications to arbitrary users without proper checks
- [ ] VAPID keys properly managed (if using WebPush)
- [ ] Service Worker doesn't expose sensitive data

---

## Success Criteria

✅ **All tests pass when:**

1. Services can be created by shop owners (toggle works)
2. Services appear in marketplace with correct UI
3. Customers can message sellers via "Message Seller" button
4. Service transactions skip payment and go to messaging
5. Users can enable/disable push notifications
6. Push notifications appear on orders and messages
7. Cross-browser compatibility verified
8. No errors in console logs
9. Database schema created properly
10. Backend endpoints responding correctly

---

## Rollback Plan

If issues encountered:

```sql
-- Rollback: Remove push_subscriptions table
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Rollback: Remove product_type column
ALTER TABLE product DROP COLUMN IF EXISTS product_type;
```

Revert commits:
```bash
git reset --hard HEAD~1  # Go back one commit
```

---

## Next Steps

- [ ] Implement VAPID keys for production push
- [ ] Add WebPush library for actual push delivery
- [ ] Integrate order status notifications
- [ ] Add notification preferences (notification types to receive)
- [ ] Analytics: Track notification open rates
- [ ] Cleanup: Expired subscription cleanup job (scheduled task)
