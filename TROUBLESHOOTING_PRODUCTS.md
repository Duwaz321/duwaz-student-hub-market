# 🔧 Troubleshooting: Products Not Showing on Homepage & Category Filtering

## 📍 Problem Statement
When you added new products to categories, they don't appear on the homepage in the "Shop by Category" section. Products also don't filter correctly when selecting categories. The homepage should show a shuffled mix of products from all categories (Drinks, Food, Other products).

---

## 🎯 What Should Happen (After Fixes)

✅ **Homepage displays:**
- Products shuffled from different categories (no same-category clustering)
- Shows mix of Drinks, Food, and Other products on every page load
- "Shop by Category" shows all active categories with product images

✅ **Category Filtering works:**
- When you click a category, all products in that category display
- Category filter properly handles both nested and flat product data structures
- All products show (not just first 8)

✅ **Database is clean:**
- All products have a category assigned (no NULL category_id)
- All active products have status = AVAILABLE
- Drinks, Food, and Other categories exist with products

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
   [HomePage] Sample product: { id: 1, name: "...", category: { id: 1, name: "Drinks" } }
   ```

**What each means:**
- **Total products loaded: 0** → No products in database or API not responding
- **Products by category: {}** (empty object) → Products exist but NO category assigned
- **Active categories: 0** → No categories have products assigned
- **Sample product shows null category** → Products missing category_id in database

### Step 2: Check Network Tab
1. In DevTools, click **Network** tab
2. Refresh page
3. Look for requests to:
   - `/api/products` → Main product list for homepage
   - `/api/catalog/categories` → Categories for filters
   - `/api/catalog/products/by-category/{id}` → When filtering by category
4. Click each and check **Response** tab:
   - Products should have `category: { id: 1, name: "Drinks" }`
   - Categories should list with product counts
   - If category is `null` → **That's the problem!**

### Step 3: Verify in Database
1. Go to Supabase: https://app.supabase.com
2. Open your project
3. Go to **Table Editor** → **product** table
4. Check a few products you added:
   - **category_id** column should have a number (1, 2, 3, etc.)
   - If it's **NULL** or **empty** → **Products need categories assigned**

---

## ❌ Root Causes & Fixes

### Issue #1: Products Have No Category Assigned
**Symptoms:**
- Console shows: `Total products loaded: X` but `Active categories: 0`
- Homepage shows "No categories with products yet"
- Marketplace shows no products

**Why it happens:**
- Product creation form might not require category selection
- Categories were added AFTER products were created
- Or products imported without category mappings

**Fix Option A: Run Migration SQL (RECOMMENDED)**
```sql
-- Run this SQL in Supabase to ensure categories and assign uncategorized products

-- 1. Create key categories if missing
INSERT INTO category (name, description) 
VALUES 
  ('Drinks', 'Beverages and drinks'),
  ('Food', 'Food and snacks'),
  ('Other', 'Miscellaneous items and services')
ON DUPLICATE KEY UPDATE 
  description = VALUES(description);

-- 2. Assign any products without categories to 'Other'
UPDATE product p 
SET p.category_id = (SELECT id FROM category WHERE name = 'Other') 
WHERE p.category_id IS NULL;

-- 3. Verify all products now have categories
SELECT COUNT(*) as products_with_category 
FROM product 
WHERE category_id IS NOT NULL;
```

**Fix Option B: Update Product in Database (SQL - Manual)**
```sql
-- See which products have NULL category
SELECT id, name, category_id FROM product WHERE category_id IS NULL;

-- Assign a category (replace 1 with actual category ID)
UPDATE product 
SET category_id = 1 
WHERE category_id IS NULL;

