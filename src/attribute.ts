import { XDatabase, XDatabaseParameter, XRecord, XType, XTypes } from './internal'

export function forDatabase(database: XDatabase) {
  const attrs: XRecordAttribute<unknown>[] = []

  for (const attr of XRecordAttributeManager) {
    let matches = true

    attr.params?.forEach((param) => {
      matches = matches && !!database[param.name]
    })

    if (matches) attrs.push(attr)
  }

  return attrs
}

export class XAttribute<T, N extends string> {
  readonly name: N

  readonly label: string

  readonly type: XType<T>

  readonly desc: string

  readonly params?: XDatabaseParameter<unknown>[]

  readonly def?: string

  constructor(
    name: N,
    label: string,
    type: XType<T>,
    desc: string,
    params?: XDatabaseParameter<unknown>[],
    def?: string
  ) {
    this.name = name
    this.label = label
    this.type = type
    this.desc = desc
    this.params = params
    this.def = def
  }

  format(record: XRecord, format: string) {
    return this.type.format(record[this.name], format)
  }

  toString() {
    return this.label
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class XAttributeManager<A extends XAttribute<any, any>> {
  readonly values: A[]

  readonly nameMap: Record<string, A> = {}

  readonly labelMap: Record<string, A> = {}

  constructor(values: A[]) {
    this.values = values

    this.values.forEach((v) => {
      this.nameMap[v.name] = v
      this.labelMap[v.label] = v
    })
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]()
  }

  get(s: string) {
    s = s.trim().toLowerCase()
    const found = this.nameMap[s] || this.labelMap[s]

    if (found === undefined) throw Error(`parameter not found: ${s}`)

    return found
  }
}

export type XRecordAttributeName =
  | 'parent_id'
  | 'record_id'
  | 'version'
  | 'insert_id'
  | 'insert_at'
  | 'insert_by'
  | 'update_id'
  | 'update_at'
  | 'update_by'
  | 'trash_id'
  | 'trash_at'
  | 'trash_by'
  | 'restore_id'
  | 'restore_at'
  | 'restore_by'
  | 'lock'
  | 'lock_at'
  | 'lock_by'
  | 'sign'
  | 'sign_at'
  | 'sign_by'
  | 'sign_comment'
  | 'file_version'
  | 'file_type'
  | 'file_size'
  | 'file_md5'
  | 'file_object_id'
  | 'tags'
  | 'tags_add'
  | 'tags_remove'

export interface XRecordInterface extends Partial<Record<XRecordAttributeName, unknown>> {
  parent_id?: number
  record_id: number
  version?: number
  insert_id?: number
  insert_at?: number
  insert_by?: number
  update_id?: number
  update_at?: number
  update_by?: number
  trash_id?: number
  trash_at?: number
  trash_by?: number
  restore_id?: number
  restore_at?: number
  restore_by?: number
  lock?: boolean
  lock_at?: number
  lock_by?: number
  sign?: boolean
  sign_at?: number
  sign_by?: number
  sign_comment?: string
  file_version?: number
  file_type?: string
  file_size?: number
  file_md5?: string
  file_object_id?: string
  tags?: string
  tags_add?: string
  tags_remove?: string
}

export class XRecordAttribute<T> extends XAttribute<T, XRecordAttributeName> {
  static readonly PARENT_ID = new XRecordAttribute(
    'parent_id',
    'Parent ID',
    XTypes.RECORD_ID,
    'parent record identifier',
    [XDatabaseParameter.PARENT_DATABASE_ID]
  )

  static readonly RECORD_ID = new XRecordAttribute('record_id', 'Record ID', XTypes.SELF_ID, 'unique record identifier')

  static readonly VERSION = new XRecordAttribute(
    'version',
    'Version',
    XTypes.INT4,
    'record version',
    [XDatabaseParameter.LOG],
    '0'
  )

  static readonly INSERT_ID = new XRecordAttribute('insert_id', 'Insert ID', XTypes.LOG_ID, 'record insert ID', [
    XDatabaseParameter.LOG,
    XDatabaseParameter.TRACK
  ])

  static readonly INSERT_AT = new XRecordAttribute(
    'insert_at',
    'Insert At',
    XTypes.INSTANT_MS,
    'record insert instant',
    [XDatabaseParameter.TRACK]
  )

