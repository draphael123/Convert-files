export interface StorageAdapter {
  upload(buffer: Buffer, key: string, mimeType?: string): Promise<string>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
  exists(key: string): Promise<boolean>
}



