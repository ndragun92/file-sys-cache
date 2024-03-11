import { createHash } from 'node:crypto'
import { type TBinaryToTextEncoding, type THashOptions } from '../types/index.type.ts'

export const generateKey = (payload: object, hash: THashOptions = 'sha256', encoding: TBinaryToTextEncoding = 'hex'): string => {
  const data = JSON.stringify(payload)
  return createHash(hash).update(data).digest(encoding)
}