  static readonly INSERT_BY = new XRecordAttribute('insert_by', 'Insert By', XTypes.USER_ID, 'record insert user', [
    XDatabaseParameter.TRACK
  ])

  static readonly UPDATE_ID = new XRecordAttribute('update_id', 'Update ID', XTypes.LOG_ID, 'record update ID', [
    XDatabaseParameter.LOG,
    XDatabaseParameter.TRACK
  ])

  static readonly UPDATE_AT = new XRecordAttribute(
    'update_at',
    'Update At',
    XTypes.INSTANT_MS,
    'last record update instant',
    [XDatabaseParameter.TRACK]
  )

  static readonly UPDATE_BY = new XRecordAttribute(
    'update_by',
    'Update By',
    XTypes.USER_ID,
    'last record update user',
    [XDatabaseParameter.TRACK]
  )

  static readonly TRASH_ID = new XRecordAttribute('trash_id', 'Trash ID', XTypes.LOG_ID, 'record trash ID', [
    XDatabaseParameter.LOG,
    XDatabaseParameter.TRACK,
    XDatabaseParameter.TRASH
  ])

  static readonly TRASH_AT = new XRecordAttribute('trash_at', 'Trash At', XTypes.INSTANT_MS, 'record trash instant', [
    XDatabaseParameter.TRACK,
    XDatabaseParameter.TRASH
  ])

  static readonly TRASH_BY = new XRecordAttribute('trash_by', 'Trash By', XTypes.USER_ID, 'record trash user', [
    XDatabaseParameter.TRACK,
    XDatabaseParameter.TRASH
  ])

  static readonly RESTORE_ID = new XRecordAttribute(
    'restore_id',
    'Restore ID',
    XTypes.LOG_ID,
    'record restoration ID',
    [XDatabaseParameter.LOG, XDatabaseParameter.TRACK, XDatabaseParameter.TRASH]
  )

  static readonly RESTORE_AT = new XRecordAttribute(
    'restore_at',
    'Restore At',
    XTypes.INSTANT_MS,
    'record restoration instant',
    [XDatabaseParameter.TRACK, XDatabaseParameter.TRASH]
  )

  static readonly RESTORE_BY = new XRecordAttribute('restore_by', 'Restore By', XTypes.USER_ID, 'record restore user', [
    XDatabaseParameter.TRACK,
    XDatabaseParameter.TRASH
  ])

  static readonly LOCK = new XRecordAttribute(
    'lock',
    'Lock',
    XTypes.BOOLEAN,
    'record lock flag',
    [XDatabaseParameter.LOCK],
    'false'
  )

  static readonly LOCK_AT = new XRecordAttribute('lock_at', 'Lock At', XTypes.INSTANT_MS, 'record locked instant', [
    XDatabaseParameter.LOCK,
    XDatabaseParameter.TRACK
  ])

  static readonly LOCK_BY = new XRecordAttribute('lock_by', 'Lock By', XTypes.INT8, 'user who locked the record', [
    XDatabaseParameter.LOCK,
    XDatabaseParameter.TRACK
  ])

  static readonly SIGN = new XRecordAttribute(
    'sign',
    'Sign',
    XTypes.BOOLEAN,
    'record sign flag',
    [XDatabaseParameter.SIGN],
    'false'
  )

  static readonly SIGN_AT = new XRecordAttribute('sign_at', 'Sign At', XTypes.INSTANT_MS, 'record signed instant', [
    XDatabaseParameter.SIGN
  ])

  static readonly SIGN_BY = new XRecordAttribute('sign_by', 'Sign By', XTypes.INT8, 'user who signed the record', [
    XDatabaseParameter.SIGN
  ])

  static readonly SIGN_COMMENT = new XRecordAttribute(
    'sign_comment',
    'Sign Comment',
    XTypes.UTF8TEXT,
    'signature comment',
    [XDatabaseParameter.SIGN]
  )

  static readonly FILE_VERSION = new XRecordAttribute(
    'file_version',
    'File Version',
    XTypes.INT4,
    'file version',
    [XDatabaseParameter.FILE, XDatabaseParameter.LOG],
    '0'
  )

  static readonly FILE_TYPE = new XRecordAttribute('file_type', 'File Type', XTypes.UTF8STRING64, 'file content type', [
    XDatabaseParameter.FILE
  ])

