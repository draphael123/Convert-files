import { StorageAdapter } from './types'
import { LocalStorageAdapter } from './local'
import { S3StorageAdapter } from './s3'

let storageInstance: StorageAdapter | null = null

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    const storageType = process.env.STORAGE_TYPE || 'local'
    
    // Warn if using local storage on Vercel (which won't work)
    if (process.env.VERCEL && storageType !== 's3') {
      console.warn(
        'WARNING: Local storage is not supported on Vercel. ' +
        'Please set STORAGE_TYPE=s3 and configure S3 credentials in environment variables.'
      )
    }
    
    if (storageType === 's3') {
      storageInstance = new S3StorageAdapter()
    } else {
      const localPath = process.env.STORAGE_LOCAL_PATH || './storage'
      storageInstance = new LocalStorageAdapter(localPath)
    }
  }
  
  return storageInstance
}



