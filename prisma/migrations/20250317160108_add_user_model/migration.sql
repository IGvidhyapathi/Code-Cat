-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "email" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keyFeatures" TEXT[],
    "techStack" TEXT[],
    "youtubeUrl" TEXT NOT NULL,
    "demoUrl" TEXT,
    "installationGuide" TEXT,
    "contactEmail" TEXT,
    "contactTwitter" TEXT,
    "contactGithub" TEXT,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "projectType" TEXT NOT NULL DEFAULT 'readymade',
    "includesDocumentation" BOOLEAN NOT NULL DEFAULT true,
    "includesSourceCode" BOOLEAN NOT NULL DEFAULT true,
    "includesSupport" BOOLEAN NOT NULL DEFAULT true,
    "supportDuration" TEXT NOT NULL DEFAULT '1',
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
