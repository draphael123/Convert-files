import { S3 } from 'aws-sdk'
import { StorageAdapter } from './types'

export class S3StorageAdapter implements StorageAdapter {
  private s3: S3
  private bucket: string

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'omniconvert-files'
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    })
  }

  async upload(buffer: Buffer, key: string, mimeType?: string): Promise<string> {
    await this.s3
      .upload({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
      .promise()
    return key
  }

  async download(key: string): Promise<Buffer> {
    const result = await this.s3
      .getObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise()
    return result.Body as Buffer
  }

  async delete(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise()
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    })
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise()
      return true
    } catch {
      return false
    }
  }
}

