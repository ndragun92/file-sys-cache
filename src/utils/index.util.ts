import { createHash } from 'node:crypto'
import { type TBinaryToTextEncoding, type THashOptions } from '../types/index.type.ts'

export const generateKey = (value: string, hash: THashOptions = 'sha256', encoding: TBinaryToTextEncoding = 'hex'): string => {
  return createHash(hash).update(value).digest(encoding)
}
