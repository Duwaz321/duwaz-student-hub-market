-- Migration: Ensure all products have categories and create seed data
-- This script ensures the marketplace has the key categories: Drinks, Food, Other

-- 1. Create key categories if they don't exist
INSERT INTO category (name, description) 
VALUES 
  ('Drinks', 'Beverages and drinks'),
  ('Food', 'Food and snacks'),
  ('Other', 'Miscellaneous items and services')
ON DUPLICATE KEY UPDATE 
  description = VALUES(description);

-- 2. Get IDs for reference (these will be used in application code)
-- SELECT id FROM category WHERE name IN ('Drinks', 'Food', 'Other');

-- 3. For any products that don't have a category, assign them to 'Other'
-- (This assumes a reasonable default - can be adjusted based on product name if needed)
UPDATE product p 
SET p.category_id = (SELECT id FROM category WHERE name = 'Other') 
WHERE p.category_id IS NULL AND p.id NOT IN (
  SELECT id FROM product WHERE category_id IS NOT NULL
)
LIMIT 1000;

-- 4. Verify results
SELECT 
  c.name as category,
  COUNT(p.id) as product_count,
  SUM(CASE WHEN p.product_status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_count
FROM category c
LEFT JOIN product p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

-- 5. Show any products still without categories (should be empty after script runs)
SELECT id, name, category_id FROM product WHERE category_id IS NULL LIMIT 10;
