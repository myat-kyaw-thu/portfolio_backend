/*
  Warnings:

  - The `project_tech_stacks` column on the `ProjectIndex` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProjectIndex" DROP COLUMN "project_tech_stacks",
ADD COLUMN     "project_tech_stacks" TEXT[];
