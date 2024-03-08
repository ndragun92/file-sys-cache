import { createHash } from 'node:crypto'
import { type IArguments, type TBinaryToTextEncoding, type THashOptions } from '../types/index.type.ts'

export const formatFileName = ({ fileNamePrefix, fileName, hash = 'sha256', encoding = 'hex' }: Pick<IArguments, 'fileNamePrefix' | 'fileName'> & { hash?: THashOptions, encoding?: TBinaryToTextEncoding }): string => {
  return `${fileNamePrefix ? `${fileNamePrefix} hash_` : 'hash_'}${createHash(hash).update(fileName).digest(encoding)}`
}
