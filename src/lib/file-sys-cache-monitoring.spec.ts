import FileSysCache from './file-sys-cache'
import { rmSync } from 'node:fs'

const fileName = 'my-file-name'
const key = 'my-unique-key'
const payload = { message: 'Hello, world!' }

describe('FileSysCacheMonitoring', () => {
  const basePath = './.file-sys-cache-monitoring'
  afterEach(() => {
    // Delete cache folder after each test
    rmSync(basePath, { recursive: true, force: true })
  })
  it('get', async () => {
    const cache = new FileSysCache({ basePath, enableMonitoring: true })
    cache.monitoring?.reset()
    await cache.set({ fileName, key, payload })
    await cache.set({ fileName, key: '222', payload })
    let data
    data = cache.monitoring?.get()
    expect(data ? data.count.success.set : 0).toBe(2)
    cache.monitoring?.reset()
    data = cache.monitoring?.get()
    expect(data ? data.count.success.set : 0).toBe(0)
    for (let i = 0; i < 25000; i++) {
      await cache.set({ fileName, key: 'static', payload })
    }
    expect(data ? data.logs.length : 0).toBe(500)
    for (let i = 0; i < 50; i++) {
      await cache.set({ fileName, key: 'static', payload })
    }
    expect(data ? data.logs.length : 0).toBe(1)
  }, 30000)
  it('flushAll', async () => {
    const cache = new FileSysCache({ basePath, enableMonitoring: true })
    cache.monitoring?.reset()
    cache.flushAll()
    const data = cache.monitoring?.get()
    expect(data ? data.count.success.flushAll : null).toBe(1)
  })
  it('flushByRegex', async () => {
    const cache = new FileSysCache({ basePath, enableMonitoring: true })
    cache.monitoring?.reset()
    cache.flushByRegex('regex-1')
    let data
    data = cache.monitoring?.get()
    expect(data ? data.count.error.flushByRegex : null).toBe(1)
    await cache.set({ fileName: 'flushByRegex', key: 'static', payload })
    data = cache.monitoring?.get()
    cache.flushByRegex('flushByRegex')
    expect(data ? data.count.success.set : null).toBe(1)
    expect(data ? data.count.success.flushByRegex : null).toBe(1)
  })
  it('validateFile', async () => {
    const cache = new FileSysCache({ basePath, enableMonitoring: true })
    cache.monitoring?.reset()
    await cache.invalidate()
    let data
    data = cache.monitoring?.get()
    expect(data ? data.count.error.invalidate : null).toBe(1)
    await cache.set({ fileName: 'flushByRegex', key: 'static', payload })
    data = cache.monitoring?.get()
    await cache.invalidate()
    expect(data ? data.count.success.set : null).toBe(1)
    expect(data ? data.count.success.invalidate : null).toBe(1)
    expect(data ? data.count.success.validateFile : null).toBe(1)
  })
  it('contains correct data', async () => {
    const cache = new FileSysCache({ basePath, enableMonitoring: true })
    cache.monitoring?.reset()
    for (let i = 0; i < 100; i++) {
      await cache.set({ fileName, key: 'static', payload })
    }
    const data = cache.monitoring?.get()
    const logEntry = data?.logs?.[0]
    const successCounts = data?.count.success
    const errorCounts = data?.count.error

    function verifyProperties (object: any, properties: string[]): void {
      for (const property of properties) {
        expect(object).toHaveProperty(property)
      }
    }

    verifyProperties(data, ['count', 'logs'])
    verifyProperties(logEntry, ['id', 'bytes', 'megabytes', 'storedFilesCount', 'date', 'count'])
    verifyProperties(successCounts, ['set', 'get', 'getOrSet', 'invalidate', 'validateFile', 'flushByRegex', 'flushAll'])
    verifyProperties(errorCounts, ['set', 'get', 'getOrSet', 'invalidate', 'validateFile', 'flushByRegex', 'flushAll'])
  })
})
