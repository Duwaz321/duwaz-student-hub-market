# 🧪 End-to-End Testing Checklist

**Goal:** Verify all critical features work after fixes:
- Login flow
- Product marketplace
- Admin dashboard
- Shop dashboard
- Service listings & management
- Messaging on transactions
- Admin notifications

---

## 1️⃣ **Authentication & Login**

- [ ] **Regular customer login**
  - Email: `student@duwaz.co.za`
  - Check redirect to marketplace
  - Verify token stored in localStorage
  
- [ ] **Admin login**
  - Email: `admin@duwaz.co.za`
  - Check redirect to admin dashboard
  - Verify admin role loaded

- [ ] **Error handling**
  - Wrong password → error toast
  - Invalid email → error toast
  - Network error → error toast

---

## 2️⃣ **Marketplace (Products)**

- [ ] **Products load**
  - Navigate to `/marketplace` or `/`
  - Should see products in grid (not 500 errors)
  - Should see product images, names, prices
  - Check browser console for fetch errors

- [ ] **Categories filter**
  - Navigate to `/categories`
  - Should see category list
  - Clicking category should filter products
  - Should NOT see "Unexpected token '<', <!DOCTYPE"" errors

- [ ] **Product detail**
  - Click on product
  - Should see full product info
  - Add to cart should work

- [ ] **Search functionality**
  - Search bar should filter products
  - Results update in real-time

---

## 3️⃣ **Services Listing**

- [ ] **Services page loads**
  - Navigate to `/services`
  - Should see services in grid (not 500 errors)
  - Each service should show: name, business, price, "Contact Provider" button

- [ ] **Service categories filter**
  - Category filter on left sidebar
  - Clicking category should filter services
  - "All Services" should show all

- [ ] **Contact provider action**
  - Click "Contact Provider" on a service
  - Should navigate to shop page with service name passed

---

## 4️⃣ **Shop Dashboard (Business Owner)**

**First, create/login to a business account:**

- [ ] **Dashboard loads**
  - Navigate to `/shop/{shopId}`
  - Should see KPI cards: Total Revenue, Orders, Products, etc.
  - No loading spinners stuck

- [ ] **Tabs work**
  - Overview tab shows recent orders & stock alerts
  - Products tab shows all products with edit/delete buttons
  - Orders tab shows all orders with status updates
  - Messages tab shows admin communications

- [ ] **Add Product**
  - Click "Add Product"
  - Fill form: name, price, category, stock, images
  - Click Save
  - Product should appear in Products list

- [ ] **Add Service** (for SERVICE business type)
  - Should have option to add service vs product
  - Service should NOT require stock quantity
  - Service should appear in `/services` page

- [ ] **Order Management**
  - Click order to see details
  - Update status dropdown should work
  - "Forward to Admin" button should send message

- [ ] **Messaging**
  - Click "New Message" tab
  - Send message to admin
  - Should appear in messages list
  - Should NOT return 500 errors

- [ ] **Stock Adjustment**
  - Click "Restock" on a product
  - Adjust stock +/- amount
  - Stock quantity should update

---

## 5️⃣ **Admin Dashboard**

- [ ] **Dashboard loads**
  - Navigate to `/admin`
  - Should see KPI cards: Total Revenue, Orders, Users, etc.
  - Recent orders should display

- [ ] **Orders management**
  - Click on order
  - See order details (items, total, customer)
  - Update order status
  - Assign driver (if delivery required)
  - Send notification to shop

- [ ] **Products monitoring**
  - View all products across all shops
  - See low stock alerts
  - Bulk status changes if available

- [ ] **Message notifications**
  - Should see shop messages
  - Should be able to reply to messages
  - Shop should receive admin reply

- [ ] **Admin notifications**
  - Should receive notification when:
    - New order placed
    - Shop requests delivery (message)
    - Service order created

---

## 6️⃣ **Transaction Flow (Product Order)**

- [ ] **Add product to cart**
  - Click product → Add to cart
  - Cart should update with quantity badge

- [ ] **Checkout**
  - Navigate to `/cart`
  - See all items
  - Select delivery address or collection
  - See total price
  - Place order

- [ ] **Order confirmation**
  - Should see "Order #XXX placed" message
  - Should redirect to order details or marketplace
  - Email/SMS notification should be sent

- [ ] **Shop receives order**
  - Shop owner logs in
  - Should see new PENDING order in Orders tab
  - Should get notification badge on Orders tab

