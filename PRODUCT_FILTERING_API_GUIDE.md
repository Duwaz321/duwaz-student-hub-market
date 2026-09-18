# 🔌 Product Filtering & Category API Guide

## Overview

This guide explains how the product filtering and category system works in Duwaz, including all API endpoints, frontend hooks, and troubleshooting.

---

## 📡 Backend API Endpoints

### 1. Get All Available Products
**Endpoint:** `GET /api/products`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Coca Cola",
    "price": 15.99,
    "description": "Cold beverage",
    "imageUrl": "https://...",
    "productStatus": "AVAILABLE",
    "productType": "PRODUCT",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Drinks",
      "description": "Beverages and drinks"
    },
    "businessId": 5,
    "business": {
      "id": 5,
      "businessName": "Campus Cafe",
      "logoUrl": "https://..."
    }
  }
]
```

**Used by:** HomePage (for featured products section)

**Caching:** 
- Backend: 2 minutes (@Cacheable)
- Frontend: 60 seconds (Cache-Control HTTP header)

---

### 2. Get All Categories
**Endpoint:** `GET /api/catalog/categories?includeEmpty=false`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Drinks",
    "productCount": 12
  },
  {
    "id": 2,
    "name": "Food",
    "productCount": 8
  },
  {
    "id": 3,
    "name": "Other",
    "productCount": 5
  }
]
```

**Parameters:**
- `includeEmpty` (optional): `true` to include categories with 0 products, `false` (default) to only show active categories

**Used by:** MarketplacePage (category filter pills)

---

### 3. Get Products by Category
**Endpoint:** `GET /api/catalog/products/by-category/{categoryId}?page=0&size=12`

**Response:**
```json
{
  "content": [
    { "id": 1, "name": "Coca Cola", "price": 15.99, ... },
    { "id": 2, "name": "Sprite", "price": 15.99, ... }
  ],
  "totalPages": 2,
  "totalElements": 24,
  "currentPage": 0,
  "pageSize": 12
}
```

**Parameters:**
- `categoryId` (path): Required - Category ID (1, 2, 3, etc.)
- `page` (query): Page number (0-indexed), default 0
- `size` (query): Items per page, default 12

**Used by:** MarketplacePage (when category filter applied)

**Caching:** No caching (always fresh data from category-specific queries)

---

### 4. Get Services (SERVICE type products)
**Endpoint:** `GET /api/catalog/services?page=0&size=12`

**Response:** Same paginated format as category products

**Used by:** ServiceListPage

---

### 5. Get Services by Category
**Endpoint:** `GET /api/catalog/services/by-category/{categoryId}?page=0&size=12`

**Response:** Paginated services in that category

---

## 🪝 Frontend Hooks

### useProducts()
Fetches all available products from `GET /api/products`

```typescript
import { useProducts } from '@/hooks/useProducts';

const MyComponent = () => {
  const { data: products = [], isLoading, error } = useProducts();
  
  // products is array of Product objects
  // All products that are AVAILABLE
  // No filtering applied yet
};
```

**Caching:** Uses React Query with 2-minute stale time

---

### useCategories()
Fetches all active categories from `GET /api/catalog/categories`

```typescript
import { useCategories } from '@/hooks/useCategories';

const MyComponent = () => {
  const { data: categories = [], isLoading } = useCategories();
  
  // categories is array with { id, name, productCount }
  // Only includes categories that have products
};
```

---

### useBusinesses()
Fetches all business/shops

```typescript
import { useBusinesses } from '@/hooks/useBusinesses';

const MyComponent = () => {
  const { data: businesses = [], isLoading } = useBusinesses();
  // businesses is array of shop information
};
```

---

## 🎯 Frontend Implementation Examples

### Example 1: HomePage - Show Shuffled Products

```typescript
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

const HomePage = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // SHUFFLE products so same category items aren't clustered
  const shuffledProducts = [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  return (
    <div>
      {/* Show shuffled products */}
      <div>
        {shuffledProducts.map(p => (
          <ProductCard 
            key={p.id}
            product={p}
            shopName={p.business?.businessName}
          />
        ))}
      </div>

      {/* Show categories */}
      <div>
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            id={cat.id}
            name={cat.name}
            productCount={cat.productCount}
          />
        ))}
      </div>
    </div>
  );
};
```

---

### Example 2: MarketplacePage - Filter by Category

```typescript
import { useProducts, useCategories } from '@/hooks';
import { useSearchParams } from 'react-router-dom';

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  // Get selected category from URL
  const selectedCategory = searchParams.get('category') || 'all';

  // FILTER products by category
  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    
    // Handle both nested (category.id) and flat (categoryId) fields
    const categoryId = String(p.category?.id ?? p.categoryId ?? '');
    return categoryId === selectedCategory;
  });

  return (
    <div>
      {/* Category filter pills */}
      <div>
        <button onClick={() => setSearchParams({})}>
          All Products
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: String(cat.id) })}
          >
            {cat.name} ({cat.productCount})
          </button>
        ))}
      </div>

      {/* Filtered product list */}
      <div>
        {filteredProducts.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
};
```

---

### Example 3: Direct Category API Call (Not Recommended)

