-- AlterTable
ALTER TABLE "Achievement" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "is_details" BOOLEAN,
ALTER COLUMN "project_id" DROP NOT NULL,
ALTER COLUMN "project_title" DROP NOT NULL,
ALTER COLUMN "project_subtitle" DROP NOT NULL,
ALTER COLUMN "project_cover_img" DROP NOT NULL,
ALTER COLUMN "project_tech_stacks" DROP NOT NULL,
ALTER COLUMN "project_link" DROP NOT NULL,
ALTER COLUMN "project_status" DROP NOT NULL,
ALTER COLUMN "personal" DROP NOT NULL,
ALTER COLUMN "project_description" DROP NOT NULL,
ALTER COLUMN "technical_specifications" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectFeature" ALTER COLUMN "feature_id" DROP NOT NULL,
ALTER COLUMN "feature_name" DROP NOT NULL,
ALTER COLUMN "feature_description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectGoal" ALTER COLUMN "goal_id" DROP NOT NULL,
ALTER COLUMN "goal_name" DROP NOT NULL,
ALTER COLUMN "goal_description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectIndex" ALTER COLUMN "project_id" DROP NOT NULL,
ALTER COLUMN "project_title" DROP NOT NULL,
ALTER COLUMN "project_subtitle" DROP NOT NULL,
ALTER COLUMN "project_cover_img" DROP NOT NULL,
ALTER COLUMN "project_link" DROP NOT NULL,
ALTER COLUMN "project_status" DROP NOT NULL,
ALTER COLUMN "personal" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "project_tech_stacks" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectTimeline" ALTER COLUMN "milestone_id" DROP NOT NULL,
ALTER COLUMN "milestone_name" DROP NOT NULL,
ALTER COLUMN "milestone_date" DROP NOT NULL,
ALTER COLUMN "milestone_description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "member_id" DROP NOT NULL,
ALTER COLUMN "member_name" DROP NOT NULL,
ALTER COLUMN "member_role" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProjectDetail" (
    "id" TEXT NOT NULL,
    "project_images" TEXT,
    "project_flowchart" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDetail_projectId_key" ON "ProjectDetail"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectDetail" ADD CONSTRAINT "ProjectDetail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