- [ ] **Shop confirms order**
  - Shop updates order status: PENDING → CONFIRMED → PREPARING → READY_FOR_PICKUP
  - Customer can track status in real-time

- [ ] **Delivery request (if applicable)**
  - Shop clicks "Forward to Admin"
  - Admin receives message/notification
  - Admin assigns driver
  - Driver sees delivery task
  - Order status → OUT_FOR_DELIVERY

- [ ] **Messaging on transaction**
  - Any status change should trigger message
  - Admin should see notification
  - Shop should see admin reply

---

## 7️⃣ **Transaction Flow (Service Order)**

- [ ] **Service listing & discovery**
  - Navigate to `/services`
  - Click on service
  - See service details (provider, price, description)

- [ ] **Contact provider**
  - Click "Contact Provider"
  - Navigate to shop page
  - Should see service inquiry in context

- [ ] **Service messaging**
  - Click "New Message" in shop
  - Subject should be pre-filled with service name (if passed)
  - Send message to service provider

- [ ] **Service provider receives message**
  - Log in as service provider
  - Navigate to shop dashboard
  - See new message in Messages tab
  - Should get notification

- [ ] **Service transaction**
  - Should have separate order flow for services (no delivery)
  - Service business marks as "COMPLETED" when done
  - Direct messaging, no driver involved

---

## 8️⃣ **Error Handling & Recovery**

- [ ] **500 errors on endpoints**
  - `/api/products` → Should return JSON (not HTML)
  - `/api/categories` → Should return JSON (not HTML)
  - `/api/health/db` → Should show DB status

- [ ] **Network errors**
  - Slow connection → Shows loading spinner
  - Disconnected → Error toast
  - Reconnect → Data loads

- [ ] **Authorization errors**
  - Access `/admin` without admin role → Should redirect to 403 or home
  - Access `/shop/{id}` without ownership → Should show 404 or error

- [ ] **Error boundaries**
  - Component crash → Should show error page (not blank white screen)
  - Error boundaries should catch in: Admin, Shop Dashboard, Cart

---

## 9️⃣ **WebSocket / Real-Time**

- [ ] **Messaging real-time**
  - Shop sends message to admin
  - Admin dashboard should show new message WITHOUT refresh
  - Admin replies → Shop gets notification

- [ ] **Order updates real-time**
  - Shop updates order status
  - Customer seeing order details should see status update

- [ ] **Typing indicators (if implemented)**
  - When typing in message → Shows "admin is typing..."

---

## 🔟 **Database Connectivity (Supabase)**

- [ ] **Health check endpoint**
  - Open DevTools → Console
  - Run: `fetch('https://api.duwaz.co.za/api/health').then(r => r.json()).then(console.log)`
  - Should return `{"status":"OK"}`

- [ ] **Database connectivity**
  - Run: `fetch('https://api.duwaz.co.za/api/health/db').then(r => r.json()).then(console.log)`
  - Should return `"database": "CONNECTED to Supabase PostgreSQL"`
  - If fails, check Supabase connection string in backend

- [ ] **API endpoints return JSON**
  - `/api/products` → JSON array (not HTML)
  - `/api/categories` → JSON array (not HTML)
  - `/api/services` → JSON paginated response

---

## Notes

- **Test with real accounts**: Use test emails like `test@duwaz.co.za`, `shop1@duwaz.co.za`, etc.
- **Check browser console**: Look for network errors (red), failed fetches, 500 responses
- **Check Render logs**: If endpoints still 500, check render.com logs for backend errors
- **Test on both desktop & mobile**: Responsive design should work

---

## If Tests Fail

1. **Products/Categories return HTML (500 error)**
   - Check: `/api/health/db` → If says FAILED, Supabase connection broken
   - Fix: Update connection string in `application.properties`
   - Or: Simplify queries (remove complex JOINs)

2. **Messaging doesn't work**
   - Check: Is `/api/messages` endpoint returning 200?
   - Check: Is backend WebSocket running?
   - Fix: Restart backend or add more error handling

3. **Login fails with CORS error**
   - Check: CORS origins in `CorsConfig.java` include `https://duwaz.co.za`
   - Fix: Re-deploy backend

4. **Admin doesn't see notifications**
   - Check: Is `/api/health/db` working?
   - Check: Are messages being saved to database?
   - Fix: Add logging to AdminNotificationController

