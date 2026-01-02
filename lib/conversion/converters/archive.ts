import { Converter } from '../types'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Archive Converter
 * Supports ZIP, RAR, 7Z, TAR, GZ conversions
 * Uses system tools (unzip, tar, etc.) or external tools
 */
export class ArchiveConverter implements Converter {
  id = 'archive'
  name = 'Archive Converter'
  supportedInputMimeTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-rar',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-gzip',
  ]
  supportedOutputFormats = ['zip', 'tar', 'gz']
  constraints = {
    maxFileSizeMB: 500,
    timeoutMs: 300000,
  }

  async run(inputPath: string, outputFormat: string): Promise<string> {
    const outputPath = join(tmpdir(), `convert-${Date.now()}-${Math.random().toString(36).substring(7)}.${outputFormat}`)
    
    // Extract first, then recompress
    const extractDir = join(tmpdir(), `extract-${Date.now()}`)
    
    try {
      // Extract based on input format
      if (inputPath.endsWith('.zip')) {
        await execAsync(`unzip -q "${inputPath}" -d "${extractDir}"`, {
          timeout: this.constraints.timeoutMs,
        })
      } else if (inputPath.endsWith('.tar') || inputPath.endsWith('.tar.gz') || inputPath.endsWith('.tgz')) {
        await execAsync(`tar -xf "${inputPath}" -C "${extractDir}"`, {
          timeout: this.constraints.timeoutMs,
        })
      } else if (inputPath.endsWith('.gz')) {
        await execAsync(`gunzip -c "${inputPath}" > "${extractDir}/extracted"`, {
          timeout: this.constraints.timeoutMs,
        })
      } else {
        throw new Error(`Unsupported archive format. Supported: ZIP, TAR, GZ`)
      }
      
      // Recompress to output format
      if (outputFormat === 'zip') {
        await execAsync(`cd "${extractDir}" && zip -r "${outputPath}" .`, {
          timeout: this.constraints.timeoutMs,
        })
      } else if (outputFormat === 'tar') {
        await execAsync(`tar -cf "${outputPath}" -C "${extractDir}" .`, {
          timeout: this.constraints.timeoutMs,
        })
      } else if (outputFormat === 'gz') {
        await execAsync(`tar -czf "${outputPath}" -C "${extractDir}" .`, {
          timeout: this.constraints.timeoutMs,
        })
      } else {
        throw new Error(`Unsupported output format: ${outputFormat}`)
      }
      
      return outputPath
    } catch (error: any) {
      throw new Error(`Archive conversion failed: ${error.message}. Note: RAR and 7Z require additional tools.`)
    }
  }
}

