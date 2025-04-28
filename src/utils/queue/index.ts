import { createIcdcodClassificationWorker } from "./icdcodeClassification/worker";
import { createOcrExtractionStatusWorker } from "./ocrExtractionStatus/worker";
import { redis } from "../redis";

export async function startBackgroundJobs() {

  const ocrExtractionStatusWorker = await createOcrExtractionStatusWorker();
  const icdcodClassificationWorker = await createIcdcodClassificationWorker();

  const shutdown = async () => {
    await ocrExtractionStatusWorker.close();
    await icdcodClassificationWorker.close();
    await redis.quit();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
