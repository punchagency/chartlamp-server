import { redis } from "../../redis";
import { createIcdcodeClassificationQueue } from "./queue";

export const icdcodeClassificationQueue = createIcdcodeClassificationQueue();

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
