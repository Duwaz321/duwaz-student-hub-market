# Fix: ServiceListPage API Errors

## Problem

When accessing the Services page, you see this error:

```
Error fetching services: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This happens because the API endpoints are returning HTML (error pages) instead of JSON.

## Root Cause

The backend CatalogController had placeholder implementations for service endpoints that returned empty responses. The ProductRepository didn't have the necessary query methods to filter products by type.

## Solution

Two files have been fixed:

### 1. Backend/src/main/java/org/example/duwaz/controller/CatalogController.java

**What was changed:**
- `@GetMapping("/services")` - Now queries database for SERVICE type products
- `@GetMapping("/services/by-category/{categoryId}")` - Filters services by category

**Before:**
```java
@GetMapping("/services")
public ResponseEntity<?> getServices(...) {
    // Returned empty list with "will be available soon" message
    return ResponseEntity.ok(Map.of(
        "content", List.of(),
        ...
    ));
}
```

**After:**
```java
@GetMapping("/services")
public ResponseEntity<?> getServices(...) {
    Page<Product> services = productRepository.findByProductTypeAndStatus(
        "SERVICE",
        Product.ProductStatus.AVAILABLE,
        pageable
    );
    return ResponseEntity.ok(Map.of(
        "content", services.getContent(),
        ...
    ));
}
```

### 2. Backend/src/main/java/org/example/duwaz/repo/ProductRepository.java

**What was changed:**
- Uncommented and fixed query methods for product_type filtering
- Added new @Query methods for SERVICE type filtering

**Before:**
```java
// NOTE: Commented out queries using product_type until database column is added
// Page<Product> findByProductTypeAndProductStatus(...);
```

**After:**
```java
@Query("SELECT p FROM Product p WHERE p.productType = 'SERVICE' AND p.productStatus = :status")
Page<Product> findByProductTypeAndStatus(String productType, Product.ProductStatus status, Pageable pageable);

@Query("SELECT p FROM Product p WHERE p.productType = 'SERVICE' AND p.category.id = :categoryId AND p.productStatus = :status")
Page<Product> findByProductTypeAndCategoryAndStatus(String productType, Long categoryId, Product.ProductStatus status, Pageable pageable);
```

## Steps to Deploy Fix

1. **Pull the latest code:**
   ```bash
   git pull origin main
   ```

2. **Rebuild backend:**
   ```bash
   mvn clean install
   ```

3. **Restart backend server:**
   - Stop running Java application
   - Start it again (new compiled code with fixes)

4. **Clear browser cache (optional):**
   - Hard refresh: Ctrl+Shift+Delete or Cmd+Shift+Delete
   - Or open in Private/Incognito mode

5. **Test:**
   - Go to `/services` page
   - Should see services (if any SERVICE type products exist)
   - Categories filter should work
   - No JSON errors

## Verification

Check that these endpoints return JSON (not HTML):

```bash
# Test in browser console or terminal:
curl http://localhost:8080/api/catalog/categories
curl http://localhost:8080/api/catalog/services
curl http://localhost:8080/api/catalog/services/by-category/1
```

All should return valid JSON with `content`, `totalPages`, etc.

## What Was Missing

The fix required:
1. ✅ Database column `product_type` exists (added earlier)
2. ✅ CatalogController queries products by type
3. ✅ ProductRepository has query methods
4. ✅ Frontend properly calls endpoints

## Commit

```
d276e63b - fix: Enable service filtering in CatalogController and ProductRepository
```

## Related Files

- `Frontend/src/pages/ServiceListPage.tsx` - Calls `/api/catalog/services`
- `Backend/src/main/java/org/example/duwaz/controller/CatalogController.java` - Handles requests
- `Backend/src/main/java/org/example/duwaz/repo/ProductRepository.java` - Database queries

## If Issues Persist

1. **Verify product_type column exists:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name='product' AND column_name='product_type';
   ```

2. **Check backend logs for errors:**
   - Look for `[CatalogController]` messages
   - Check database connection

3. **Verify a SERVICE product exists:**
   ```sql
   SELECT id, name, product_type FROM product WHERE product_type = 'SERVICE' LIMIT 1;
   ```

4. **Test directly:**
   ```bash
   curl -X GET 'http://localhost:8080/api/catalog/services?page=0&size=12'
   ```
   Should return JSON, not HTML.

---

**Issue Fixed**: ✅ Services API now returns proper JSON responses