```typescript
// This is handled by useCatalogProducts hook, but shown for reference
const fetchProductsByCategory = async (categoryId: number, page: number = 0) => {
  const res = await fetch(`/api/catalog/products/by-category/${categoryId}?page=${page}&size=12`);
  const data = await res.json();
  return data.content; // Returns paginated products
};
```

---

## 🔍 Data Structure: Product Object

```typescript
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  productStatus: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  productType: 'PRODUCT' | 'SERVICE';
  
  // Category relationship
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  
  // Business relationship
  businessId?: number;
  business?: {
    id: number;
    businessName: string;
    logoUrl?: string;
  };
  
  // For physical products
  stockQuantity?: number;
}
```

---

## 📊 Key Filtering Logic

### Frontend Filter: By Category

```typescript
// Handle both nested and flat data structures
const getCategoryId = (product: Product): string => {
  // Try nested first: product.category.id
  if (product.category?.id) return String(product.category.id);
  
  // Fallback to flat: product.categoryId
  if (product.categoryId) return String(product.categoryId);
  
  // Not assigned
  return '';
};

const filterByCategory = (products: Product[], categoryId: string) => {
  if (categoryId === 'all') return products;
  
  return products.filter(p => getCategoryId(p) === categoryId);
};
```

### Frontend Filter: By Search

```typescript
const filterBySearch = (products: Product[], searchTerm: string) => {
  const lower = searchTerm.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    (p.description?.toLowerCase().includes(lower) ?? false)
  );
};
```

### Frontend Filter: By Status

```typescript
const filterAvailable = (products: Product[]) => {
  return products.filter(p => p.productStatus === 'AVAILABLE');
};
```

### Frontend Shuffle

```typescript
const shuffleProducts = (products: Product[]) => {
  return [...products].sort(() => Math.random() - 0.5);
};

// Use in homepage
const featured = shuffleProducts(products).slice(0, 8);
```

---

## 🏆 Best Practices

### 1. Always Filter by Status
Only show AVAILABLE products on user-facing pages:
```typescript
const visibleProducts = products.filter(p => p.productStatus === 'AVAILABLE');
```

### 2. Handle Missing Category Safely
Products might have `categoryId` (flat) or `category.id` (nested):
```typescript
const catId = String(p.category?.id ?? p.categoryId ?? '');
if (!catId) return false; // Product has no category
```

### 3. Use React Query Hooks
Prefer hooks over direct fetch calls:
```typescript
// ✅ Good
const { data: products } = useProducts();

// ❌ Avoid
fetch('/api/products').then(...)
```

### 4. Cache Product Lists
Products rarely change, so caching is fine:
```typescript
// Backend caches for 2 minutes
// Frontend React Query caches for same
// Should be sufficient for most use cases
```

### 5. Shuffle on Homepage
Prevent same-category clustering:
```typescript
const featured = [...products].sort(() => Math.random() - 0.5).slice(0, 8);
```

---

## 🐛 Common Issues & Solutions

### Issue: Products Don't Filter by Category
**Cause:** Product missing `categoryId` in database
**Fix:** Run migration: `UPDATE product SET category_id = (SELECT id FROM category WHERE name = 'Other') WHERE category_id IS NULL`

### Issue: Filter Check Fails
**Cause:** Comparing `p.category?.id` when API returns `p.categoryId`
**Fix:** Handle both: `String(p.category?.id ?? p.categoryId ?? '')`

### Issue: Old Products Showing
**Cause:** Backend or frontend caching
**Fix:** Clear browser cache or wait 2 minutes

### Issue: No Products on Homepage
**Cause:** All products OUT_OF_STOCK or DISCONTINUED
**Fix:** Check product status: `SELECT * FROM product WHERE product_status != 'AVAILABLE'`

---

## 📋 Testing Checklist

After implementing changes, test:

- [ ] **API Returns Data**
  ```bash
  curl http://localhost:8080/api/products | jq '.length'
  curl http://localhost:8080/api/catalog/categories | jq '.length'
  curl "http://localhost:8080/api/catalog/products/by-category/1" | jq '.content.length'
  ```

- [ ] **Homepage Shows Products**
  - Open `/`
  - Verify "Discover Products" section shows products
  - Products should be different order on each reload (shuffled)

- [ ] **Category Filter Works**
  - Open `/marketplace`
  - Click "Drinks" category
  - Verify only Drinks products show
  - Click "Food" category
  - Verify only Food products show
  - Click "All Products"
  - Verify all products show again

- [ ] **Search Works**
  - Type product name
  - Verify product appears
  - Delete search
  - Verify all filtered products show again

- [ ] **Combined Filter**
  - Select category "Drinks"
  - Search "cola"
  - Verify only Drinks products containing "cola" show

---

## 🚀 Performance Notes

- **`GET /api/products`** - ~2ms cached, ~50ms uncached (for homepage)
- **`GET /api/catalog/categories`** - ~1ms cached (category pills)
- **`GET /api/catalog/products/by-category/{id}`** - ~5ms (specific category browsing)

All cached at backend and frontend level for optimal UX.

---

## 📞 Support

For issues with:
- **Product display**: Check `TROUBLESHOOTING_PRODUCTS.md`
- **Category filtering**: Verify database has categories and products linked
- **API errors**: Check backend logs and database connection
