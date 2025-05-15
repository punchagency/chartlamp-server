import dotenv from "dotenv";

dotenv.config();

import { Queue } from "bullmq";
import { connectToMongo } from "../mongo";
import { redis } from "../redis";
import { icdcodeClassificationQueue } from "./icdcodeClassification/producer";
import { createIcdcodClassificationWorker } from "./icdcodeClassification/worker";
import { ocrPageExtractorQueue } from "./ocrPageExtractor/producer";
import { createOcrPageExtractorWorker } from "./ocrPageExtractor/worker";
import { pageProcessingQueue } from "./pageProcessing/producer";
import { createPageProcessingWorker } from "./pageProcessing/worker";

async function startWorkers() {
  console.error = () => {};
  console.log("🚀 Starting background workers...");
  console.log("RUN_WORKERS - workers", process.env.RUN_WORKERS);

  await connectToMongo();

  const workers = await Promise.all([
    createPageProcessingWorker(),
    createOcrPageExtractorWorker(),
    createIcdcodClassificationWorker(),
  ]);

  console.log("✅ Workers are now running.");

  // Handle graceful shutdown
  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log("🛑 Shutdown signal received. Closing workers...");

    for (const worker of workers) {
      await worker.close();
    }

    console.log("✅ Workers shut down successfully.");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

if (process.env.RUN_WORKERS === "true") {
  startWorkers().catch((err) => {
    console.error("❌ Failed to start workers:", err);
    process.exit(1);
  });
}

export const allQueues: Queue[] = [
  icdcodeClassificationQueue,
  ocrPageExtractorQueue,
  pageProcessingQueue,
];

process.on("SIGTERM", async () => {
  console.log("SIGTERM received");
  await icdcodeClassificationQueue.close();
  await ocrPageExtractorQueue.close();
  await pageProcessingQueue.close();
  await redis.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received");
  await icdcodeClassificationQueue.close();
  await ocrPageExtractorQueue.close();
  await pageProcessingQueue.close();
  await redis.quit();
  process.exit(0);
});
