import path from 'node:path'
import { promises as fsPromises } from 'node:fs'
import { type IGetArguments, type IOptions, type ISetArguments } from '../types/index.type.ts'
import { formatFileName } from '../utils/format.util.ts'

export default class FileSysCache {
  basePath: string
  defaultTTL: number
  debug: boolean

  constructor ({ basePath, defaultTTL, debug }: IOptions) {
    this.basePath = basePath || './.file-sys-cache'
    this.defaultTTL = defaultTTL || 60 // 60 seconds
    this.debug = debug || false
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
        expiration: FILE_TTL ? Date.now() + FILE_TTL : null
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

  private async readFileAndParse (filePath: string): Promise<any> {
    const fileContent = await fsPromises.readFile(filePath, 'utf-8')
    return JSON.parse(fileContent)
  }

  async get ({ fileNamePrefix = '', fileName }: IGetArguments): Promise<string> {
    const FILE_NAME = formatFileName({ fileNamePrefix, fileName })
    const filePath = path.resolve(this.basePath, `${FILE_NAME}`)

    try {
      await fsPromises.stat(filePath)
      const data = await this.readFileAndParse(filePath)
      return data.payload
    } catch (error: any) {
      if (this.debug) {
        console.error('Error during file retrieval:', error)
      }
      throw error
    }
  }
}
