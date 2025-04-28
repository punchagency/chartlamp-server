import { Queue } from "bullmq";
import { icdcodeClassificationQueueName } from "../types";
import { redis } from "../../redis";

export const createIcdcodeClassificationQueue = () => {
  const icdcodeClassificationQueue = new Queue(icdcodeClassificationQueueName, {
    connection: redis,
  });
  return icdcodeClassificationQueue;
};
