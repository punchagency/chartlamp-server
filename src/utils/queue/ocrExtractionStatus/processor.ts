import { Job } from "bullmq";
// import { CaseService } from "../../../services/case.service";
import { ProcessorService } from "../../../services/processor.service";

export default async function (job: Job) {
  console.log("process", job.data);
  // const caseService = new CaseService();
  // await caseService.checkOcrExtractionStatus(job.data.jobId);
  const processorService = new ProcessorService();
  await processorService.processOcrPage(job.data.jobId);
}
