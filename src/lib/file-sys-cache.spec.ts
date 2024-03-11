import FileSysCache from './file-sys-cache'
import { rmSync, existsSync, readdirSync } from 'node:fs'

describe('FileSysCache', () => {
  const filePrefix = 'my-prefix'
  const fileName = 'my-file-name'
  const payload = { message: 'Hello, world!' }

  describe('defaults', () => {
    it('uses default basePath', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ debug: true })
      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('./.file-sys-cache')
      rmSync('./.file-sys-cache', { recursive: true, force: true })
    })
  })

  describe('ttl', () => {
    const basePath = './.unit-file-sys-cache--ttl'
    afterEach(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('overrides defaultTTL', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ basePath, defaultTTL: 3600, debug: true })

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('TTL: 3600')
    })
  })

  describe('option debug', () => {
    const basePath = './.unit-file-sys-cache--option'
    afterEach(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('should create cached file', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ basePath, debug: true })

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain(`Data stored successfully to ${basePath}/${filePrefix} hash_`)
    })
  })

  describe('set', () => {
    const basePath = './.unit-file-sys-cache--set'
    afterEach(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('should create cached file', async () => {
      const cache = new FileSysCache({ basePath })

      const result = await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      expect(result).toContain(filePrefix)
    })
    it('should throw an error if folder path is wrong', async () => {
      console.error = jest.fn()
      const cache = new FileSysCache({ basePath: '?', debug: true })

      await expect(cache.set({ fileNamePrefix: filePrefix, fileName, payload })).rejects.toThrow('no such file or directory')
    })
  })

  describe('get', () => {
    const basePath = './.unit-file-sys-cache--get'
    afterEach(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('should return cached payload', async () => {
      const cache = new FileSysCache({ basePath })

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })
      const result = await cache.get({ fileNamePrefix: filePrefix, fileName })

      expect(result).toEqual(payload)
    })
    it('should throw an error if directory does not exist', async () => {
      const cache = new FileSysCache({ basePath })
      await expect(cache.get({ fileNamePrefix: filePrefix, fileName })).rejects.toThrow('no such file or directory')
    })
    it('should throw an error if file does not exist in directory', async () => {
      console.error = jest.fn()
      const cache = new FileSysCache({ basePath, debug: true })

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })
      await expect(cache.get({ fileNamePrefix: filePrefix, fileName: 'wrong-file-name' })).rejects.toThrow('no such file or directory')
    })
  })

  describe('getOrSet', () => {
    const basePath = './.unit-file-sys-cache--getOrSet'
    afterAll(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('return fresh data', async () => {
      console.error = jest.fn()
      console.info = jest.fn()
      const cache = new FileSysCache({ basePath, defaultTTL: 3600, debug: true })

      const freshData = await cache.getOrSet({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.error.mock.calls[0][0]).toContain('Error during file retrieval:')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('Return: fresh')
      expect(freshData).toEqual(payload)
    })
    it('return cached data', async () => {
      console.error = jest.fn()
      console.info = jest.fn()
      const cache = new FileSysCache({ basePath, defaultTTL: 3600, debug: true })

      const cachedData = await cache.getOrSet({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.error.mock.calls).toHaveLength(0)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('Return: cached')
      expect(cachedData).toEqual(payload)
    })
  })

  describe('invalidate', () => {
    const basePath = './.unit-file-sys-cache--invalidate'
    afterAll(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('invalidate files', async () => {
      const cache = new FileSysCache({ basePath, defaultTTL: 1 })

      await cache.getOrSet({ fileNamePrefix: filePrefix, fileName, payload })
      await new Promise(resolve => setTimeout(resolve, 2000))
      let filesCount
      try {
        // Read the contents of the folder
        const files = readdirSync(basePath)
        // Return the number of files
        filesCount = files.length
      } catch (_) {
        filesCount = 0
      }
      expect(filesCount).toBe(1)
      try {
        // Read the contents of the folder
        const files = readdirSync(basePath)
        // Return the number of files
        filesCount = files.length
      } catch (_) {
        filesCount = 0
      }
      expect(filesCount).toBe(1)
      await cache.invalidate()
      try {
        // Read the contents of the folder
        const files = readdirSync(basePath)
        // Return the number of files
        filesCount = files.length
      } catch (_) {
        filesCount = 0
      }
      expect(filesCount).toBe(0)
    })
  })

  describe('flushByRegex', () => {
    const basePath = './.unit-file-sys-cache--flushByRegex'
    afterAll(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('flush files', async () => {
      const cache = new FileSysCache({ basePath })

      await cache.set({ fileNamePrefix: 'org_google id_123', fileName: 'file-1', payload })
      await cache.set({ fileNamePrefix: 'org_google id_345', fileName: 'file-2', payload })
      await cache.set({ fileNamePrefix: 'org_google id_678', fileName: 'file-3', payload })
      await cache.set({ fileNamePrefix: 'org_amazon id_123', fileName: 'file-4', payload })
      await cache.set({ fileNamePrefix: 'org_amazon id_456', fileName: 'file-5', payload })
      await cache.flushByRegex('google', '678')
      let filesCount
      try {
        // Read the contents of the folder
        const files = readdirSync(basePath)
        // Return the number of files
        filesCount = files.length
      } catch (_) {
        filesCount = 0
      }
      expect(filesCount).toBe(4)
      await cache.flushByRegex('amazon')
      try {
        // Read the contents of the folder
        const files = readdirSync(basePath)
        // Return the number of files
        filesCount = files.length
      } catch (_) {
        filesCount = 0
      }
      expect(filesCount).toBe(2)
    })
  })

  describe('flushAll', () => {
    const basePath = './.unit-file-sys-cache--flushAll'
    it('deletes a folder', async () => {
      const cache = new FileSysCache({ basePath })

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })
      expect(existsSync(basePath)).toBeTruthy()
      cache.flushAll()
      expect(existsSync(basePath)).toBeFalsy()
    })
  })
})
