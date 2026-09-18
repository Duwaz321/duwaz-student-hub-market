-- Migration: Add product_type column to product table
-- This fixes the InvalidDataAccessResourceUsageException

-- Step 1: Add the product_type column with default value
ALTER TABLE product 
ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) NOT NULL DEFAULT 'PRODUCT';

-- Step 2: Create index on product_type for faster queries
CREATE INDEX IF NOT EXISTS idx_product_type 
ON product(product_type);

-- Step 3: Create composite index for business_id + product_type
CREATE INDEX IF NOT EXISTS idx_product_business_type 
ON product(business_id, product_type);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product' 
AND column_name = 'product_type';
