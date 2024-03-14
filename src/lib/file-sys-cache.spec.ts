import FileSysCache from './file-sys-cache'
import { rmSync, existsSync, readdirSync } from 'node:fs'

describe('FileSysCache', () => {
  const fileName = 'my-file-name'
  const key = 'my-unique-key'
  const payload = { message: 'Hello, world!' }

  describe('defaults', () => {
    it('uses default basePath', async () => {
      console.info = jest.fn()
      const cache = new FileSysCache({ debug: true })
      await cache.set({ fileName, key, payload })

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

      await cache.set({ fileName, key, payload })

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(console.info.mock.calls[0][0]).toContain('TTL: 3600')
    })
  })

  describe('option', () => {
    describe('debug', () => {
      const basePath = './.unit-file-sys-cache--option-debug'
      afterEach(() => {
        // Delete cache folder after each test
        rmSync(basePath, { recursive: true, force: true })
      })
      it('should create cached file', async () => {
        console.info = jest.fn()
        const cache = new FileSysCache({ basePath, debug: true })

        await cache.set({ fileName, key, payload })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        expect(console.info.mock.calls[0][0]).toContain(`Data stored successfully to ${basePath}/${fileName} hash_`)
      })
    })
    describe('autoInvalidate', () => {
      const basePath = './.unit-file-sys-cache--option-autoInvalidate'
      afterAll(() => {
        // Delete cache folder after each test
        rmSync(basePath, { recursive: true, force: true })
      })
      it('should auto invalidate file after 25 tries', async () => {
        const cache = new FileSysCache({ basePath, autoInvalidate: true })
        await cache.set({ fileName, key, payload })
        await cache.set({ fileName: 'random-file-name-1', key: 'random-key-1', payload, ttl: 1 })
        await new Promise(resolve => setTimeout(resolve, 1250))
        let filesCount
        try {
          // Read the contents of the folder
          const files = readdirSync(basePath)
          // Return the number of files
          filesCount = files.length
        } catch (_) {
          filesCount = 0
        }
        expect(filesCount).toBe(2)
        await new Promise(resolve => setTimeout(resolve, 1250))
        // Since we already made 2 calls, we have to check if it will invalidate after next 23 calls
        for (let i = 0; i < 25; i++) {
          await cache.get({ fileName, key })
        }
        await new Promise(resolve => setTimeout(resolve, 1250))
        try {
          // Read the contents of the folder
          const files = readdirSync(basePath)
          // Return the number of files
          filesCount = files.length
        } catch (_) {
          filesCount = 0
        }
        expect(filesCount).toBe(1)
      })
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

      const result = await cache.set({ fileName, key, payload })

      expect(result).toContain(fileName)
    })
    if (process.env.NODE_ENV === 'test') {
      it('should throw an error if folder path is wrong', async () => {
        console.error = jest.fn()
        const cache = new FileSysCache({ basePath: '?', debug: true })

        await expect(cache.set({ fileName, key, payload })).rejects.toThrow('no such file or directory')
      })
    }
  })

  describe('get', () => {
    const basePath = './.unit-file-sys-cache--get'
    afterEach(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('should return cached payload', async () => {
      const cache = new FileSysCache({ basePath })

      await cache.set({ fileName, key, payload })
      const result = await cache.get({ fileName, key })

      expect(result).toEqual(payload)
    })
    it('should throw an error if directory does not exist', async () => {
      const cache = new FileSysCache({ basePath })
      await expect(cache.get({ fileName, key })).rejects.toThrow('no such file or directory')
    })
    it('should throw an error if file does not exist in directory', async () => {
      console.error = jest.fn()
      const cache = new FileSysCache({ basePath, debug: true })

      await cache.set({ fileName, key, payload })
      await expect(cache.get({ fileName, key: 'wrong-file-name' })).rejects.toThrow('no such file or directory')
    })
  })

  describe('files', () => {
    const basePath = './.unit-file-sys-cache--files'
    afterEach(() => {
      // Delete cache folder after each test
      rmSync(basePath, { recursive: true, force: true })
    })
    it('should return files', async () => {
      const cache = new FileSysCache({ basePath })

      await cache.set({ fileName: '1', key, payload })
      await cache.set({ fileName: '2', key, payload })
      const result = await cache.files()
      const entry = result[0]
      expect(Array.isArray(result)).toBeTruthy()
      expect(entry.name).toBeDefined()
      expect(entry.name).toContain('1 hash_')
      expect(typeof entry.size).toBe('object')
      expect(entry.size).toBeDefined()
      expect(entry.size.bytes).toBeDefined()
      expect(entry.size.bytes).toBe(75)
      expect(entry.size.megabytes).toBeDefined()
      expect(entry.size.megabytes).toBe(0.00007152557373046875)

      expect(entry.ttl).toBe(60)
      expect(entry.expiration).toBeDefined()
      expect(entry.expires_in).toBeDefined()
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

      await cache.set({ fileName, key, payload })
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

      await cache.set({ fileName: 'org_google id_123', key: 'file-1', payload })
      await cache.set({ fileName: 'org_google id_345', key: 'file-2', payload })
      await cache.set({ fileName: 'org_google id_678', key: 'file-3', payload })
      await cache.set({ fileName: 'org_amazon id_123', key: 'file-4', payload })
      await cache.set({ fileName: 'org_amazon id_456', key: 'file-5', payload })
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

      await cache.set({ fileName, key, payload })
      expect(existsSync(basePath)).toBeTruthy()
      cache.flushAll()
      expect(existsSync(basePath)).toBeFalsy()
    })
  })
})
