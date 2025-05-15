-- Create new enum type
CREATE TYPE "ProjectStatus_new" AS ENUM ('Ordered', 'Communication', 'DeliveryInProgress', 'Delivered');

-- Add new column with new enum type
ALTER TABLE "Project" ADD COLUMN "status_new" "ProjectStatus_new";

-- Update new column with mapped values
UPDATE "Project" SET "status_new" = 'Ordered' WHERE "status" = 'Ordered' OR "status" = 'Cancelled';
UPDATE "Project" SET "status_new" = 'DeliveryInProgress' WHERE "status" = 'InProgress';
UPDATE "Project" SET "status_new" = 'Delivered' WHERE "status" = 'Completed';

-- Drop old column and rename new column
ALTER TABLE "Project" DROP COLUMN "status";
ALTER TABLE "Project" RENAME COLUMN "status_new" TO "status";

-- Drop old enum type
DROP TYPE "ProjectStatus";

-- Rename new enum type
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';

-- AlterTable
ALTER TABLE "Project" 
  ALTER COLUMN "status" SET DEFAULT 'Ordered',
  ALTER COLUMN "supportDuration" DROP NOT NULL,
  ALTER COLUMN "lastUpdated" SET DEFAULT CURRENT_TIMESTAMP;

-- AddProjectStatusToPayment
ALTER TABLE "Payment" ADD COLUMN "projectStatus" "ProjectStatus" NOT NULL DEFAULT 'Ordered';

-- Update existing payment statuses
UPDATE "Payment" SET "projectStatus" = 'Ordered' WHERE "projectStatus" IS NULL;
UPDATE "Payment" SET "projectStatus" = 'DeliveryInProgress' WHERE "projectStatus" = 'InProgress';
UPDATE "Payment" SET "projectStatus" = 'Delivered' WHERE "projectStatus" = 'Completed'; 