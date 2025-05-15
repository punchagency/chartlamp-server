import dotenv from "dotenv";

dotenv.config();

import { connectToMongo } from "../../mongo";
import { createPdfTextExtractorWorker } from "./worker";

async function startPdfExtractorWorker() {
  console.error = () => {};
  console.log("🚀 Starting pdf extractor background workers..");
  console.log("RUN_WORKERS - Pdf extractor", process.env.RUN_WORKERS);

  await connectToMongo();

  const worker = await createPdfTextExtractorWorker();

  console.log("✅ Pdf extractor workers are now running.");

  // Handle graceful shutdown
  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log("🛑 Shutdown signal received. Closing workers...");

    await worker.close();

    console.log("✅ Pdf extractor workers shut down successfully.");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

if (process.env.RUN_WORKERS === "true") {
  startPdfExtractorWorker().catch((err) => {
    console.error("❌ Failed to start pdf extractor workers:", err);
    process.exit(1);
  });
}

