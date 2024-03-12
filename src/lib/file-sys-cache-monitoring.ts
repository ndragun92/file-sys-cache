interface ICountAttributes {
  set: number
  get: number
  invalidate: number
  validateFile: number
  flushByRegex: number
  flushAll: number
}

interface ICount {
  success: ICountAttributes
  error: ICountAttributes
}

interface ILogs {
  id: number
  bytes: number
  megabytes: number
  storedFilesCount: number
  date: Date
  count: ICount
}

interface IMonitoring {
  logs: ILogs[]
  count: ICount
}

// Function for default ICountAttributes settings
const createDefaultCountAttributes = (): ICountAttributes => ({
  set: 0,
  get: 0,
  invalidate: 0,
  validateFile: 0,
  flushByRegex: 0,
  flushAll: 0
})

export const monitoringDefaults: IMonitoring = {
  logs: [],
  count: {
    success: createDefaultCountAttributes(),
    error: createDefaultCountAttributes()
  }
}

export let monitoring: IMonitoring = JSON.parse(JSON.stringify(monitoringDefaults))

export default class FileSysCacheMonitoring {
  get (): IMonitoring {
    return monitoring
  }

  set ({ sizeInBytes, storedFilesCount }: { sizeInBytes: number, storedFilesCount: number }): void {
    // After 500 stored logs delete logs
    if (monitoring.logs.length >= 500) {
      monitoring.logs = []
    }
    monitoring.logs.push({
      id: new Date().getTime(),
      bytes: sizeInBytes,
      megabytes: sizeInBytes / (1024 * 1024),
      storedFilesCount,
      date: new Date(),
      count: JSON.parse(JSON.stringify(monitoring.count))
    })
  }

  reset (): void {
    monitoring = JSON.parse(JSON.stringify(monitoringDefaults))
  }
}
