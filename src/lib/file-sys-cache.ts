import path from 'node:path'
import { promises as fsPromises, readdirSync, rmSync, unlinkSync } from 'node:fs'
import { type IArguments, type IGetArguments, type IOptions, type ISetArguments } from '../types/index.type.ts'
import { formatFileName } from '../utils/format.util.ts'

export default class FileSysCache {
  basePath: string
  defaultTTL: number
  debug: boolean
  autoInvalidate: boolean

  constructor ({ basePath, defaultTTL, debug, autoInvalidate }: IOptions) {
    this.basePath = basePath || './.file-sys-cache'
    this.defaultTTL = defaultTTL || 60 // 60 seconds
    this.debug = debug || false
    this.autoInvalidate = autoInvalidate || false
  }

  async set ({ fileNamePrefix = '', fileName, payload, ttl = this.defaultTTL }: ISetArguments): Promise<string> {
    const FILE_TTL = ttl
    const FILE_NAME = formatFileName({ fileNamePrefix, fileName })
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

      return filePath
    } catch (error: any) {
      if (this.debug) {
        console.error('Error setting file:', error)
      }
      throw error
    }
  }

  async get ({ fileNamePrefix = '', fileName }: IGetArguments): Promise<string> {
    if (this.autoInvalidate) {
      this.invalidate()
    }

    const FILE_NAME = formatFileName({ fileNamePrefix, fileName })

    try {
      // Construct the file path within the cache folder
      const filePath = path.resolve(this.basePath, `${FILE_NAME}`)

      // Check if the file exists

      await fsPromises.stat(filePath)
      // Parse the JSON content
      const data = await this.readFileAndParse(filePath)

      return data.payload
    } catch (error: any) {
      if (this.debug) {
        console.error('Error during file retrieval:', error)
      }
      throw error
    }
  }

  async getOrSet ({ fileNamePrefix = '', fileName, payload, ttl = this.defaultTTL }: ISetArguments): Promise<unknown> {
    try {
      const CACHED_DATA = await this.get({ fileNamePrefix, fileName })
      if (this.debug) {
        console.info('Return: cached')
      }
      return CACHED_DATA
    } catch (_) {
      try {
        if (this.debug) {
          console.info('Return: fresh')
        }
        await this.set({ fileNamePrefix, fileName, payload, ttl })
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
    } catch (_) {}
  }

  private async validateFile (fileName: IArguments['fileName']): Promise<{ ttl: number, expiresIn: number | null } | undefined> {
    try {
      // Construct the file path within the cache folder
      const filePath = path.resolve(this.basePath, `${fileName}`)

      // Check if the file exists
      await fsPromises.stat(filePath)

      // Parse the JSON content
      const data = await this.readFileAndParse(filePath)

      // Calculate remaining time until expiration (in seconds)
      const expiresIn = data.expiration ? Math.max(0, (data.expiration - Date.now()) / 1000) : null

      // Return the payload data and TTL
      return {
        ttl: data.ttl,
        expiresIn
      }
    } catch (error: any) {
      if (this.debug) {
        console.error('Error validateFile:', error)
      }
      // throw err
    }
  }

  flushAll (): void {
    rmSync(this.basePath, { recursive: true, force: true })
  }

  private async readFileAndParse (filePath: string): Promise<any> {
    const fileContent = await fsPromises.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent)
  }
}
