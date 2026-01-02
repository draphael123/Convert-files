import { Queue, Worker, Job } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

export const conversionQueue = new Queue('conversions', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
})

export interface ConversionJobData {
  jobId: string
  inputFileKey: string
  inputMime: string
  outputFormat: string
}

export function createConversionJob(data: ConversionJobData) {
  return conversionQueue.add('convert', data, {
    jobId: data.jobId,
  })
}

export function getQueueConnection() {
  return connection
}

