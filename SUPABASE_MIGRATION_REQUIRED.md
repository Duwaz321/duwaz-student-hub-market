# 🔴 CRITICAL: Supabase Migration Required

**Status:** Blocking issue - Products not loading (500 errors)

**Root Cause:** The `product` table is missing the `product_type` column that the backend code expects.

---

## What Happened

The backend was updated to support **SERVICE** products (in addition to regular products), which requires a `product_type` enum column.

The `Product.java` entity has this column defined:
```java
@Enumerated(EnumType.STRING)
@Column(name = "product_type", nullable = false)
private ProductType productType = ProductType.PRODUCT;
```

However, Supabase didn't auto-create this column because:
- `spring.jpa.hibernate.ddl-auto=update` doesn't work on Supabase (DDL restrictions)
- The column needs to be manually added via SQL

---

## Fix: Run SQL Migration on Supabase

### Step 1: Log in to Supabase
1. Go to https://app.supabase.com
2. Select your project: **duwaz-student-hub-market**
3. Click **SQL Editor** (left sidebar)

### Step 2: Create New Query
1. Click **New Query**
2. Paste this SQL:

```sql
-- Add product_type column to product table
ALTER TABLE product 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) NOT NULL DEFAULT 'PRODUCT';

-- Create index on product_type for faster queries
CREATE INDEX IF NOT EXISTS idx_product_type 
ON product(product_type);

-- Create composite index for business_id + product_type
CREATE INDEX IF NOT EXISTS idx_product_business_type 
ON product(business_id, product_type);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product' 
AND column_name = 'product_type';
```

### Step 3: Execute Query
1. Click **Run** (or Ctrl+Enter)
2. You should see results showing the new column

### Step 4: Verify Success
- Last query result should show: `product_type | character varying | NO`
- If it shows 0 rows, the column already exists (success)

---

## After Migration

Once the SQL migration is complete:

1. **Render will auto-rebuild** (if you have webhooks configured)
2. Or manually trigger rebuild on https://dashboard.render.com
3. **Wait 3-5 minutes** for deployment
4. **Test**: Open browser console and run:
   ```javascript
   fetch('https://api.duwaz.co.za/api/products')
     .then(r => r.json())
     .then(console.log)
   ```

If successful, you'll see products array instead of 500 error.

---

## What This Fixes

✅ `/api/products` endpoint will return products (not 500 error)  
✅ `/api/products/business/{id}` will work  
✅ Shop dashboard will load products  
✅ "Shops loaded: 0" will become "Shops loaded: X"  

---

## Future: Service Support

Once the `product_type` column is in place, we can enable:
- `/api/catalog/services` - List all services
- `/api/catalog/services/by-category/{id}` - Filter services by category
- Service businesses can mark products as SERVICE type (no delivery, no stock)
- Customers can contact service providers directly

---

## If Migration Fails

**Error: "product_type already exists"**
- That's OK! It means the column is already there. No further action needed.

**Error: "permission denied"**
- Your Supabase account may not have DDL permissions
- Contact Supabase support or check your account role

**Error: "table product does not exist"**
- That's a bigger problem - check if migrations have been run in the past
- May need to check backup/schema

---

## Status After Fix

Once migration is complete, these will work:
- ✅ Login → Shops load
- ✅ Marketplace → Products display
- ✅ Shop Dashboard → Products tab works
- ✅ Admin Dashboard → See all products
- ⏳ Services → Will be available (currently returns empty list as placeholder)

