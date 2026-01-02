import { promises as fs } from 'fs'
import { join } from 'path'
import { StorageAdapter } from './types'

export class LocalStorageAdapter implements StorageAdapter {
  private basePath: string

  constructor(basePath: string = './storage') {
    this.basePath = basePath
    this.ensureDirectoryExists()
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }

  async upload(buffer: Buffer, key: string, mimeType?: string): Promise<string> {
    const filePath = join(this.basePath, key)
    const dir = join(filePath, '..')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, buffer)
    return key
  }

  async download(key: string): Promise<Buffer> {
    const filePath = join(this.basePath, key)
    return await fs.readFile(filePath)
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.basePath, key)
    try {
      await fs.unlink(filePath)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // For local storage, return a simple download URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/api/download/${key}?expires=${Date.now() + expiresIn * 1000}`
  }

  async exists(key: string): Promise<boolean> {
    const filePath = join(this.basePath, key)
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}

