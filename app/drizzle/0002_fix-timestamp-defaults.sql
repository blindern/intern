-- Fix timestamp columns missing DEFAULT now() and NOT NULL constraints.
-- The initial migration (0000) was baselined when migrating from Laravel,
-- so these constraints were never applied to the actual database.

-- books
UPDATE "books" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "books" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "books" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "books" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- bukker
UPDATE "bukker" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "bukker" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "bukker" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "bukker" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- googleapps_accounts
UPDATE "googleapps_accounts" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "googleapps_accounts" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "googleapps_accounts" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "googleapps_accounts" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- googleapps_accountusers
UPDATE "googleapps_accountusers" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "googleapps_accountusers" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "googleapps_accountusers" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "googleapps_accountusers" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- password_reset_tokens
UPDATE "password_reset_tokens" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "password_reset_tokens" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "password_reset_tokens" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "password_reset_tokens" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- registration_requests
UPDATE "registration_requests" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "registration_requests" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "registration_requests" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "registration_requests" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- users
UPDATE "users" SET "created_at" = now() WHERE "created_at" IS NULL;
UPDATE "users" SET "updated_at" = now() WHERE "updated_at" IS NULL;
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT now(), ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT now(), ALTER COLUMN "updated_at" SET NOT NULL;

-- matmeny (only add default, keep nullable — too many historical NULLs)
ALTER TABLE "matmeny" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "matmeny" ALTER COLUMN "updated_at" SET DEFAULT now();
