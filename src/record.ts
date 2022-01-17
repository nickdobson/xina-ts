import { isNumber, trustIs, XDatabase, XRecordInterface } from './internal'

const RECORD_SYMBOL = Symbol()

export interface XRecord extends XRecordInterface, Record<string, unknown> {
  [RECORD_SYMBOL]: true
  record_id: number
  file_url?: string
  $id: number
  $database: XDatabase
  $parent?: XRecord
  $children?: Record<string, XRecord[]>
  $fileName?: string
  $get: <T>(f: string) => T
  $format: (f?: string) => string
}

interface XRecordInterfaceExt extends XRecordInterface {
  children?: Record<string, XRecordInterfaceExt[]>
}

export type XRecordsSpecifier = (XRecord | Record<string, unknown> | number)[]

export const isRecord = (r: unknown): r is XRecord => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return r && (r as any)[RECORD_SYMBOL]
}

export const buildRecordsSpecifier = (rs?: XRecordsSpecifier) => {
  if (rs == null) return undefined

  return rs.length
    ? rs.map((r) => {
        if (isRecord(r)) return r.$id
        if (isNumber(r)) return r
        return { type: 'key', key: r }
      })
    : { type: 'all' }
}

export function toRecords(database: XDatabase, objs: (Record<string, unknown> | XRecordInterfaceExt)[]): XRecord[] {
  return objs.map((obj) => toRecord(database, obj))
}

export function toRecord(database: XDatabase, obj: Record<string, unknown> | XRecordInterfaceExt): XRecord {
  if (!trustIs<XRecordInterfaceExt>(obj)) throw Error(`invalid record: ${obj}`)

  const record: XRecord = {
    ...obj,
    [RECORD_SYMBOL]: true,
    $database: database,
    $id: obj.record_id,
    $get<T>(f: string): T {
      return this[this.$database.fields.get(f).name] as T
    },
    $format(f?: string): string {
      return this.$database.formatRecord(this, f)
    }
  }

  if (database.file) {
    record.$fileName = database.file_format ? record.$format(database.file_format) : record.$get<string>('name')
  }

  if (obj.children) {
    const $children: Record<string, XRecord[]> = {}

    const children = obj.children
    delete record.children

    for (const databaseName in children) {
      $children[databaseName] = toRecords(database.getDatabase(databaseName), children[databaseName])
      $children[databaseName].forEach((child) => {
        child.$parent = record
      })
    }
  }

  return record
}
