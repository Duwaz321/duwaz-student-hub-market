# 🔧 Troubleshooting: Products Not Showing on Homepage

## 📍 Problem Statement
When you added new products to categories, they don't appear on the homepage in the "Shop by Category" section, even though they exist in the database.

---

## 🔍 Diagnosis Steps

### Step 1: Check Browser Console
1. Open homepage: `https://duwaz.co.za`
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Look for logs starting with `[HomePage]`:
   ```
   [HomePage] Total products loaded: 25
   [HomePage] Products by category: { 1: 5, 2: 3, 3: 7, ... }
   [HomePage] Active categories: 4
   ```

**What each means:**
- **Total products loaded: 0** → No products in database or API not responding
- **Products by category: {}** (empty object) → Products exist but NO category assigned
- **Active categories: 0** → No categories have products assigned

### Step 2: Check Network Tab
1. In DevTools, click **Network** tab
2. Refresh page
3. Look for request to `/api/products` or `/api/catalog/products/featured`
4. Click it and check **Response** tab:
   - Should see JSON array with products
   - Each product should have `category: { id: 1, name: "Electronics", ... }`
   - If category is `null` → **That's the problem!**

### Step 3: Verify in Database
1. Go to Supabase: https://app.supabase.com
2. Open your project
3. Go to **Table Editor** → **product** table
4. Check a few products you added:
   - **category_id** column should have a number (1, 2, 3, etc.)
   - If it's **NULL** or **empty** → Products need categories assigned

---

## ❌ Root Causes & Fixes

### Issue #1: Products Have No Category Assigned
**Symptoms:**
- Console shows: `Total products loaded: X` but `Active categories: 0`
- Homepage shows "No categories with products yet"

**Why it happens:**
- Product creation form might not require category selection
- Or categories were added AFTER products were created

**Fix Option A: Update Product in Database (SQL)**
```sql
-- Assign category_id to all uncategorized products
-- Replace 1 with the actual category ID you want

-- First, see which products have NULL category
SELECT id, name, category_id FROM product WHERE category_id IS NULL;

-- Then assign a category (e.g., category_id = 1)
UPDATE product 
SET category_id = 1 
WHERE category_id IS NULL;

-- Verify the change
SELECT id, name, category_id FROM product WHERE category_id IS NOT NULL;
```

**Fix Option B: Re-add Products via Shop Dashboard**
1. Login to shop
2. Go to Shop Dashboard → Products tab
3. Click "Add Product"
4. Make sure to **select a category** from dropdown
5. Save product
6. Repeat for all products

**Fix Option C: Update Product Creation Form (Code)**
If products can be added without selecting a category, update `ShopDashboardPage.tsx`:
```typescript
// Make category REQUIRED (not optional)
if (!productForm.categoryId) {
  toast({ title: 'Category required', variant: 'destructive' });
  return;
}
```

---

### Issue #2: Categories Exist But Products Not Linked
**Symptoms:**
- Console shows: `Active categories: 0` 
- Database has categories but products.category_id is NULL

**Fix:**
See **Fix Option A** above (SQL update)

---

### Issue #3: Products Exist, Categories Exist, But Still Not Showing
**Symptoms:**
- Console shows: `Total products loaded: 10`, categories exist
- But homepage shows "No categories with products yet"

**Why it happens:**
- Product status might be OUT_OF_STOCK or DISCONTINUED
- Homepage only shows AVAILABLE products

**Fix: Check Product Status**
```sql
-- Check product status
SELECT id, name, product_status, category_id 
FROM product 
WHERE category_id IS NOT NULL;

-- Should see: product_status = 'AVAILABLE'
-- If it's 'OUT_OF_STOCK' or 'DISCONTINUED', update it:

UPDATE product 
SET product_status = 'AVAILABLE' 
WHERE id = YOUR_PRODUCT_ID;
```

---

### Issue #4: API Returning Old Data (Caching)
**Symptoms:**
- You updated products in database
- But homepage still shows old data
- Or shows no products at all

**Why it happens:**
- Backend caches products for 2 minutes
- Or frontend cache hasn't expired

**Fix:**
1. **Clear Frontend Cache:**
   - Press **Ctrl+Shift+Delete** (or Cmd+Shift+Delete on Mac)
   - Clear "Cookies and other site data"
   - Reload page

2. **Wait for Backend Cache to Expire:**
   - Wait 2-3 minutes and refresh
   - Or restart backend service

3. **Force Cache Refresh:**
   - In DevTools Network tab, check "Disable cache"
   - Reload page

---

## ✅ Verification Checklist

After implementing fixes, verify everything:

- [ ] **Console logs show products**
  ```
  [HomePage] Total products loaded: > 0
  [HomePage] Active categories: > 0
  ```

- [ ] **Network shows product data**
  - `/api/products` returns products with categories

- [ ] **Database has data**
  - `SELECT COUNT(*) FROM product;` returns > 0
  - `SELECT COUNT(*) FROM product WHERE category_id IS NOT NULL;` returns > 0

- [ ] **Homepage displays categories**
  - "Shop by Category" section NOT empty
  - Category cards show product images
  - Clicking category shows products

- [ ] **Product status is correct**
  - Products show `product_status = 'AVAILABLE'`
  - Not OUT_OF_STOCK

---

## 📋 Quick Command Reference

### SQL Queries to Run in Supabase
```sql
-- 1. Count total products
SELECT COUNT(*) as total_products FROM product;

-- 2. Count products WITH categories
SELECT COUNT(*) as products_with_category 
FROM product 
WHERE category_id IS NOT NULL;

-- 3. Count products WITHOUT categories
SELECT COUNT(*) as products_no_category 
FROM product 
WHERE category_id IS NULL;

-- 4. List categories with product counts
SELECT c.id, c.name, COUNT(p.id) as product_count
FROM category c
LEFT JOIN product p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

-- 5. Show uncategorized products
SELECT id, name, category_id, product_status 
FROM product 
WHERE category_id IS NULL
LIMIT 10;

-- 6. Show products by status
SELECT product_status, COUNT(*) 
FROM product 
GROUP BY product_status;
```

---

## 🆘 Still Not Working?

If products still don't show after these fixes:

1. **Check backend logs** on Render:
   - Go to https://dashboard.render.com
   - Click your backend service
   - Check logs for errors

2. **Verify API is working:**
   - Open console and run:
   ```javascript
   fetch('https://api.duwaz.co.za/api/products')
     .then(r => r.json())
     .then(data => console.log('Products:', data))
   ```
   - Should see array of products with category info

3. **Restart backend:**
   - On Render dashboard, restart the service
   - Wait 2-3 minutes for rebuild

4. **Check Supabase status:**
   - Visit https://status.supabase.com
   - Make sure database is online

---

## 📞 Support Info

If you need more help:
- Check database in Supabase directly
- Look at backend logs on Render
- Compare your product data with the test queries above
- Ensure categories table has data: `SELECT COUNT(*) FROM category;`

