import { createIcdcodeClassificationQueue } from "./icdcodeClassification/queue";
import { createOcrStatusQueue } from "./ocrExtractionStatus/queue";
import { redis } from "../redis";

const ocrExtractionStatusQueue = createOcrStatusQueue();
const icdcodeClassificationQueue = createIcdcodeClassificationQueue();

export async function addIcdcodeClassificationBackgroundJob(
  jobName: string,
  input?: any
) {
  console.log("adding job to backgrounds...", { jobName, input });
  try {
    await icdcodeClassificationQueue.add(jobName, input, {
      jobId: `icd-cls-${input.reportId}-${input.icdCodes[0]}`,
    });
  } catch (error) {
    console.error("Error adding job to background:", error);
    throw error;
  }
}

export async function addOcrExtractionStatusPollingJob(jobId: string) {
  await ocrExtractionStatusQueue.upsertJobScheduler(
    `scheduler-${jobId}`,
    {
      every: 60000, // 1 min
      limit: 50,
      immediately: false,
    },
    {
      name: "ocrExtractionStatus",
      data: { jobId },
      // opts: {}, // Optional additional job options
    }
  );
}

export async function cancelOcrExtractionPolling(jobId: string) {
  await ocrExtractionStatusQueue.removeJobScheduler(`scheduler-${jobId}`);
  console.log("🛑 Stopped polling job");
}

// export const closeQueues = async () => {
//   await ocrExtractionStatusQueue.close();
//   await icdcodeClassificationQueue.close();
//   await redis.quit();
// };

// process.on("SIGTERM", closeQueues);
// process.on("SIGINT", closeQueues);
