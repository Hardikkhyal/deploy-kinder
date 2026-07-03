-- CreateTable
CREATE TABLE "DeploymentStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deploymentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "durationMs" INTEGER,
    "logs" TEXT NOT NULL DEFAULT '',
    "errorReason" TEXT,
    "possibleCauses" TEXT,
    "suggestedFix" TEXT,
    "canRetry" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DeploymentStage_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "Deployment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
