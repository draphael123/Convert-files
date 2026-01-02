import { StorageAdapter } from './types'
import { LocalStorageAdapter } from './local'
import { S3StorageAdapter } from './s3'

let storageInstance: StorageAdapter | null = null

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    const storageType = process.env.STORAGE_TYPE || 'local'
    
    if (storageType === 's3') {
      storageInstance = new S3StorageAdapter()
    } else {
      const localPath = process.env.STORAGE_LOCAL_PATH || './storage'
      storageInstance = new LocalStorageAdapter(localPath)
    }
  }
  
  return storageInstance
}



