-- ============================================
-- Mirror Model Refactor Migration
-- ============================================

-- Create ProductProvider enum
CREATE TYPE "ProductProvider" AS ENUM ('POLAR', 'STRIPE');

-- Create ProductVisibility enum
CREATE TYPE "ProductVisibility" AS ENUM ('PUBLIC', 'HIDDEN', 'MEMBERS_ONLY');

-- ============================================
-- Product Table Changes
-- ============================================

-- Add new columns to Product table
ALTER TABLE "product" 
  ADD COLUMN "provider" "ProductProvider" DEFAULT 'POLAR',
  ADD COLUMN "externalProductId" TEXT,
  ADD COLUMN "featured" BOOLEAN DEFAULT false,
  ADD COLUMN "orderIndex" INTEGER DEFAULT 0,
  ADD COLUMN "visibility" "ProductVisibility" DEFAULT 'PUBLIC',
  ADD COLUMN "externalSyncedAt" TIMESTAMP(3),
  ADD COLUMN "externalSyncAttempts" INTEGER DEFAULT 0;

-- Migrate data from old columns to new columns
UPDATE "product" SET 
  "externalProductId" = "polarProductId",
  "externalSyncAttempts" = CASE 
    WHEN "polarSyncStatus" = 'failed' THEN 3
    ELSE 0 
  END;

-- Drop old columns from Product
ALTER TABLE "product" 
  DROP COLUMN "polarProductId",
  DROP COLUMN "polarSyncStatus",
  DROP COLUMN "polarSyncError";

-- Add unique constraint and indexes for Product
CREATE UNIQUE INDEX "product_externalProductId_key" ON "product"("externalProductId");
CREATE INDEX "product_featured_idx" ON "product"("featured");
CREATE INDEX "product_orderIndex_idx" ON "product"("orderIndex");
CREATE INDEX "product_visibility_idx" ON "product"("visibility");
CREATE INDEX "product_provider_idx" ON "product"("provider");

-- ============================================
-- Price Table Changes
-- ============================================

-- Add new column and migrate data
ALTER TABLE "price" 
  ADD COLUMN "externalPriceId" TEXT;

UPDATE "price" SET "externalPriceId" = "polarPriceId";

ALTER TABLE "price" 
  DROP COLUMN "polarPriceId";

-- Add unique constraint and indexes for Price
CREATE UNIQUE INDEX "price_externalPriceId_key" ON "price"("externalPriceId");
CREATE INDEX "price_productId_idx" ON "price"("productId");
CREATE INDEX "price_isArchived_idx" ON "price"("isArchived");

-- ============================================
-- Subscription Table Changes
-- ============================================

-- Add new column and migrate data
ALTER TABLE "subscription" 
  ADD COLUMN "externalSubscriptionId" TEXT,
  ADD COLUMN "externalCustomerId" TEXT;

UPDATE "subscription" SET 
  "externalSubscriptionId" = "polarSubscriptionId",
  "externalCustomerId" = "polarCustomerId";

ALTER TABLE "subscription" 
  DROP COLUMN "polarSubscriptionId",
  DROP COLUMN "polarCustomerId";

-- Add unique constraint and indexes for Subscription
CREATE UNIQUE INDEX "subscription_externalSubscriptionId_key" ON "subscription"("externalSubscriptionId");
CREATE INDEX "subscription_productId_idx" ON "subscription"("productId");

-- ============================================
-- Order Table Changes
-- ============================================

-- Add new column and migrate data
ALTER TABLE "order" 
  ADD COLUMN "externalOrderId" TEXT,
  ADD COLUMN "externalCustomerId" TEXT;

UPDATE "order" SET 
  "externalOrderId" = "polarOrderId",
  "externalCustomerId" = "polarCustomerId";

ALTER TABLE "order" 
  DROP COLUMN "polarOrderId",
  DROP COLUMN "polarCustomerId";

-- Add unique constraint and indexes for Order
CREATE UNIQUE INDEX "order_externalOrderId_key" ON "order"("externalOrderId");
CREATE INDEX "order_productId_idx" ON "order"("productId");

-- ============================================
-- Customer Table Changes
-- ============================================

-- Add new column and migrate data
ALTER TABLE "customer" 
  ADD COLUMN "externalCustomerId" TEXT,
  ADD COLUMN "provider" "ProductProvider" DEFAULT 'POLAR';

UPDATE "customer" SET "externalCustomerId" = "polarCustomerId";

-- First drop the existing unique constraint on polarCustomerId
ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "customer_polarCustomerId_key";

ALTER TABLE "customer" 
  DROP COLUMN "polarCustomerId";

-- Add unique constraint and indexes for Customer
CREATE UNIQUE INDEX "customer_externalCustomerId_key" ON "customer"("externalCustomerId");
CREATE INDEX "customer_provider_idx" ON "customer"("provider");
