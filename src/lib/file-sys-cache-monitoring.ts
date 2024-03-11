interface ICountAttributes {
  set: number
  get: number
  getOrSet: number
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
  sizeTotal: number
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
  getOrSet: 0,
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

export let monitoring: typeof monitoringDefaults = JSON.parse(JSON.stringify(monitoringDefaults))

export default class FileSysCacheMonitoring {
  get (): IMonitoring {
    return monitoring
  }

  set (logs: Omit<ILogs, 'count' | 'id' | 'date'>): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    monitoring.logs.push({
      id: new Date().getTime(),
      ...Object(logs),
      date: new Date(),
      count: JSON.parse(JSON.stringify(monitoring.count))
    })
  }

  reset (): void {
    monitoring = JSON.parse(JSON.stringify(monitoringDefaults))
  }
}
