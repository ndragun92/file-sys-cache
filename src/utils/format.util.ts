import { createHash } from 'node:crypto'
import { type IArguments, type TBinaryToTextEncoding, type THashOptions } from '../types/index.type.ts'

export const formatFileName = ({ fileName, key, hash = 'sha256', encoding = 'hex' }: Pick<IArguments, 'fileName' | 'key'> & { hash?: THashOptions, encoding?: TBinaryToTextEncoding }): string => {
  return `${fileName ? `${fileName} hash_` : 'hash_'}${createHash(hash).update(key).digest(encoding)}`
}