  static readonly FILE_SIZE = new XRecordAttribute('file_size', 'File Size', XTypes.INT8, 'file size in bytes', [
    XDatabaseParameter.FILE
  ])

  static readonly FILE_MD5 = new XRecordAttribute('file_md5', 'File MD5', XTypes.ASCIISTRING32, 'file MD5 hash', [
    XDatabaseParameter.FILE
  ])

  static readonly FILE_OBJECT_ID = new XRecordAttribute(
    'file_object_id',
    'File Object ID',
    XTypes.ASCIISTRING32,
    'file object ID',
    [XDatabaseParameter.FILE]
  )

  static readonly TAGS = new XRecordAttribute('tags', 'Tags', XTypes.UTF8STRING, 'tags', [XDatabaseParameter.TAG], ';')

  static readonly TAGS_ADD = new XRecordAttribute('tags_add', 'Tags Add', XTypes.UTF8STRING, 'add tags buffer', [
    XDatabaseParameter.TAG
  ])

  static readonly TAGS_REMOVE = new XRecordAttribute(
    'tags_remove',
    'Tags Remove',
    XTypes.UTF8STRING,
    'remove tags buffer',
    [XDatabaseParameter.TAG]
  )
}

export const XRecordAttributeManager = new XAttributeManager<XRecordAttribute<unknown>>([
  XRecordAttribute.PARENT_ID,
  XRecordAttribute.RECORD_ID,
  XRecordAttribute.VERSION,
  XRecordAttribute.INSERT_ID,
  XRecordAttribute.INSERT_AT,
  XRecordAttribute.INSERT_BY,
  XRecordAttribute.UPDATE_ID,
  XRecordAttribute.UPDATE_AT,
  XRecordAttribute.UPDATE_BY,
  XRecordAttribute.TRASH_ID,
  XRecordAttribute.TRASH_AT,
  XRecordAttribute.TRASH_BY,
  XRecordAttribute.RESTORE_ID,
  XRecordAttribute.RESTORE_AT,
  XRecordAttribute.RESTORE_BY,
  XRecordAttribute.LOCK,
  XRecordAttribute.LOCK_AT,
  XRecordAttribute.LOCK_BY,
  XRecordAttribute.SIGN,
  XRecordAttribute.SIGN_AT,
  XRecordAttribute.SIGN_BY,
  XRecordAttribute.SIGN_COMMENT,
  XRecordAttribute.FILE_VERSION,
  XRecordAttribute.FILE_TYPE,
  XRecordAttribute.FILE_SIZE,
  XRecordAttribute.FILE_MD5,
  XRecordAttribute.FILE_OBJECT_ID,
  XRecordAttribute.TAGS,
  XRecordAttribute.TAGS_ADD,
  XRecordAttribute.TAGS_REMOVE
])

export type XBlobAttributeName = 'version' | 'size' | 'md5' | 'type' | 'update' | 'object_id'

export interface XRecordBlobInterface extends Partial<Record<XBlobAttributeName, unknown>> {
  version?: number
  size?: number
  md5?: string
  type?: string
  update?: boolean
  object_id?: string
}

export class XBlobAttribute<T> extends XAttribute<T, XBlobAttributeName> {
  static readonly VERSION = new XBlobAttribute(
    'version',
    'Version',
    XTypes.INT4,
    'version',
    [XDatabaseParameter.LOG],
    '0'
  )

  static readonly SIZE = new XBlobAttribute('size', 'Size', XTypes.INT8, 'size in bytes')

  static readonly MD5 = new XBlobAttribute('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash')

  static readonly TYPE = new XBlobAttribute('type', 'Type', XTypes.UTF8STRING64, 'content type')

  static readonly UPDATE = new XBlobAttribute('update', 'Update', XTypes.BOOLEAN, 'update flag')

  static readonly OBJECT_ID = new XBlobAttribute('object_id', 'Object ID', XTypes.ASCIISTRING16, 'object ID')
}

export const XBlobAttributeManager = new XAttributeManager<XBlobAttribute<unknown>>([
  XBlobAttribute.VERSION,
  XBlobAttribute.SIZE,
  XBlobAttribute.MD5,
  XBlobAttribute.TYPE,
  XBlobAttribute.UPDATE,
  XBlobAttribute.OBJECT_ID
])
