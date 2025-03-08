-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_title" TEXT NOT NULL,
    "project_subtitle" TEXT NOT NULL,
    "project_cover_img" TEXT NOT NULL,
    "project_tech_stacks" TEXT NOT NULL,
    "project_link" TEXT NOT NULL,
    "project_status" TEXT NOT NULL,
    "personal" BOOLEAN NOT NULL,
    "project_description" TEXT NOT NULL,
    "technical_specifications" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFeature" (
    "id" SERIAL NOT NULL,
    "feature_id" INTEGER NOT NULL,
    "feature_name" TEXT NOT NULL,
    "feature_description" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectGoal" (
    "id" SERIAL NOT NULL,
    "goal_id" INTEGER NOT NULL,
    "goal_name" TEXT NOT NULL,
    "goal_description" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTimeline" (
    "id" SERIAL NOT NULL,
    "milestone_id" INTEGER NOT NULL,
    "milestone_name" TEXT NOT NULL,
    "milestone_date" TEXT NOT NULL,
    "milestone_description" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "member_name" TEXT NOT NULL,
    "member_role" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectIndex" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_title" TEXT NOT NULL,
    "project_subtitle" TEXT NOT NULL,
    "project_cover_img" TEXT NOT NULL,
    "project_tech_stacks" TEXT NOT NULL,
    "project_link" TEXT NOT NULL,
    "github_link" TEXT,
    "project_status" TEXT NOT NULL,
    "personal" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_project_id_key" ON "Project"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectIndex_project_id_key" ON "ProjectIndex"("project_id");

-- AddForeignKey
ALTER TABLE "ProjectFeature" ADD CONSTRAINT "ProjectFeature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectGoal" ADD CONSTRAINT "ProjectGoal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTimeline" ADD CONSTRAINT "ProjectTimeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