-- Verify the change
SELECT id, name, category_id FROM product WHERE category_id IS NOT NULL;
```

**Fix Option C: Re-add Products via Shop Dashboard**
1. Login to shop
2. Go to Shop Dashboard → Products tab
3. Click "Add Product"
4. **SELECT A CATEGORY** from dropdown (required!)
5. Fill in other details
6. Save product
7. Repeat for all products

**Fix Option D: Update Product Creation Form (Code)**
If products can be added without selecting a category:
```typescript
// In ShopDashboardPage.tsx - make category REQUIRED
if (!productForm.categoryId) {
  toast({ 
    title: 'Category required', 
    description: 'Please select a category (Drinks, Food, or Other)',
    variant: 'destructive' 
  });
  return;
}
```

---

### Issue #2: Category Filtering Broken (Products Don't Filter by Category)
**Symptoms:**
- Click on category pill → Products don't filter
- Or shows products from all categories instead of just one
- Marketplace filter doesn't work

**Why it happens:**
- Frontend code had bug checking `p.category?.id` but API returns flat `categoryId`
- Type mismatch between nested and flat data structures

**Fix: Code is Already Updated** ✅
The marketplace page now handles both:
```typescript
// Handles both p.category?.id (nested) and p.categoryId (flat)
const categoryId = String(p.category?.id ?? p.categoryId ?? '');
const matchCat = selectedCategory === 'all' || categoryId === selectedCategory;
```

If still broken, clear browser cache:
- Press **Ctrl+Shift+Delete**
- Clear "Cookies and other site data"
- Reload page

---

### Issue #3: Products Show Same Category Clustering on Homepage
**Symptoms:**
- Homepage shows all Drinks first, then all Food, then Other
- Products not shuffled/mixed
- Same category items grouped together

**Why it happens:**
- Old code: `products.slice(0, 8)` took first 8 products (often same category)
- No randomization/shuffling logic

**Fix: Code is Already Updated** ✅
Homepage now shuffles products:
```typescript
const shuffledProducts = [...products].sort(() => Math.random() - 0.5).slice(0, 8);
const featuredProducts = shuffledProducts;
```

Products now display in random order on each page load.

---

### Issue #4: API Returning Old Data (Caching)
**Symptoms:**
- You updated products in database
- But homepage still shows old data or no products

**Why it happens:**
- Backend caches products for 2 minutes (@Cacheable)
- Frontend browser cache (60 sec HTTP cache)

**Fix:**
1. **Clear Frontend Cache:**
   - Press **Ctrl+Shift+Delete** (Windows/Linux) or **Cmd+Shift+Delete** (Mac)
   - Clear "Cookies and other site data"
   - Reload page

2. **Wait for Backend Cache:**
   - Wait 2-3 minutes and refresh
   - Or restart backend service in Docker

3. **Force Cache Refresh in DevTools:**
   - Open DevTools (F12)
   - Network tab → Check "Disable cache" checkbox
   - Reload page

---

### Issue #5: Products Status Not AVAILABLE
**Symptoms:**
- Database has products with categories
- But homepage doesn't show them
- Or shows fewer products than expected

**Why it happens:**
- Product status is OUT_OF_STOCK or DISCONTINUED
- HomePage filters to only show AVAILABLE products

**Fix: Check and Update Product Status**
```sql
-- See all products and their status
SELECT id, name, product_status, category_id, stock_quantity
FROM product 
LIMIT 20;

-- For PRODUCTS (physical items): update if stock > 0
UPDATE product 
SET product_status = 'AVAILABLE' 
WHERE product_type = 'PRODUCT' 
  AND stock_quantity > 0 
  AND product_status != 'AVAILABLE';

-- For SERVICES: always available (no stock check)
UPDATE product 
SET product_status = 'AVAILABLE' 
WHERE product_type = 'SERVICE' 
  AND product_status != 'AVAILABLE';
```

---

## ✅ Verification Checklist

After implementing fixes, verify everything works:

- [ ] **Database Setup**
  ```sql
  -- Check categories exist
  SELECT * FROM category WHERE name IN ('Drinks', 'Food', 'Other');
  
  -- Should return 3 rows
  ```

- [ ] **All Products Have Categories**
  ```sql
  SELECT COUNT(*) as uncategorized 
  FROM product 
  WHERE category_id IS NULL;
  
  -- Should return 0
  ```

- [ ] **Console Shows Products**
  ```
  [HomePage] Total products loaded: > 0
  [HomePage] Active categories: > 0
  [HomePage] Sample product shows category
  ```

- [ ] **API Returns Data**
  - `/api/products` returns array with products having categories
  - `/api/catalog/categories` returns Drinks, Food, Other
  - `/api/catalog/products/by-category/1` filters by category

- [ ] **Homepage Displays:**
  - ✅ Products from different categories (shuffled)
  - ✅ "Shop by Category" shows Drinks, Food, Other
  - ✅ Category cards show product images

- [ ] **Marketplace Filtering Works:**
  - ✅ Click "Drinks" → only Drinks show
  - ✅ Click "Food" → only Food show
  - ✅ Click "All" → all products show
  - ✅ Search still works with category filter

- [ ] **Product Data Complete:**
  - ✅ All products have `product_status = 'AVAILABLE'`
  - ✅ Physical products have `stock_quantity > 0`
  - ✅ Services have `product_type = 'SERVICE'`

---

## 📋 Quick Command Reference

### SQL Queries to Run in Supabase

```sql
-- 1. Setup: Create key categories
INSERT INTO category (name, description) 
VALUES 
  ('Drinks', 'Beverages and drinks'),
  ('Food', 'Food and snacks'),
  ('Other', 'Miscellaneous items')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 2. Assign uncategorized products to 'Other'
