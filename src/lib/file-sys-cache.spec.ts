import FileSysCache from './file-sys-cache'
import { rmSync } from 'node:fs'

describe('FileSysCache', () => {
  const basePath = './.unit-file-sys-cache'
  afterEach(() => {
    // Delete cache folder after each test
    rmSync(basePath, { recursive: true, force: true })
  })

  describe('defaults', () => {
    it('uses default basePath', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ debug: true })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('./.file-sys-cache')
      rmSync('./.file-sys-cache', { recursive: true, force: true })
    })
  })

  describe('ttl', () => {
    it('overrides defaultTTL', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ basePath, defaultTTL: 3600, debug: true })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('TTL: 3600')
    })
  })

  describe('option debug', () => {
    it('should create cached file', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ basePath, debug: true })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain(`Data stored successfully to ${basePath}/${filePrefix} hash_`)
    })
  })

  describe('set method', () => {
    it('should create cached file', async () => {
      const cache = new FileSysCache({ basePath })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }

      const result = await cache.set({ fileNamePrefix: filePrefix, fileName, payload })

      expect(result).toContain(filePrefix)
    })
    it('should throw an error if folder path is wrong', async () => {
      console.error = jest.fn()
      const cache = new FileSysCache({ basePath: '?', debug: true })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }
      await expect(cache.set({ fileNamePrefix: filePrefix, fileName, payload })).rejects.toThrow('no such file or directory')
    })
  })

  describe('get method', () => {
    it('should return cached payload', async () => {
      const cache = new FileSysCache({ basePath })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })
      const result = await cache.get({ fileNamePrefix: filePrefix, fileName })

      expect(result).toEqual(payload)
    })
    it('should throw an error if directory does not exist', async () => {
      const cache = new FileSysCache({ basePath })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      await expect(cache.get({ fileNamePrefix: filePrefix, fileName })).rejects.toThrow('no such file or directory')
    })
    it('should throw an error if file does not exist in directory', async () => {
      console.error = jest.fn()
      const cache = new FileSysCache({ basePath, debug: true })
      const filePrefix = 'my-prefix'
      const fileName = 'my-file-name'
      const payload = { message: 'Hello, world!' }

      await cache.set({ fileNamePrefix: filePrefix, fileName, payload })
      await expect(cache.get({ fileNamePrefix: filePrefix, fileName: 'wrong-file-name' })).rejects.toThrow('no such file or directory')
    })
  })
})
