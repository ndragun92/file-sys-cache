import path from 'node:path'
import { promises as fsPromises, readdirSync, rmSync, unlinkSync, statSync } from 'node:fs'
import { type IArguments, type IGetArguments, type IOptions, type ISetArguments } from '../types/index.type.ts'
import { formatFileName } from '../utils/format.util.ts'
import FileSysCacheMonitoring, { monitoring } from './file-sys-cache-monitoring.ts'

const autoInvalidate = {
  after: 25,
  count: 0
}

const autoLog = {
  after: 50,
  count: 0
}

export default class FileSysCache {
  basePath: string
  defaultTTL: number
  debug: boolean
  autoInvalidate: boolean
  enableMonitoring: boolean
  monitoringInstance?: FileSysCacheMonitoring

  constructor ({ basePath, defaultTTL, debug, autoInvalidate, enableMonitoring }: IOptions) {
    this.basePath = basePath || './.file-sys-cache'
    this.defaultTTL = defaultTTL || 60 // 60 seconds
    this.debug = debug || false
    this.autoInvalidate = autoInvalidate || false
    this.enableMonitoring = enableMonitoring || false
  }

  async set ({ fileName = '', key, payload, ttl = this.defaultTTL }: ISetArguments): Promise<string> {
    const FILE_TTL = ttl
    const FILE_NAME = formatFileName({ fileName, key })
    try {
      // Construct the cache folder path
      const cacheFolderPath = path.resolve(this.basePath)
      // Ensure the cache folder exists
      await fsPromises.mkdir(cacheFolderPath, { recursive: true })
      // Construct the file path within the cache folder
      const filePath = path.resolve(cacheFolderPath, FILE_NAME)
      // Convert the payload to text format
      const dataToStore = Object(payload)

      // Construct the data object
      const data = {
        payload: dataToStore,
        ttl: FILE_TTL,
        expiration: FILE_TTL ? Date.now() + FILE_TTL * 1000 : null
      }

      // Write data to the file
      await fsPromises.writeFile(filePath, JSON.stringify(data))

      if (this.debug) {
        console.info(`Data stored successfully to ${this.basePath}/${FILE_NAME} | TTL: ${FILE_TTL}`)
      }

      if (this.enableMonitoring) {
        monitoring.count.success.set++
        this.setLogs()
      }

      return filePath
    } catch (error: any) {
      if (this.debug) {
        console.error('Error setting file:', error)
      }
      if (this.enableMonitoring) {
        monitoring.count.error.set++
      }
      throw error
    }
  }

  async get ({ fileName = '', key }: IGetArguments): Promise<string> {
    if (this.autoInvalidate) {
      autoInvalidate.count++
      if (autoInvalidate.count >= autoInvalidate.after) {
        this.invalidate().catch(() => {})
        autoInvalidate.count = 0
      }
    }

    const FILE_NAME = formatFileName({ fileName, key })
    try {
      // Construct the file path within the cache folder
      const filePath = path.resolve(this.basePath, `${FILE_NAME}`)

      // Check if the file exists

      await fsPromises.stat(filePath)
      // Parse the JSON content
      const data = await this.readFileAndParse(filePath)

      if (this.enableMonitoring) {
        monitoring.count.success.get++
        this.setLogs()
      }

      return data.payload
    } catch (error: any) {
      if (this.debug) {
        console.error('Error during file retrieval:', error)
      }
      if (this.enableMonitoring) {
        monitoring.count.error.get++
      }
      throw error
    }
  }

  async getOrSet ({ fileName = '', key, payload, ttl = this.defaultTTL }: ISetArguments): Promise<unknown> {
    if (this.enableMonitoring) {
      monitoring.count.success.getOrSet++
    }
    try {
      const CACHED_DATA = await this.get({ fileName, key })
      if (this.debug) {
        console.info('Return: cached')
      }
      return CACHED_DATA
    } catch (_) {
      try {
        if (this.debug) {
          console.info('Return: fresh')
        }
        await this.set({ fileName, key, payload, ttl })
        return payload
      } catch (_) {
        if (this.debug) {
          console.info('Return: fresh')
        }
        return payload
      }
    }
  }

  async invalidate (): Promise<void> {
    try {
      const files = readdirSync(this.basePath)
      for (const file of files) {
        try {
          const { expiresIn } = (await this.validateFile(file)) || { ttl: 0, expiresIn: 0 }
          const invalid = (expiresIn || 0) <= 0
          if (invalid) {
            unlinkSync(`${this.basePath}/${file}`)
          }
        } catch (_) {}
      }
      if (this.enableMonitoring) {
        monitoring.count.success.invalidate++
      }
    } catch (_) {
      if (this.enableMonitoring) {
        monitoring.count.error.invalidate++
      }
    }
  }

  private async validateFile (key: IArguments['key']): Promise<{ ttl: number, expiresIn: number | null } | undefined> {
    try {
      // Construct the file path within the cache folder
      const filePath = path.resolve(this.basePath, `${key}`)

      // Check if the file exists
      await fsPromises.stat(filePath)

      // Parse the JSON content
      const data = await this.readFileAndParse(filePath)

      // Calculate remaining time until expiration (in seconds)
      const expiresIn = data.expiration ? Math.max(0, (data.expiration - Date.now()) / 1000) : null

      if (this.enableMonitoring) {
        monitoring.count.success.validateFile++
      }

      // Return the payload data and TTL
      return {
        ttl: data.ttl,
        expiresIn
      }
    } catch (error: any) {
      if (this.debug) {
        console.error('Error validateFile:', error)
      }
      if (this.enableMonitoring) {
        monitoring.count.error.validateFile++
      }
    }
  }

  flushByRegex (...args: string[]): any {
    try {
      const files = readdirSync(this.basePath)

      for (const file of files) {
        if (args.every((string) => file.match(string))) {
          unlinkSync(`${this.basePath}/${file}`)
        }
      }
      if (this.enableMonitoring) {
        monitoring.count.success.flushByRegex++
      }
    } catch (error: any) {
      if (this.debug) {
        console.error('Error flushByRegex:', error)
      }
      if (this.enableMonitoring) {
        monitoring.count.error.flushByRegex++
      }
    }
  }

  flushAll (): void {
    rmSync(this.basePath, { recursive: true, force: true })
    if (this.enableMonitoring) {
      monitoring.count.success.flushAll++
    }
  }

  get monitoring (): FileSysCacheMonitoring | undefined {
    if (!this.monitoringInstance && this.enableMonitoring) {
      this.monitoringInstance = new FileSysCacheMonitoring()
    }
    return this.monitoringInstance
  }

  private setLogs (): void {
    autoLog.count++
    if (autoLog.count >= autoLog.after) {
      this.log()
      autoLog.count = 0
    }
  }

  private log (): void {
    let totalSizeInBytes = 0
    let storedFilesCount = 0
    try {
      const files = readdirSync(this.basePath)
      for (const file of files) {
        storedFilesCount++
        const stats = statSync(`${this.basePath}/${file}`)
        totalSizeInBytes += stats.size
      }
    } catch (_) {}
    this.monitoring?.set({ sizeInBytes: totalSizeInBytes, storedFilesCount })
  }

  private async readFileAndParse (filePath: string): Promise<any> {
    const fileContent = await fsPromises.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent)
  }
}