UPDATE product SET category_id = 
  (SELECT id FROM category WHERE name = 'Other')
WHERE category_id IS NULL;

-- 3. Count total products
SELECT COUNT(*) as total FROM product;

-- 4. Count products WITH categories
SELECT COUNT(*) FROM product WHERE category_id IS NOT NULL;

-- 5. Count products WITHOUT categories
SELECT COUNT(*) FROM product WHERE category_id IS NULL;

-- 6. Show categories with product counts
SELECT c.id, c.name, 
  COUNT(p.id) as total,
  SUM(CASE WHEN p.product_status = 'AVAILABLE' THEN 1 ELSE 0 END) as available
FROM category c
LEFT JOIN product p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY available DESC;

-- 7. Show uncategorized products
SELECT id, name, category_id, product_status, product_type 
FROM product 
WHERE category_id IS NULL
LIMIT 10;

-- 8. Show products by status
SELECT product_status, COUNT(*) as count
FROM product 
GROUP BY product_status;

-- 9. Update uncategorized products to AVAILABLE
UPDATE product 
SET product_status = 'AVAILABLE'
WHERE category_id IS NOT NULL 
  AND product_status NOT IN ('AVAILABLE', 'DISCONTINUED');
```

---

## �️ Architecture: How Product Filtering Works

### Frontend Flow
```
HomePage loads
  ↓
useProducts() hook calls GET /api/products
  ↓
ProductController.getAllProducts()
  ↓
ProductService.getAllProductsSummary() [cached 2 min]
  ↓
Products returned with category info
  ↓
HomePage shuffles products: sort(() => Math.random() - 0.5)
  ↓
Shows 8 shuffled products from different categories
```

### Category Filtering Flow
```
User clicks "Drinks" category
  ↓
MarketplacePage.setSelectedCategory('1')
  ↓
Filters products: categoryId === '1' OR category?.id === '1'
  ↓
Shows all Drinks products
  ↓
User can search within category
```

### Backend API Endpoints
- `GET /api/products` → All AVAILABLE products (used by homepage)
- `GET /api/catalog/categories` → All categories with product counts
- `GET /api/catalog/products/by-category/{id}` → Products in category (paginated)
- `GET /api/catalog/services` → SERVICE type products
- `GET /api/catalog/services/by-category/{id}` → Services in category

---

## 🆘 Still Not Working?

If products still don't show after these fixes:

1. **Check backend logs** on Render/Docker:
   - Look for errors in Maven compilation
   - Check for database connection issues

2. **Verify API is working:**
   - Open console and run:
   ```javascript
   fetch('/api/products')
     .then(r => r.json())
     .then(data => console.log('Products:', data.length, data[0]))
     .catch(e => console.error('Error:', e))
   ```

3. **Check Supabase status:**
   - Visit https://status.supabase.com
   - Ensure database is online

4. **Run migration script:**
   - Execute the SQL migration to ensure categories and assignments

5. **Restart backend:**
   - Restart Docker container or backend service
   - Wait 2-3 minutes for full startup

---

## 📞 Next Steps

1. ✅ Run the SQL migration to setup categories and assign products
2. ✅ Clear browser cache (Ctrl+Shift+Delete)
3. ✅ Reload homepage and verify products show
4. ✅ Test category filtering on marketplace
5. ✅ Verify products are shuffled (different order on each reload)


