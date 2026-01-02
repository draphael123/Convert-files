import { getDbPool } from './client'

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface Job {
  id: string
  userId: string | null
  status: JobStatus
  inputFileKey: string
  outputFileKey: string | null
  inputMime: string
  outputFormat: string
  errorCode: string | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

export interface JobEvent {
  id: number
  jobId: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
}

export async function createJob(data: {
  id: string
  userId?: string | null
  inputFileKey: string
  inputMime: string
  outputFormat: string
}): Promise<Job> {
  const pool = getDbPool()
  const result = await pool.query(
    `INSERT INTO jobs (id, user_id, status, input_file_key, input_mime, output_format)
     VALUES ($1, $2, 'queued', $3, $4, $5)
     RETURNING *`,
    [data.id, data.userId || null, data.inputFileKey, data.inputMime, data.outputFormat]
  )
  return mapRowToJob(result.rows[0])
}

export async function getJob(id: string): Promise<Job | null> {
  const pool = getDbPool()
  const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id])
  if (result.rows.length === 0) return null
  return mapRowToJob(result.rows[0])
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  outputFileKey?: string | null,
  errorCode?: string | null,
  errorMessage?: string | null
): Promise<void> {
  const pool = getDbPool()
  const updates: string[] = ['status = $2', 'updated_at = NOW()']
  const values: any[] = [id, status]
  let paramIndex = 3

  if (outputFileKey !== undefined) {
    updates.push(`output_file_key = $${paramIndex}`)
    values.push(outputFileKey)
    paramIndex++
  }

  if (errorCode !== undefined) {
    updates.push(`error_code = $${paramIndex}`)
    values.push(errorCode)
    paramIndex++
  }

  if (errorMessage !== undefined) {
    updates.push(`error_message = $${paramIndex}`)
    values.push(errorMessage)
    paramIndex++
  }

  await pool.query(
    `UPDATE jobs SET ${updates.join(', ')} WHERE id = $1`,
    values
  )
}

export async function listJobs(limit: number = 50, offset: number = 0): Promise<Job[]> {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  )
  return result.rows.map(mapRowToJob)
}

export async function addJobEvent(
  jobId: string,
  level: 'info' | 'warn' | 'error',
  message: string
): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    'INSERT INTO job_events (job_id, level, message) VALUES ($1, $2, $3)',
    [jobId, level, message]
  )
}

export async function getJobEvents(jobId: string): Promise<JobEvent[]> {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT * FROM job_events WHERE job_id = $1 ORDER BY timestamp ASC',
    [jobId]
  )
  return result.rows.map((row) => ({
    id: row.id,
    jobId: row.job_id,
    timestamp: row.timestamp,
    level: row.level,
    message: row.message,
  }))
}

function mapRowToJob(row: any): Job {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    inputFileKey: row.input_file_key,
    outputFileKey: row.output_file_key,
    inputMime: row.input_mime,
    outputFormat: row.output_format,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

