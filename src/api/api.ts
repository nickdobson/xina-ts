import { XDatabase, XElement, XElementSet } from '../element'
import { isRecord, XRecord } from '../record'
import { assertNonEmptyString, isNumber, isString } from '../util'

export interface XApiContext {
  databases: XElementSet<XDatabase>
}

export interface XApiComponent<T> {
  toString(): string
  isValid(): boolean
  load(obj: Record<string, unknown>, context: XApiContext): T
  clone(): T
  build(pretty: boolean): Record<string, unknown>
}

export function toIdentifier(value?: { name: string } | string) {
  if (value == null) throw Error('value cannot be null or undefined')

  if (isString(value)) return assertNonEmptyString(value)
  if (isString(value.name)) return assertNonEmptyString(value.name)

  throw Error(`invalid identifier: ${value}`)
}

export function toOptionalSpecifier(
  value?: XElement | XRecord | string | number,
  pretty = false
): string | number | undefined {
  if (value == null) return undefined
  return toSpecifier(value, pretty)
}

export function toSpecifier(value?: XElement | XRecord | string | number, pretty = false): string | number {
  if (value == null) throw Error('value cannot be null or undefined')

  if (isNumber(value)) return value
  if (isString(value)) return assertNonEmptyString(value)
  if (isRecord(value)) return value.$id

  // value is XElement
  return pretty ? value.getSpecifier() : value.getId()
}
