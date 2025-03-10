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
    "contactWhatsapp" TEXT,
    "contactInstagram" TEXT,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
