import { XTypes, XType } from './type'

export class XFlag {
  name: string

  flags: XFlag[]

  constructor(name: string, flags: XFlag[] = []) {
    this.name = name
    this.flags = flags
  }

  is(flag: XFlag) {
    return this === flag || this.flags.some((f) => flag === f)
  }
}

const IMMUTABLE = new XFlag('immutable', [])
const REQUIRED = new XFlag('required', [])
const SYSTEM = new XFlag('system', [])
const AUTO_INC = new XFlag('auto_inc', [])
const KEY = new XFlag('key', [SYSTEM, REQUIRED])

export class XParameter<T, N extends string> {
  readonly name: N

  readonly label: string

  readonly type: XType<T>

  readonly desc: string

  readonly flags?: XFlag[]

  readonly def?: string

  constructor(name: N, label: string, type: XType<T>, desc: string, flags?: XFlag[], def?: string) {
    this.name = name
    this.label = label
    this.type = type
    this.desc = desc
    this.def = def
    this.flags = flags
  }

  is(flag: XFlag) {
    if (!this.flags || !this.flags.length) return false
    return this.flags.some((f) => flag === f)
  }

  isImmutable() {
    return this.is(IMMUTABLE)
  }

  isKey() {
    return this.is(KEY)
  }

  isRequired() {
    return this.is(REQUIRED)
  }

  isSystem() {
    return this.is(SYSTEM)
  }

  toString() {
    return this.label
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class XParameterManager<P extends XParameter<any, any>> {
  readonly values: P[]

  readonly nameMap: Record<string, P> = {}

  readonly labelMap: Record<string, P> = {}

  constructor(values: P[]) {
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
export type XBlobParameterName = 'database_id' | 'blob_id' | 'ord' | 'name' | 'label' | 'nul' | 'lock' | 'desc'

export interface XBlobInterface extends Partial<Record<XBlobParameterName, unknown>> {
  database_id: number
  blob_id: number
  ord: number
  name: string
  label: string
  nul: boolean
  lock: boolean
  desc?: string
}

export class XBlobParameter<T> extends XParameter<T, XBlobParameterName> {
  static readonly DATABASE_ID = new XBlobParameter(
    'database_id',
    'Database ID',
    XTypes.DATABASE_ID,
    'unique database identifier',
    [REQUIRED]
  )

  static readonly BLOB_ID = new XBlobParameter('blob_id', 'Blob ID', XTypes.SELF_ID, 'unique blob identifier', [KEY])

  static readonly ORD = new XBlobParameter('ord', 'Ordinal', XTypes.INT4, 'ordinal position of the blob', [
    SYSTEM,
    REQUIRED
  ])

  static readonly NAME = new XBlobParameter('name', 'Name', XTypes.ASCIISTRING32, 'name of the blob', [REQUIRED])

  static readonly LABEL = new XBlobParameter('label', 'Label', XTypes.UTF8STRING64, 'label of the blob', [REQUIRED])

  static readonly NUL = new XBlobParameter(
    'nul',
    'Nullable',
    XTypes.BOOLEAN,
    'indicates if the blob can be null',
    [REQUIRED],
    'false'
  )

  static readonly LOCK = new XBlobParameter(
    'lock',
    'Lock',
    XTypes.BOOLEAN,
    'indicates if the blob is locked',
    [REQUIRED],
    'false'
  )

  static readonly DESC = new XBlobParameter('desc', 'Description', XTypes.UTF8TEXT, 'description of the blob')
}

export const XBlobParameterManager = new XParameterManager<XBlobParameter<unknown>>([
  XBlobParameter.DATABASE_ID,
  XBlobParameter.BLOB_ID,
  XBlobParameter.ORD,
  XBlobParameter.NAME,
  XBlobParameter.LABEL,
  XBlobParameter.NUL,
  XBlobParameter.LOCK,
  XBlobParameter.DESC
])

export type XBlobFileParameterName = 'blob_id' | 'key' | 'type' | 'size' | 'md5'

export interface XBlobFileInterface extends Partial<Record<XBlobFileParameterName, unknown>> {
  blob_id: number
  key: string
  type: string
  size: number
  md5: string
}

export class XBlobFileParameter<T> extends XParameter<T, XBlobFileParameterName> {
  static readonly BLOB_ID = new XBlobFileParameter('blob_id', 'Blob ID', XTypes.BLOB_ID, 'unique blob identifier', [
    KEY
  ])

  static readonly KEY = new XBlobFileParameter('key', 'Key', XTypes.UTF8STRING32, 'unique file identifier', [KEY])

  static readonly TYPE = new XBlobFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file content type', [REQUIRED])

  static readonly SIZE = new XBlobFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XBlobFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash of the file', [REQUIRED])
}

export const XBlobFileParameterManager = new XParameterManager<XBlobFileParameter<unknown>>([
  XBlobFileParameter.BLOB_ID,
  XBlobFileParameter.KEY,
  XBlobFileParameter.TYPE,
  XBlobFileParameter.SIZE,
  XBlobFileParameter.MD5
])

export type XBlobObjectParameterName = 'blob_id' | 'key' | 'value'

export interface XBlobObjectInterface extends Partial<Record<XBlobObjectParameterName, unknown>> {
  blob_id: number
  key: string
  value?: unknown[] | Record<string, unknown>
}

export class XBlobObjectParameter<T> extends XParameter<T, XBlobObjectParameterName> {
  static readonly BLOB_ID = new XBlobObjectParameter('blob_id', 'Blob ID', XTypes.INT8, 'unique blob identifier', [KEY])

  static readonly KEY = new XBlobObjectParameter('key', 'Key', XTypes.UTF8STRING32, 'unique object identifier', [KEY])

  static readonly VALUE = new XBlobObjectParameter('value', 'Value', XTypes.JSON, 'object value')
}

export const XBlobObjectParameterManager = new XParameterManager<XBlobObjectParameter<unknown>>([
  XBlobObjectParameter.BLOB_ID,
  XBlobObjectParameter.KEY,
  XBlobObjectParameter.VALUE
])

export type XDatabaseParameterName =
  | 'parent_group_id'
  | 'parent_database_id'
  | 'database_id'
  | 'name'
  | 'label'
  | 'version'
  | 'locked'
  | 'format'
  | 'file_format'
  | 'singular'
  | 'plural'
  | 'order'
  | 'indexes'
  | 'partition'
  | 'priority'
  | 'backup'
  | 'dynamic'
  | 'event'
  | 'face'
  | 'file'
  | 'keyless'
  | 'link'
  | 'lock'
  | 'log'
  | 'notify'
  | 'sign'
  | 'subscribe'
  | 'tag'
  | 'track'
  | 'trash'
  | 'wall'
  | 'clone_to'
  | 'desc'

export interface XDatabaseInterface extends Partial<Record<XDatabaseParameterName, unknown>> {
  parent_group_id?: number
  parent_database_id?: number
  database_id: number
  name: string
  label: string
  version: number
  locked: boolean
  format?: string
  file_format?: string
  singular?: string
  plural?: string
  order?: unknown[]
  indexes?: unknown[]
  partition?: Record<string, unknown>
  priority: number
  backup: boolean
  dynamic: boolean
  event: boolean
  face: boolean
  file: boolean
  keyless: boolean
  link: boolean
  lock: boolean
  log: boolean
  notify: boolean
  sign: boolean
  subscribe: boolean
  tag: boolean
  track: boolean
  trash: boolean
  wall: boolean
  clone_to?: number
  desc?: string
}

export class XDatabaseParameter<T> extends XParameter<T, XDatabaseParameterName> {
  static readonly PARENT_GROUP_ID = new XDatabaseParameter(
    'parent_group_id',
    'Parent Group ID',
    XTypes.GROUP_ID,
    'parent group identifier',
    [SYSTEM]
  )

  static readonly PARENT_DATABASE_ID = new XDatabaseParameter(
    'parent_database_id',
    'Parent Database ID',
    XTypes.DATABASE_ID,
    'parent database identifier',
    [SYSTEM]
  )

  static readonly DATABASE_ID = new XDatabaseParameter(
    'database_id',
    'Database ID',
    XTypes.SELF_ID,
    'unique database identifier',
    [KEY, IMMUTABLE]
  )

  static readonly NAME = new XDatabaseParameter('name', 'Name', XTypes.ASCIISTRING32, 'unique database name', [
    REQUIRED,
    IMMUTABLE
  ])

  static readonly LABEL = new XDatabaseParameter('label', 'Label', XTypes.UTF8STRING64, 'unique database label', [
    REQUIRED
  ])

  static readonly VERSION = new XDatabaseParameter(
    'version',
    'Version',
    XTypes.INT4,
    'database version',
    [SYSTEM, REQUIRED],
    '0'
  )

  static readonly LOCKED = new XDatabaseParameter(
    'locked',
    'Locked',
    XTypes.BOOLEAN,
    'database locked flag',
    [SYSTEM, REQUIRED],
    'false'
  )

  static readonly FORMAT = new XDatabaseParameter('format', 'Format', XTypes.UTF8STRING, 'record format')

  static readonly FILE_FORMAT = new XDatabaseParameter('file_format', 'File Format', XTypes.UTF8STRING, 'file format')

  static readonly SINGULAR = new XDatabaseParameter('singular', 'Singular', XTypes.UTF8STRING32, 'singular record name')

  static readonly PLURAL = new XDatabaseParameter('plural', 'Plural', XTypes.UTF8STRING32, 'plural record name')

  static readonly ORDER = new XDatabaseParameter('order', 'Order', XTypes.JSONARRAY, 'default ordering')

  static readonly INDEXES = new XDatabaseParameter(
    'indexes',
    'Indexes',
    XTypes.JSONARRAY,
    'list of indexes on the database',
    [SYSTEM]
  )

  static readonly PARTITION = new XDatabaseParameter(
    'partition',
    'Partition',
    XTypes.JSONOBJECT,
    'partition configuration',
    [SYSTEM]
  )

  static readonly PRIORITY = new XDatabaseParameter(
    'priority',
    'Priority',
    XTypes.INT4,
    'database priority',
    [REQUIRED],
    '0'
  )

  static readonly BACKUP = new XDatabaseParameter(
    'backup',
    'Backup',
    XTypes.BOOLEAN,
    'backup flag',
    [REQUIRED],
    'false'
  )

  static readonly DYNAMIC = new XDatabaseParameter(
    'dynamic',
    'Dynamic',
    XTypes.BOOLEAN,
    'dynamic flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly EVENT = new XDatabaseParameter(
    'event',
    'Event',
    XTypes.BOOLEAN,
    'event flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly FACE = new XDatabaseParameter('face', 'Face', XTypes.BOOLEAN, 'face flag', [REQUIRED], 'true')

  static readonly FILE = new XDatabaseParameter(
    'file',
    'File',
    XTypes.BOOLEAN,
    'file flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly KEYLESS = new XDatabaseParameter(
    'keyless',
    'Keyless',
    XTypes.BOOLEAN,
    'keyless mode flag',
    [REQUIRED],
    'false'
  )

  static readonly LINK = new XDatabaseParameter('link', 'Link', XTypes.BOOLEAN, 'record link flag', [REQUIRED], 'false')

  static readonly LOCK = new XDatabaseParameter(
    'lock',
    'Lock',
    XTypes.BOOLEAN,
    'record lock flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly LOG = new XDatabaseParameter('log', 'Log', XTypes.BOOLEAN, 'log flag', [REQUIRED, IMMUTABLE], 'false')

  static readonly NOTIFY = new XDatabaseParameter(
    'notify',
    'Notify',
    XTypes.BOOLEAN,
    'notification flag',
    [REQUIRED],
    'false'
  )

  static readonly SIGN = new XDatabaseParameter(
    'sign',
    'Sign',
    XTypes.BOOLEAN,
    'sign flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly SUBSCRIBE = new XDatabaseParameter(
    'subscribe',
    'Subscribe',
    XTypes.BOOLEAN,
    'subscription flag',
    [REQUIRED],
    'false'
  )

  static readonly TAG = new XDatabaseParameter('tag', 'Tag', XTypes.BOOLEAN, 'tag flag', [REQUIRED, IMMUTABLE], 'false')

  static readonly TRACK = new XDatabaseParameter(
    'track',
    'Track',
    XTypes.BOOLEAN,
    'track flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly TRASH = new XDatabaseParameter(
    'trash',
    'Trash',
    XTypes.BOOLEAN,
    'trash flag',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly WALL = new XDatabaseParameter('wall', 'Wall', XTypes.BOOLEAN, 'wall flag', [REQUIRED], 'false')

  static readonly CLONE_TO = new XDatabaseParameter(
    'clone_to',
    'Clone To',
    XTypes.DATABASE_ID,
    'clone to database identifier'
  )

  static readonly DESC = new XDatabaseParameter('desc', 'Description', XTypes.UTF8TEXT, 'database description')
}

export const XDatabaseParameterManager = new XParameterManager<XDatabaseParameter<unknown>>([
  XDatabaseParameter.PARENT_GROUP_ID,
  XDatabaseParameter.PARENT_DATABASE_ID,
  XDatabaseParameter.DATABASE_ID,
  XDatabaseParameter.NAME,
  XDatabaseParameter.LABEL,
  XDatabaseParameter.VERSION,
  XDatabaseParameter.LOCKED,
  XDatabaseParameter.FORMAT,
  XDatabaseParameter.FILE_FORMAT,
  XDatabaseParameter.SINGULAR,
  XDatabaseParameter.PLURAL,
  XDatabaseParameter.ORDER,
  XDatabaseParameter.INDEXES,
  XDatabaseParameter.PARTITION,
  XDatabaseParameter.PRIORITY,
  XDatabaseParameter.BACKUP,
  XDatabaseParameter.DYNAMIC,
  XDatabaseParameter.EVENT,
  XDatabaseParameter.FACE,
  XDatabaseParameter.FILE,
  XDatabaseParameter.KEYLESS,
  XDatabaseParameter.LINK,
  XDatabaseParameter.LOCK,
  XDatabaseParameter.LOG,
  XDatabaseParameter.NOTIFY,
  XDatabaseParameter.SIGN,
  XDatabaseParameter.SUBSCRIBE,
  XDatabaseParameter.TAG,
  XDatabaseParameter.TRACK,
  XDatabaseParameter.TRASH,
  XDatabaseParameter.WALL,
  XDatabaseParameter.CLONE_TO,
  XDatabaseParameter.DESC
])

export type XDatabaseFileParameterName = 'database_id' | 'key' | 'type' | 'size' | 'md5'

export interface XDatabaseFileInterface extends Partial<Record<XDatabaseFileParameterName, unknown>> {
  database_id: number
  key: string
  type: string
  size: number
  md5: string
}

export class XDatabaseFileParameter<T> extends XParameter<T, XDatabaseFileParameterName> {
  static readonly DATABASE_ID = new XDatabaseFileParameter(
    'database_id',
    'Database ID',
    XTypes.DATABASE_ID,
    'unique database identifier',
    [KEY]
  )

  static readonly KEY = new XDatabaseFileParameter('key', 'Key', XTypes.UTF8STRING32, 'unique file identifier', [KEY])

  static readonly TYPE = new XDatabaseFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file content type', [
    REQUIRED
  ])

  static readonly SIZE = new XDatabaseFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XDatabaseFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash of the file', [
    REQUIRED
  ])
}

export const XDatabaseFileParameterManager = new XParameterManager<XDatabaseFileParameter<unknown>>([
  XDatabaseFileParameter.DATABASE_ID,
  XDatabaseFileParameter.KEY,
  XDatabaseFileParameter.TYPE,
  XDatabaseFileParameter.SIZE,
  XDatabaseFileParameter.MD5
])

export type XDatabaseObjectParameterName = 'database_id' | 'key' | 'value'

export interface XDatabaseObjectInterface extends Partial<Record<XDatabaseObjectParameterName, unknown>> {
  database_id: number
  key: string
  value?: unknown[] | Record<string, unknown>
}

export class XDatabaseObjectParameter<T> extends XParameter<T, XDatabaseObjectParameterName> {
  static readonly DATABASE_ID = new XDatabaseObjectParameter(
    'database_id',
    'Database ID',
    XTypes.INT8,
    'unique database identifier',
    [KEY]
  )

  static readonly KEY = new XDatabaseObjectParameter('key', 'Key', XTypes.UTF8STRING32, 'unique object identifier', [
    KEY
  ])

  static readonly VALUE = new XDatabaseObjectParameter('value', 'Value', XTypes.JSON, 'object value')
}

export const XDatabaseObjectParameterManager = new XParameterManager<XDatabaseObjectParameter<unknown>>([
  XDatabaseObjectParameter.DATABASE_ID,
  XDatabaseObjectParameter.KEY,
  XDatabaseObjectParameter.VALUE
])

export type XFieldParameterName =
  | 'database_id'
  | 'field_id'
  | 'ref'
  | 'ord'
  | 'name'
  | 'label'
  | 'type'
  | 'key'
  | 'nul'
  | 'options'
  | 'strict'
  | 'lock'
  | 'any'
  | 'format'
  | 'meas'
  | 'unit'
  | 'desc'
  | 'def'

export interface XFieldInterface extends Partial<Record<XFieldParameterName, unknown>> {
  database_id: number
  field_id: number
  ref?: string
  ord: number
  name: string
  label: string
  type: string
  key: boolean
  nul: boolean
  options?: unknown[]
  strict: boolean
  lock: boolean
  any: boolean
  format?: string
  meas?: string
  unit?: string
  desc?: string
  def?: string
}

export class XFieldParameter<T> extends XParameter<T, XFieldParameterName> {
  static readonly DATABASE_ID = new XFieldParameter(
    'database_id',
    'Database ID',
    XTypes.DATABASE_ID,
    'unique database identifier',
    [KEY]
  )

  static readonly FIELD_ID = new XFieldParameter('field_id', 'Field ID', XTypes.SELF_ID, 'unique field identifier', [
    KEY
  ])

  static readonly REF = new XFieldParameter('ref', 'Reference', XTypes.ASCIISTRING32, 'reference field name', [SYSTEM])

  static readonly ORD = new XFieldParameter('ord', 'Ordinal', XTypes.INT4, 'ordinal position of the field', [
    SYSTEM,
    REQUIRED
  ])

  static readonly NAME = new XFieldParameter('name', 'Name', XTypes.ASCIISTRING32, 'name of the field', [
    REQUIRED,
    IMMUTABLE
  ])

  static readonly LABEL = new XFieldParameter('label', 'Label', XTypes.UTF8STRING64, 'label of the field', [REQUIRED])

  static readonly TYPE = new XFieldParameter(
    'type',
    'Type',
    XTypes.TYPE,
    'data type of the field',
    [REQUIRED],
    'utf8text'
  )

  static readonly KEY = new XFieldParameter(
    'key',
    'Key',
    XTypes.BOOLEAN,
    'indicates if the field is a key field',
    [REQUIRED, IMMUTABLE],
    'false'
  )

  static readonly NUL = new XFieldParameter(
    'nul',
    'Nullable',
    XTypes.BOOLEAN,
    'indicates if the field can be null',
    [REQUIRED],
    'false'
  )

  static readonly OPTIONS = new XFieldParameter('options', 'Options', XTypes.JSONARRAY, 'the options for the field')

  static readonly STRICT = new XFieldParameter(
    'strict',
    'Strict',
    XTypes.BOOLEAN,
    'indicates if the field should only allow options',
    [REQUIRED],
    'false'
  )

  static readonly LOCK = new XFieldParameter(
    'lock',
    'Lock',
    XTypes.BOOLEAN,
    'indicates if the field is locked',
    [REQUIRED],
    'false'
  )

  static readonly ANY = new XFieldParameter(
    'any',
    'Any',
    XTypes.BOOLEAN,
    'indicates if the field is included in "any" searches',
    [REQUIRED],
    'true'
  )

  static readonly FORMAT = new XFieldParameter('format', 'Format', XTypes.UTF8STRING32, 'format to display the field')

  static readonly MEAS = new XFieldParameter('meas', 'Measure', XTypes.UTF8STRING32, 'measure of the field')

  static readonly UNIT = new XFieldParameter('unit', 'Units', XTypes.UTF8STRING32, 'units of the field')

  static readonly DESC = new XFieldParameter('desc', 'Description', XTypes.UTF8TEXT, 'description of the field')

  static readonly DEF = new XFieldParameter('def', 'Default', XTypes.UTF8TEXT, 'default value of the field', [
    IMMUTABLE
  ])
}

export const XFieldParameterManager = new XParameterManager<XFieldParameter<unknown>>([
  XFieldParameter.DATABASE_ID,
  XFieldParameter.FIELD_ID,
  XFieldParameter.REF,
  XFieldParameter.ORD,
  XFieldParameter.NAME,
  XFieldParameter.LABEL,
  XFieldParameter.TYPE,
  XFieldParameter.KEY,
  XFieldParameter.NUL,
  XFieldParameter.OPTIONS,
  XFieldParameter.STRICT,
  XFieldParameter.LOCK,
  XFieldParameter.ANY,
  XFieldParameter.FORMAT,
  XFieldParameter.MEAS,
  XFieldParameter.UNIT,
  XFieldParameter.DESC,
  XFieldParameter.DEF
])

export type XFieldFileParameterName = 'field_id' | 'key' | 'type' | 'size' | 'md5'

export interface XFieldFileInterface extends Partial<Record<XFieldFileParameterName, unknown>> {
  field_id: number
  key: string
  type: string
  size: number
  md5: string
}

export class XFieldFileParameter<T> extends XParameter<T, XFieldFileParameterName> {
  static readonly FIELD_ID = new XFieldFileParameter(
    'field_id',
    'Field ID',
    XTypes.FIELD_ID,
    'unique field identifier',
    [KEY]
  )

  static readonly KEY = new XFieldFileParameter('key', 'Key', XTypes.UTF8STRING32, 'unique file identifier', [KEY])

  static readonly TYPE = new XFieldFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file content type', [REQUIRED])

  static readonly SIZE = new XFieldFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XFieldFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash of the file', [REQUIRED])
}

export const XFieldFileParameterManager = new XParameterManager<XFieldFileParameter<unknown>>([
  XFieldFileParameter.FIELD_ID,
  XFieldFileParameter.KEY,
  XFieldFileParameter.TYPE,
  XFieldFileParameter.SIZE,
  XFieldFileParameter.MD5
])

export type XFieldObjectParameterName = 'field_id' | 'key' | 'value'

export interface XFieldObjectInterface extends Partial<Record<XFieldObjectParameterName, unknown>> {
  field_id: number
  key: string
  value?: unknown[] | Record<string, unknown>
}

export class XFieldObjectParameter<T> extends XParameter<T, XFieldObjectParameterName> {
  static readonly FIELD_ID = new XFieldObjectParameter('field_id', 'Field ID', XTypes.INT8, 'unique field identifier', [
    KEY
  ])

  static readonly KEY = new XFieldObjectParameter('key', 'Key', XTypes.UTF8STRING32, 'unique object identifier', [KEY])

  static readonly VALUE = new XFieldObjectParameter('value', 'Value', XTypes.JSON, 'object value')
}

export const XFieldObjectParameterManager = new XParameterManager<XFieldObjectParameter<unknown>>([
  XFieldObjectParameter.FIELD_ID,
  XFieldObjectParameter.KEY,
  XFieldObjectParameter.VALUE
])

export type XGroupParameterName =
  | 'parent_id'
  | 'group_id'
  | 'name'
  | 'label'
  | 'desc'
  | 'priority'
  | 'face'
  | 'wall'
  | 'alias_id'

export interface XGroupInterface extends Partial<Record<XGroupParameterName, unknown>> {
  parent_id?: number
  group_id: number
  name: string
  label: string
  desc?: string
  priority: number
  face: boolean
  wall: boolean
  alias_id?: number
}

export class XGroupParameter<T> extends XParameter<T, XGroupParameterName> {
  static readonly PARENT_ID = new XGroupParameter(
    'parent_id',
    'Parent ID',
    XTypes.GROUP_ID,
    'parent group identifier',
    [SYSTEM]
  )

  static readonly GROUP_ID = new XGroupParameter('group_id', 'Group ID', XTypes.SELF_ID, 'unique group identifier', [
    KEY
  ])

  static readonly NAME = new XGroupParameter('name', 'Name', XTypes.ASCIISTRING32, 'unique group name', [
    REQUIRED,
    IMMUTABLE
  ])

  static readonly LABEL = new XGroupParameter('label', 'Label', XTypes.UTF8STRING64, 'unique group label', [REQUIRED])

  static readonly DESC = new XGroupParameter('desc', 'Description', XTypes.UTF8TEXT, 'group description')

  static readonly PRIORITY = new XGroupParameter('priority', 'Priority', XTypes.INT4, 'group priority', [REQUIRED], '0')

  static readonly FACE = new XGroupParameter('face', 'Face', XTypes.BOOLEAN, 'face flag', [REQUIRED], 'true')

  static readonly WALL = new XGroupParameter('wall', 'Wall', XTypes.BOOLEAN, 'wall flag', [REQUIRED], 'true')

  static readonly ALIAS_ID = new XGroupParameter('alias_id', 'Alias ID', XTypes.GROUP_ID, 'alias group identifier')
}

export const XGroupParameterManager = new XParameterManager<XGroupParameter<unknown>>([
  XGroupParameter.PARENT_ID,
  XGroupParameter.GROUP_ID,
  XGroupParameter.NAME,
  XGroupParameter.LABEL,
  XGroupParameter.DESC,
  XGroupParameter.PRIORITY,
  XGroupParameter.FACE,
  XGroupParameter.WALL,
  XGroupParameter.ALIAS_ID
])

export type XGroupFileParameterName = 'group_id' | 'key' | 'type' | 'size' | 'md5'

export interface XGroupFileInterface extends Partial<Record<XGroupFileParameterName, unknown>> {
  group_id: number
  key: string
  type: string
  size: number
  md5: string
}

export class XGroupFileParameter<T> extends XParameter<T, XGroupFileParameterName> {
  static readonly GROUP_ID = new XGroupFileParameter(
    'group_id',
    'Group ID',
    XTypes.GROUP_ID,
    'unique group identifier',
    [KEY]
  )

  static readonly KEY = new XGroupFileParameter('key', 'Key', XTypes.UTF8STRING64, 'unique file identifier', [KEY])

  static readonly TYPE = new XGroupFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file content type', [REQUIRED])

  static readonly SIZE = new XGroupFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XGroupFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash of the file', [REQUIRED])
}

export const XGroupFileParameterManager = new XParameterManager<XGroupFileParameter<unknown>>([
  XGroupFileParameter.GROUP_ID,
  XGroupFileParameter.KEY,
  XGroupFileParameter.TYPE,
  XGroupFileParameter.SIZE,
  XGroupFileParameter.MD5
])

export type XGroupObjectParameterName = 'group_id' | 'key' | 'value'

export interface XGroupObjectInterface extends Partial<Record<XGroupObjectParameterName, unknown>> {
  group_id: number
  key: string
  value?: unknown[] | Record<string, unknown>
}

export class XGroupObjectParameter<T> extends XParameter<T, XGroupObjectParameterName> {
  static readonly GROUP_ID = new XGroupObjectParameter(
    'group_id',
    'Group ID',
    XTypes.GROUP_ID,
    'unique group identifier',
    [KEY]
  )

  static readonly KEY = new XGroupObjectParameter('key', 'Key', XTypes.UTF8STRING64, 'unique object identifier', [KEY])

  static readonly VALUE = new XGroupObjectParameter('value', 'Value', XTypes.JSON, 'object value')
}

export const XGroupObjectParameterManager = new XParameterManager<XGroupObjectParameter<unknown>>([
  XGroupObjectParameter.GROUP_ID,
  XGroupObjectParameter.KEY,
  XGroupObjectParameter.VALUE
])

export type XLogParameterName = 'log_id' | 'user_id' | 'timestamp' | 'desc'

export interface XLogInterface extends Partial<Record<XLogParameterName, unknown>> {
  log_id: number
  user_id: number
  timestamp: number
  desc?: string
}

export class XLogParameter<T> extends XParameter<T, XLogParameterName> {
  static readonly LOG_ID = new XLogParameter('log_id', 'Log ID', XTypes.SELF_ID, 'log identifier', [KEY, AUTO_INC])

  static readonly USER_ID = new XLogParameter('user_id', 'User ID', XTypes.USER_ID, 'unique user identifier', [
    REQUIRED
  ])

  static readonly TIMESTAMP = new XLogParameter('timestamp', 'Timestamp', XTypes.INSTANT_MS, 'timestamp', [REQUIRED])

  static readonly DESC = new XLogParameter('desc', 'Description', XTypes.UTF8TEXT, 'description')
}

export const XLogParameterManager = new XParameterManager<XLogParameter<unknown>>([
  XLogParameter.LOG_ID,
  XLogParameter.USER_ID,
  XLogParameter.TIMESTAMP,
  XLogParameter.DESC
])

export type XLogEditParameterName =
  | 'log_id'
  | 'edit_id'
  | 'record_id'
  | 'field_id'
  | 'blob_id'
  | 'insert'
  | 'delete'
  | 'trash'
  | 'restore'
  | 'dispose'
  | 'file'
  | 'tag'
  | 'old'
  | 'new'

export interface XLogEditInterface extends Partial<Record<XLogEditParameterName, unknown>> {
  log_id: number
  edit_id: number
  record_id?: number
  field_id?: number
  blob_id?: number
  insert: boolean
  delete: boolean
  trash: boolean
  restore: boolean
  dispose: boolean
  file: boolean
  tag: boolean
  old?: string
  new?: string
}

export class XLogEditParameter<T> extends XParameter<T, XLogEditParameterName> {
  static readonly LOG_ID = new XLogEditParameter('log_id', 'Log ID', XTypes.LOG_ID, 'log identifier', [REQUIRED])

  static readonly EDIT_ID = new XLogEditParameter('edit_id', 'Edit ID', XTypes.SELF_ID, 'log edit identifier', [
    KEY,
    AUTO_INC
  ])

  static readonly RECORD_ID = new XLogEditParameter(
    'record_id',
    'Record ID',
    XTypes.RECORD_ID,
    'unique record identifier'
  )

  static readonly FIELD_ID = new XLogEditParameter('field_id', 'Field ID', XTypes.FIELD_ID, 'unique field identifier')

  static readonly BLOB_ID = new XLogEditParameter('blob_id', 'Blob ID', XTypes.BLOB_ID, 'unique blob identifier')

  static readonly INSERT = new XLogEditParameter('insert', 'Insert', XTypes.BOOLEAN, 'insert flag', [REQUIRED], 'false')

  static readonly DELETE = new XLogEditParameter('delete', 'Delete', XTypes.BOOLEAN, 'delete flag', [REQUIRED], 'false')

  static readonly TRASH = new XLogEditParameter('trash', 'Trash', XTypes.BOOLEAN, 'trash flag', [REQUIRED], 'false')

  static readonly RESTORE = new XLogEditParameter(
    'restore',
    'Restore',
    XTypes.BOOLEAN,
    'restore flag',
    [REQUIRED],
    'false'
  )

  static readonly DISPOSE = new XLogEditParameter(
    'dispose',
    'Dispose',
    XTypes.BOOLEAN,
    'dispose flag',
    [REQUIRED],
    'false'
  )

  static readonly FILE = new XLogEditParameter('file', 'File', XTypes.BOOLEAN, 'file flag', [REQUIRED], 'false')

  static readonly TAG = new XLogEditParameter('tag', 'Tag', XTypes.BOOLEAN, 'tag flag', [REQUIRED], 'false')

  static readonly OLD = new XLogEditParameter('old', 'Old', XTypes.UTF8TEXT, 'old value of field')

  static readonly NEW = new XLogEditParameter('new', 'New', XTypes.UTF8TEXT, 'new value of field')
}

export const XLogEditParameterManager = new XParameterManager<XLogEditParameter<unknown>>([
  XLogEditParameter.LOG_ID,
  XLogEditParameter.EDIT_ID,
  XLogEditParameter.RECORD_ID,
  XLogEditParameter.FIELD_ID,
  XLogEditParameter.BLOB_ID,
  XLogEditParameter.INSERT,
  XLogEditParameter.DELETE,
  XLogEditParameter.TRASH,
  XLogEditParameter.RESTORE,
  XLogEditParameter.DISPOSE,
  XLogEditParameter.FILE,
  XLogEditParameter.TAG,
  XLogEditParameter.OLD,
  XLogEditParameter.NEW
])

export type XNotificationParameterName =
  | 'notification_id'
  | 'time'
  | 'user_id'
  | 'source_id'
  | 'post_id'
  | 'thread_id'
  | 'task_id'
  | 'request_id'
  | 'type'
  | 'level'
  | 'seen'
  | 'cause'

export interface XNotificationInterface extends Partial<Record<XNotificationParameterName, unknown>> {
  notification_id: string
  time: number
  user_id?: number
  source_id: string
  post_id?: number
  thread_id?: number
  task_id?: number
  request_id?: number
  type: number
  level: number
  seen: boolean
  cause?: unknown[]
}

export class XNotificationParameter<T> extends XParameter<T, XNotificationParameterName> {
  static readonly NOTIFICATION_ID = new XNotificationParameter(
    'notification_id',
    'Notification ID',
    XTypes.UUID,
    'notification identifier',
    [REQUIRED]
  )

  static readonly TIME = new XNotificationParameter('time', 'Time', XTypes.INSTANT_MS, 'time', [REQUIRED])

  static readonly USER_ID = new XNotificationParameter('user_id', 'User ID', XTypes.SELF_ID, 'unique user identifier')

  static readonly SOURCE_ID = new XNotificationParameter(
    'source_id',
    'Source ID',
    XTypes.ASCIISTRING32,
    'source identifier',
    [REQUIRED]
  )

  static readonly POST_ID = new XNotificationParameter('post_id', 'Post ID', XTypes.SELF_ID, 'post identifier')

  static readonly THREAD_ID = new XNotificationParameter('thread_id', 'Thread ID', XTypes.INT8, 'thread identifier')

  static readonly TASK_ID = new XNotificationParameter('task_id', 'Task ID', XTypes.SELF_ID, 'unique task identifier')

  static readonly REQUEST_ID = new XNotificationParameter(
    'request_id',
    'Request ID',
    XTypes.SELF_ID,
    'unique request identifier'
  )

  static readonly TYPE = new XNotificationParameter('type', 'Type', XTypes.NOTIFICATION_TYPE, 'notification type', [
    REQUIRED
  ])

  static readonly LEVEL = new XNotificationParameter(
    'level',
    'Level',
    XTypes.NOTIFICATION_LEVEL,
    'notification level',
    [REQUIRED]
  )

  static readonly SEEN = new XNotificationParameter('seen', 'Seen', XTypes.BOOLEAN, 'seen flag', [REQUIRED], 'false')

  static readonly CAUSE = new XNotificationParameter('cause', 'Cause', XTypes.JSONARRAY, 'cause reference(s)')
}

export const XNotificationParameterManager = new XParameterManager<XNotificationParameter<unknown>>([
  XNotificationParameter.NOTIFICATION_ID,
  XNotificationParameter.TIME,
  XNotificationParameter.USER_ID,
  XNotificationParameter.SOURCE_ID,
  XNotificationParameter.POST_ID,
  XNotificationParameter.THREAD_ID,
  XNotificationParameter.TASK_ID,
  XNotificationParameter.REQUEST_ID,
  XNotificationParameter.TYPE,
  XNotificationParameter.LEVEL,
  XNotificationParameter.SEEN,
  XNotificationParameter.CAUSE
])

export type XPostParameterName =
  | 'wall_id'
  | 'post_id'
  | 'thread_id'
  | 'global'
  | 'user_id'
  | 'team_id'
  | 'group_id'
  | 'database_id'
  | 'record_id'
  | 'path'
  | 'ref'
  | 'root'
  | 'replies'
  | 'active'
  | 'type'
  | 'level'
  | 'text'
  | 'insert_at'
  | 'insert_by'
  | 'reply_at'
  | 'reply_by'
  | 'update_at'
  | 'update_by'
  | 'trash_at'
  | 'trash_by'
  | 'reactions'
  | 'mentions'
  | 'tags'
  | 'names'
  | 'files'

export interface XPostInterface extends Partial<Record<XPostParameterName, unknown>> {
  wall_id: string
  post_id: number
  thread_id?: number
  global: boolean
  user_id?: number
  team_id?: number
  group_id?: number
  database_id?: number
  record_id?: number
  path?: string[]
  ref?: Record<string, unknown>
  root: boolean
  replies?: number
  active: boolean
  type: number
  level: number
  text?: string
  insert_at: number
  insert_by: number
  reply_at: number
  reply_by: number
  update_at?: number
  update_by?: number
  trash_at?: number
  trash_by?: number
  reactions?: Record<string, unknown>
  mentions?: number[]
  tags?: string[]
  names?: string
  files?: Record<string, unknown>[]
}

export class XPostParameter<T> extends XParameter<T, XPostParameterName> {
  static readonly WALL_ID = new XPostParameter('wall_id', 'Wall ID', XTypes.WALL_ID, 'wall identifier', [REQUIRED])

  static readonly POST_ID = new XPostParameter('post_id', 'Post ID', XTypes.SELF_ID, 'post identifier', [KEY])

  static readonly THREAD_ID = new XPostParameter('thread_id', 'Thread ID', XTypes.INT8, 'thread identifier')

  static readonly GLOBAL = new XPostParameter(
    'global',
    'Global',
    XTypes.BOOLEAN,
    'indicates if the post is on the global wall',
    [REQUIRED],
    'false'
  )

  static readonly USER_ID = new XPostParameter('user_id', 'User ID', XTypes.SELF_ID, 'unique user identifier')

  static readonly TEAM_ID = new XPostParameter('team_id', 'Team ID', XTypes.SELF_ID, 'unique team identifier')

  static readonly GROUP_ID = new XPostParameter('group_id', 'Group ID', XTypes.SELF_ID, 'unique group identifier')

  static readonly DATABASE_ID = new XPostParameter(
    'database_id',
    'Database ID',
    XTypes.SELF_ID,
    'unique database identifier'
  )

  static readonly RECORD_ID = new XPostParameter('record_id', 'Record ID', XTypes.SELF_ID, 'unique record identifier')

  static readonly PATH = new XPostParameter('path', 'Path', XTypes.listOf<string>(XTypes.WALL_ID), 'full post path')

  static readonly REF = new XPostParameter('ref', 'Ref', XTypes.JSONOBJECT, 'post reference')

  static readonly ROOT = new XPostParameter(
    'root',
    'Root',
    XTypes.BOOLEAN,
    'indicates if the post is root',
    [REQUIRED],
    'true'
  )

  static readonly REPLIES = new XPostParameter('replies', 'Replies', XTypes.INT4, 'post reply count')

  static readonly ACTIVE = new XPostParameter(
    'active',
    'Active',
    XTypes.BOOLEAN,
    'indicates if the post is active',
    [REQUIRED],
    'true'
  )

  static readonly TYPE = new XPostParameter('type', 'Type', XTypes.POST_TYPE, 'post type', [REQUIRED], 'MESSAGE')

  static readonly LEVEL = new XPostParameter('level', 'Level', XTypes.POST_LEVEL, 'post level', [REQUIRED], 'NONE')

  static readonly TEXT = new XPostParameter('text', 'Text', XTypes.UTF8TEXT, 'post text')

  static readonly INSERT_AT = new XPostParameter(
    'insert_at',
    'Insert At',
    XTypes.INSTANT_MS,
    'timestamp when the post was inserted',
    [REQUIRED]
  )

  static readonly INSERT_BY = new XPostParameter(
    'insert_by',
    'Insert By',
    XTypes.USER_ID,
    'user who inserted the post',
    [REQUIRED]
  )

  static readonly REPLY_AT = new XPostParameter(
    'reply_at',
    'Reply At',
    XTypes.INSTANT_MS,
    'timestamp when the post was last replied to',
    [REQUIRED]
  )

  static readonly REPLY_BY = new XPostParameter(
    'reply_by',
    'Reply By',
    XTypes.USER_ID,
    'user who last replied to the post',
    [REQUIRED]
  )

  static readonly UPDATE_AT = new XPostParameter(
    'update_at',
    'Update At',
    XTypes.INSTANT_MS,
    'timestamp when the post was last updated'
  )

  static readonly UPDATE_BY = new XPostParameter(
    'update_by',
    'Update By',
    XTypes.USER_ID,
    'user who last updated the post'
  )

  static readonly TRASH_AT = new XPostParameter(
    'trash_at',
    'Trash At',
    XTypes.INSTANT_MS,
    'timestamp when the post was trashed'
  )

  static readonly TRASH_BY = new XPostParameter('trash_by', 'Trash By', XTypes.USER_ID, 'user who trashed the post')

  static readonly REACTIONS = new XPostParameter('reactions', 'Reactions', XTypes.JSONOBJECT, 'user reactions')

  static readonly MENTIONS = new XPostParameter(
    'mentions',
    'Mentions',
    XTypes.setOf<number>(XTypes.USER_ID),
    'user mentions'
  )

  static readonly TAGS = new XPostParameter('tags', 'Tags', XTypes.setOf<string>(XTypes.UTF8STRING64), 'tags')

  static readonly NAMES = new XPostParameter('names', 'Names', XTypes.UTF8TEXT, 'names')

  static readonly FILES = new XPostParameter(
    'files',
    'Files',
    XTypes.listOf<Record<string, unknown>>(XTypes.JSONOBJECT),
    'files'
  )
}

export const XPostParameterManager = new XParameterManager<XPostParameter<unknown>>([
  XPostParameter.WALL_ID,
  XPostParameter.POST_ID,
  XPostParameter.THREAD_ID,
  XPostParameter.GLOBAL,
  XPostParameter.USER_ID,
  XPostParameter.TEAM_ID,
  XPostParameter.GROUP_ID,
  XPostParameter.DATABASE_ID,
  XPostParameter.RECORD_ID,
  XPostParameter.PATH,
  XPostParameter.REF,
  XPostParameter.ROOT,
  XPostParameter.REPLIES,
  XPostParameter.ACTIVE,
  XPostParameter.TYPE,
  XPostParameter.LEVEL,
  XPostParameter.TEXT,
  XPostParameter.INSERT_AT,
  XPostParameter.INSERT_BY,
  XPostParameter.REPLY_AT,
  XPostParameter.REPLY_BY,
  XPostParameter.UPDATE_AT,
  XPostParameter.UPDATE_BY,
  XPostParameter.TRASH_AT,
  XPostParameter.TRASH_BY,
  XPostParameter.REACTIONS,
  XPostParameter.MENTIONS,
  XPostParameter.TAGS,
  XPostParameter.NAMES,
  XPostParameter.FILES
])

export type XPrivDatabaseParameterName =
  | 'user_id'
  | 'database_id'
  | 'select'
  | 'post'
  | 'reply'
  | 'tag'
  | 'update'
  | 'insert'
  | 'trash'
  | 'delete'
  | 'sign'
  | 'lock'
  | 'alter'
  | 'grant'

export interface XPrivDatabaseInterface extends Partial<Record<XPrivDatabaseParameterName, unknown>> {
  user_id: number
  database_id: number
  select: boolean
  post: boolean
  reply: boolean
  tag: boolean
  update: boolean
  insert: boolean
  trash: boolean
  delete: boolean
  sign: boolean
  lock: boolean
  alter: boolean
  grant: boolean
}

export class XPrivDatabaseParameter<T> extends XParameter<T, XPrivDatabaseParameterName> {
  static readonly USER_ID = new XPrivDatabaseParameter('user_id', 'User ID', XTypes.SELF_ID, 'unique user identifier', [
    KEY
  ])

  static readonly DATABASE_ID = new XPrivDatabaseParameter(
    'database_id',
    'Database ID',
    XTypes.SELF_ID,
    'unique database identifier',
    [KEY]
  )

  static readonly SELECT = new XPrivDatabaseParameter(
    'select',
    'select',
    XTypes.BOOLEAN,
    'select privilege',
    [REQUIRED],
    'false'
  )

  static readonly POST = new XPrivDatabaseParameter(
    'post',
    'post',
    XTypes.BOOLEAN,
    'post privilege',
    [REQUIRED],
    'false'
  )

  static readonly REPLY = new XPrivDatabaseParameter(
    'reply',
    'reply',
    XTypes.BOOLEAN,
    'reply privilege',
    [REQUIRED],
    'false'
  )

  static readonly TAG = new XPrivDatabaseParameter('tag', 'tag', XTypes.BOOLEAN, 'tag privilege', [REQUIRED], 'false')

  static readonly UPDATE = new XPrivDatabaseParameter(
    'update',
    'update',
    XTypes.BOOLEAN,
    'update privilege',
    [REQUIRED],
    'false'
  )

  static readonly INSERT = new XPrivDatabaseParameter(
    'insert',
    'insert',
    XTypes.BOOLEAN,
    'insert privilege',
    [REQUIRED],
    'false'
  )

  static readonly TRASH = new XPrivDatabaseParameter(
    'trash',
    'trash',
    XTypes.BOOLEAN,
    'trash privilege',
    [REQUIRED],
    'false'
  )

  static readonly DELETE = new XPrivDatabaseParameter(
    'delete',
    'delete',
    XTypes.BOOLEAN,
    'delete privilege',
    [REQUIRED],
    'false'
  )

  static readonly SIGN = new XPrivDatabaseParameter(
    'sign',
    'sign',
    XTypes.BOOLEAN,
    'sign privilege',
    [REQUIRED],
    'false'
  )

  static readonly LOCK = new XPrivDatabaseParameter(
    'lock',
    'lock',
    XTypes.BOOLEAN,
    'lock privilege',
    [REQUIRED],
    'false'
  )

  static readonly ALTER = new XPrivDatabaseParameter(
    'alter',
    'alter',
    XTypes.BOOLEAN,
    'alter privilege',
    [REQUIRED],
    'false'
  )

  static readonly GRANT = new XPrivDatabaseParameter(
    'grant',
    'grant',
    XTypes.BOOLEAN,
    'grant privilege',
    [REQUIRED],
    'false'
  )
}

export const XPrivDatabaseParameterManager = new XParameterManager<XPrivDatabaseParameter<unknown>>([
  XPrivDatabaseParameter.USER_ID,
  XPrivDatabaseParameter.DATABASE_ID,
  XPrivDatabaseParameter.SELECT,
  XPrivDatabaseParameter.POST,
  XPrivDatabaseParameter.REPLY,
  XPrivDatabaseParameter.TAG,
  XPrivDatabaseParameter.UPDATE,
  XPrivDatabaseParameter.INSERT,
  XPrivDatabaseParameter.TRASH,
  XPrivDatabaseParameter.DELETE,
  XPrivDatabaseParameter.SIGN,
  XPrivDatabaseParameter.LOCK,
  XPrivDatabaseParameter.ALTER,
  XPrivDatabaseParameter.GRANT
])

export type XPrivGroupParameterName = 'user_id' | 'group_id' | 'select' | 'post' | 'reply' | 'alter' | 'grant'

export interface XPrivGroupInterface extends Partial<Record<XPrivGroupParameterName, unknown>> {
  user_id: number
  group_id: number
  select: boolean
  post: boolean
  reply: boolean
  alter: boolean
  grant: boolean
}

export class XPrivGroupParameter<T> extends XParameter<T, XPrivGroupParameterName> {
  static readonly USER_ID = new XPrivGroupParameter('user_id', 'User ID', XTypes.SELF_ID, 'unique user identifier', [
    KEY
  ])

  static readonly GROUP_ID = new XPrivGroupParameter(
    'group_id',
    'Group ID',
    XTypes.SELF_ID,
    'unique group identifier',
    [KEY]
  )

  static readonly SELECT = new XPrivGroupParameter(
    'select',
    'select',
    XTypes.BOOLEAN,
    'select privilege',
    [REQUIRED],
    'false'
  )

  static readonly POST = new XPrivGroupParameter('post', 'post', XTypes.BOOLEAN, 'post privilege', [REQUIRED], 'false')

  static readonly REPLY = new XPrivGroupParameter(
    'reply',
    'reply',
    XTypes.BOOLEAN,
    'reply privilege',
    [REQUIRED],
    'false'
  )

  static readonly ALTER = new XPrivGroupParameter(
    'alter',
    'alter',
    XTypes.BOOLEAN,
    'alter privilege',
    [REQUIRED],
    'false'
  )

  static readonly GRANT = new XPrivGroupParameter(
    'grant',
    'grant',
    XTypes.BOOLEAN,
    'grant privilege',
    [REQUIRED],
    'false'
  )
}

export const XPrivGroupParameterManager = new XParameterManager<XPrivGroupParameter<unknown>>([
  XPrivGroupParameter.USER_ID,
  XPrivGroupParameter.GROUP_ID,
  XPrivGroupParameter.SELECT,
  XPrivGroupParameter.POST,
  XPrivGroupParameter.REPLY,
  XPrivGroupParameter.ALTER,
  XPrivGroupParameter.GRANT
])

export type XRecordLinkParameterName =
  | 'from_database_id'
  | 'from_record_id'
  | 'to_database_id'
  | 'to_record_id'
  | 'desc'

export interface XRecordLinkInterface extends Partial<Record<XRecordLinkParameterName, unknown>> {
  from_database_id: number
  from_record_id: number
  to_database_id: number
  to_record_id: number
  desc?: string
}

export class XRecordLinkParameter<T> extends XParameter<T, XRecordLinkParameterName> {
  static readonly FROM_DATABASE_ID = new XRecordLinkParameter(
    'from_database_id',
    'From Database ID',
    XTypes.DATABASE_ID,
    'from database ID',
    [KEY]
  )

  static readonly FROM_RECORD_ID = new XRecordLinkParameter(
    'from_record_id',
    'From Record ID',
    XTypes.RECORD_ID,
    'from record ID',
    [KEY]
  )

  static readonly TO_DATABASE_ID = new XRecordLinkParameter(
    'to_database_id',
    'To Database ID',
    XTypes.DATABASE_ID,
    'to database ID',
    [KEY]
  )

  static readonly TO_RECORD_ID = new XRecordLinkParameter(
    'to_record_id',
    'To Record ID',
    XTypes.RECORD_ID,
    'to record ID',
    [KEY]
  )

  static readonly DESC = new XRecordLinkParameter('desc', 'Description', XTypes.UTF8TEXT, 'description of the link')
}

export const XRecordLinkParameterManager = new XParameterManager<XRecordLinkParameter<unknown>>([
  XRecordLinkParameter.FROM_DATABASE_ID,
  XRecordLinkParameter.FROM_RECORD_ID,
  XRecordLinkParameter.TO_DATABASE_ID,
  XRecordLinkParameter.TO_RECORD_ID,
  XRecordLinkParameter.DESC
])

export type XRequestParameterName =
  | 'request_id'
  | 'request_by'
  | 'request_at'
  | 'resolve_by'
  | 'resolve_at'
  | 'status'
  | 'justification'
  | 'response'
  | 'action'

export interface XRequestInterface extends Partial<Record<XRequestParameterName, unknown>> {
  request_id: number
  request_by: number
  request_at: number
  resolve_by?: number
  resolve_at?: number
  status: number
  justification?: string
  response?: string
  action: Record<string, unknown>
}

export class XRequestParameter<T> extends XParameter<T, XRequestParameterName> {
  static readonly REQUEST_ID = new XRequestParameter(
    'request_id',
    'Request ID',
    XTypes.SELF_ID,
    'unique request identifier',
    [KEY, AUTO_INC]
  )

  static readonly REQUEST_BY = new XRequestParameter('request_by', 'Request By', XTypes.USER_ID, 'requesting user', [
    REQUIRED
  ])

  static readonly REQUEST_AT = new XRequestParameter(
    'request_at',
    'Request At',
    XTypes.INSTANT_MS,
    'requesting timestamp',
    [REQUIRED]
  )

  static readonly RESOLVE_BY = new XRequestParameter('resolve_by', 'Resolve By', XTypes.USER_ID, 'resolving user')

  static readonly RESOLVE_AT = new XRequestParameter(
    'resolve_at',
    'Resolve At',
    XTypes.INSTANT_MS,
    'resolving timestamp'
  )

  static readonly STATUS = new XRequestParameter(
    'status',
    'Status',
    XTypes.REQUEST_STATUS,
    'request status',
    [REQUIRED],
    'REQUESTED'
  )

  static readonly JUSTIFICATION = new XRequestParameter(
    'justification',
    'Justification',
    XTypes.UTF8TEXT,
    'request justification'
  )

  static readonly RESPONSE = new XRequestParameter('response', 'Response', XTypes.UTF8TEXT, 'request response')

  static readonly ACTION = new XRequestParameter('action', 'Action', XTypes.JSONOBJECT, 'request action', [REQUIRED])
}

export const XRequestParameterManager = new XParameterManager<XRequestParameter<unknown>>([
  XRequestParameter.REQUEST_ID,
  XRequestParameter.REQUEST_BY,
  XRequestParameter.REQUEST_AT,
  XRequestParameter.RESOLVE_BY,
  XRequestParameter.RESOLVE_AT,
  XRequestParameter.STATUS,
  XRequestParameter.JUSTIFICATION,
  XRequestParameter.RESPONSE,
  XRequestParameter.ACTION
])

export type XStoreParameterName =
  | 'name'
  | 'key'
  | 'type'
  | 'timestamp'
  | 'ref'
  | 'value'
  | 'user_id'
  | 'active'
  | 'desc'

export interface XStoreInterface extends Partial<Record<XStoreParameterName, unknown>> {
  name: string
  key: string
  type: string
  timestamp: number
  ref: string
  value?: unknown[] | Record<string, unknown>
  user_id: number
  active: boolean
  desc?: string
}

export class XStoreParameter<T> extends XParameter<T, XStoreParameterName> {
  static readonly NAME = new XStoreParameter('name', 'Name', XTypes.ASCIISTRING32, 'unique store name', [KEY])

  static readonly KEY = new XStoreParameter('key', 'Key', XTypes.ASCIISTRING64, 'unique object identifier', [KEY])

  static readonly TYPE = new XStoreParameter('type', 'Type', XTypes.ASCIISTRING16, 'object type', [KEY])

  static readonly TIMESTAMP = new XStoreParameter(
    'timestamp',
    'Timestamp',
    XTypes.INSTANT_MS,
    'timestamp when created',
    [KEY]
  )

  static readonly REF = new XStoreParameter('ref', 'Ref', XTypes.ASCIISTRING64, 'object identifier when created', [
    REQUIRED
  ])

  static readonly VALUE = new XStoreParameter('value', 'Value', XTypes.JSON, 'object value')

  static readonly USER_ID = new XStoreParameter('user_id', 'User ID', XTypes.USER_ID, 'user identifier', [REQUIRED])

  static readonly ACTIVE = new XStoreParameter('active', 'Active', XTypes.BOOLEAN, 'active flag', [REQUIRED])

  static readonly DESC = new XStoreParameter('desc', 'Description', XTypes.UTF8TEXT, 'description')
}

export const XStoreParameterManager = new XParameterManager<XStoreParameter<unknown>>([
  XStoreParameter.NAME,
  XStoreParameter.KEY,
  XStoreParameter.TYPE,
  XStoreParameter.TIMESTAMP,
  XStoreParameter.REF,
  XStoreParameter.VALUE,
  XStoreParameter.USER_ID,
  XStoreParameter.ACTIVE,
  XStoreParameter.DESC
])

export type XTaskParameterName =
  | 'task_id'
  | 'user_id'
  | 'name'
  | 'parent_id'
  | 'ref_id'
  | 'priority'
  | 'timeout'
  | 'conf'
  | 'state'
  | 'created'
  | 'updated'
  | 'started'
  | 'ended'
  | 'concluded'
  | 'progress'
  | 'imports'
  | 'imported'
  | 'runner'
  | 'thread'
  | 'archive'
  | 'auto'
  | 'open'
  | 'seen'
  | 'desc'
  | 'log'
  | 'result'
  | 'warning'

export interface XTaskInterface extends Partial<Record<XTaskParameterName, unknown>> {
  task_id: number
  user_id: number
  name: string
  parent_id?: number
  ref_id?: number
  priority: number
  timeout?: number
  conf: Record<string, unknown>
  state: number
  created: number
  updated: number
  started?: number
  ended?: number
  concluded?: number
  progress?: number
  imports?: number
  imported?: number
  runner?: string
  thread?: string
  archive: boolean
  auto: boolean
  open: boolean
  seen: boolean
  desc?: string
  log?: string
  result?: Record<string, unknown>
  warning?: string
}

export class XTaskParameter<T> extends XParameter<T, XTaskParameterName> {
  static readonly TASK_ID = new XTaskParameter('task_id', 'Task ID', XTypes.SELF_ID, 'unique task identifier', [KEY])

  static readonly USER_ID = new XTaskParameter('user_id', 'User ID', XTypes.USER_ID, 'user who ran the task', [
    REQUIRED
  ])

  static readonly NAME = new XTaskParameter('name', 'Name', XTypes.ASCIISTRING64, 'task name', [REQUIRED])

  static readonly PARENT_ID = new XTaskParameter('parent_id', 'Parent ID', XTypes.INT8, 'task parent ID')

  static readonly REF_ID = new XTaskParameter('ref_id', 'Ref ID', XTypes.INT8, 'task reference ID')

  static readonly PRIORITY = new XTaskParameter('priority', 'Priority', XTypes.INT4, 'task priority', [REQUIRED], '0')

  static readonly TIMEOUT = new XTaskParameter('timeout', 'Timeout', XTypes.INT4, 'task timeout')

  static readonly CONF = new XTaskParameter('conf', 'Conf', XTypes.JSONOBJECT, 'task configuration', [REQUIRED])

  static readonly STATE = new XTaskParameter('state', 'State', XTypes.INT4, 'task state', [REQUIRED], '0')

  static readonly CREATED = new XTaskParameter('created', 'Created', XTypes.INSTANT_MS, 'task creation time', [
    REQUIRED
  ])

  static readonly UPDATED = new XTaskParameter('updated', 'Updated', XTypes.INSTANT_MS, 'task update time', [REQUIRED])

  static readonly STARTED = new XTaskParameter('started', 'Started', XTypes.INSTANT_MS, 'task execution start time')

  static readonly ENDED = new XTaskParameter('ended', 'Ended', XTypes.INSTANT_MS, 'task execution end time')

  static readonly CONCLUDED = new XTaskParameter('concluded', 'Concluded', XTypes.INSTANT_MS, 'task conclusion time')

  static readonly PROGRESS = new XTaskParameter('progress', 'Progress', XTypes.INT4, 'task progress')

  static readonly IMPORTS = new XTaskParameter('imports', 'Imports', XTypes.INT4, 'files to import')

  static readonly IMPORTED = new XTaskParameter('imported', 'Imported', XTypes.INT4, 'files imported')

  static readonly RUNNER = new XTaskParameter('runner', 'Runner', XTypes.ASCIISTRING64, 'task runner')

  static readonly THREAD = new XTaskParameter('thread', 'Thread', XTypes.ASCIISTRING64, 'task thread name')

  static readonly ARCHIVE = new XTaskParameter(
    'archive',
    'Archive',
    XTypes.BOOLEAN,
    'task archive flag',
    [REQUIRED],
    'false'
  )

  static readonly AUTO = new XTaskParameter('auto', 'Auto', XTypes.BOOLEAN, 'task auto flag', [REQUIRED], 'false')

  static readonly OPEN = new XTaskParameter('open', 'Open', XTypes.BOOLEAN, 'task open flag', [REQUIRED], 'false')

  static readonly SEEN = new XTaskParameter(
    'seen',
    'Seen',
    XTypes.BOOLEAN,
    'indicates if task results have been seen by user',
    [REQUIRED],
    'false'
  )

  static readonly DESC = new XTaskParameter('desc', 'Desc', XTypes.UTF8STRING, 'task description')

  static readonly LOG = new XTaskParameter('log', 'Log', XTypes.ASCIISTRING, 'task log')

  static readonly RESULT = new XTaskParameter('result', 'Result', XTypes.JSONOBJECT, 'task result')

  static readonly WARNING = new XTaskParameter('warning', 'Warning', XTypes.UTF8STRING, 'task warning')
}

export const XTaskParameterManager = new XParameterManager<XTaskParameter<unknown>>([
  XTaskParameter.TASK_ID,
  XTaskParameter.USER_ID,
  XTaskParameter.NAME,
  XTaskParameter.PARENT_ID,
  XTaskParameter.REF_ID,
  XTaskParameter.PRIORITY,
  XTaskParameter.TIMEOUT,
  XTaskParameter.CONF,
  XTaskParameter.STATE,
  XTaskParameter.CREATED,
  XTaskParameter.UPDATED,
  XTaskParameter.STARTED,
  XTaskParameter.ENDED,
  XTaskParameter.CONCLUDED,
  XTaskParameter.PROGRESS,
  XTaskParameter.IMPORTS,
  XTaskParameter.IMPORTED,
  XTaskParameter.RUNNER,
  XTaskParameter.THREAD,
  XTaskParameter.ARCHIVE,
  XTaskParameter.AUTO,
  XTaskParameter.OPEN,
  XTaskParameter.SEEN,
  XTaskParameter.DESC,
  XTaskParameter.LOG,
  XTaskParameter.RESULT,
  XTaskParameter.WARNING
])

export type XTaskEventParameterName = 'event_id' | 'task_id' | 'state' | 'timestamp' | 'progress' | 'desc'

export interface XTaskEventInterface extends Partial<Record<XTaskEventParameterName, unknown>> {
  event_id: number
  task_id: number
  state: number
  timestamp: number
  progress?: number
  desc?: string
}

export class XTaskEventParameter<T> extends XParameter<T, XTaskEventParameterName> {
  static readonly EVENT_ID = new XTaskEventParameter(
    'event_id',
    'Event ID',
    XTypes.SELF_ID,
    'unique event identifier',
    [KEY, AUTO_INC]
  )

  static readonly TASK_ID = new XTaskEventParameter('task_id', 'Task ID', XTypes.TASK_ID, 'unique task identifier', [
    REQUIRED
  ])

  static readonly STATE = new XTaskEventParameter('state', 'State', XTypes.INT4, 'event state', [REQUIRED])

  static readonly TIMESTAMP = new XTaskEventParameter('timestamp', 'Timestamp', XTypes.INSTANT_MS, 'timestamp', [
    REQUIRED
  ])

  static readonly PROGRESS = new XTaskEventParameter('progress', 'Progress', XTypes.INT4, 'task progress')

  static readonly DESC = new XTaskEventParameter('desc', 'Description', XTypes.UTF8TEXT, 'event description')
}

export const XTaskEventParameterManager = new XParameterManager<XTaskEventParameter<unknown>>([
  XTaskEventParameter.EVENT_ID,
  XTaskEventParameter.TASK_ID,
  XTaskEventParameter.STATE,
  XTaskEventParameter.TIMESTAMP,
  XTaskEventParameter.PROGRESS,
  XTaskEventParameter.DESC
])

export type XTaskFileParameterName = 'file_id' | 'task_id' | 'name' | 'log' | 'type' | 'size' | 'md5'

export interface XTaskFileInterface extends Partial<Record<XTaskFileParameterName, unknown>> {
  file_id: number
  task_id: number
  name: string
  log: boolean
  type: string
  size: number
  md5: string
}

export class XTaskFileParameter<T> extends XParameter<T, XTaskFileParameterName> {
  static readonly FILE_ID = new XTaskFileParameter('file_id', 'File ID', XTypes.SELF_ID, 'file identifier', [
    KEY,
    AUTO_INC
  ])

  static readonly TASK_ID = new XTaskFileParameter('task_id', 'Task ID', XTypes.TASK_ID, 'task identifier', [REQUIRED])

  static readonly NAME = new XTaskFileParameter('name', 'Name', XTypes.UTF8STRING128, 'file name', [REQUIRED])

  static readonly LOG = new XTaskFileParameter('log', 'Log', XTypes.BOOLEAN, 'log file flag', [REQUIRED], 'false')

  static readonly TYPE = new XTaskFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file type', [REQUIRED])

  static readonly SIZE = new XTaskFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XTaskFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 file checksum', [REQUIRED])
}

export const XTaskFileParameterManager = new XParameterManager<XTaskFileParameter<unknown>>([
  XTaskFileParameter.FILE_ID,
  XTaskFileParameter.TASK_ID,
  XTaskFileParameter.NAME,
  XTaskFileParameter.LOG,
  XTaskFileParameter.TYPE,
  XTaskFileParameter.SIZE,
  XTaskFileParameter.MD5
])

export type XTaskThreadParameterName =
  | 'name'
  | 'task_id'
  | 'task_state'
  | 'task_update'
  | 'lock'
  | 'lock_at'
  | 'lock_by'
  | 'pause'
  | 'pause_at'
  | 'pause_by'
  | 'resume'
  | 'resume_at'
  | 'resume_by'

export interface XTaskThreadInterface extends Partial<Record<XTaskThreadParameterName, unknown>> {
  name: string
  task_id?: number
  task_state?: number
  task_update?: number
  lock: boolean
  lock_at?: number
  lock_by?: number
  pause: boolean
  pause_at?: number
  pause_by?: number
  resume: boolean
  resume_at?: number
  resume_by?: number
}

export class XTaskThreadParameter<T> extends XParameter<T, XTaskThreadParameterName> {
  static readonly NAME = new XTaskThreadParameter('name', 'Name', XTypes.ASCIISTRING64, 'thread name', [KEY])

  static readonly TASK_ID = new XTaskThreadParameter('task_id', 'Task ID', XTypes.TASK_ID, 'current task identifier')

  static readonly TASK_STATE = new XTaskThreadParameter('task_state', 'Task State', XTypes.INT4, 'task state')

  static readonly TASK_UPDATE = new XTaskThreadParameter(
    'task_update',
    'Task Update',
    XTypes.INSTANT_MS,
    'task update time'
  )

  static readonly LOCK = new XTaskThreadParameter(
    'lock',
    'Lock',
    XTypes.BOOLEAN,
    'thread lock flag',
    [REQUIRED],
    'false'
  )

  static readonly LOCK_AT = new XTaskThreadParameter('lock_at', 'Lock At', XTypes.INSTANT_MS, 'thread lock timestamp')

  static readonly LOCK_BY = new XTaskThreadParameter('lock_by', 'Lock By', XTypes.TASK_ID, 'thread lock task ID')

  static readonly PAUSE = new XTaskThreadParameter(
    'pause',
    'Pause',
    XTypes.BOOLEAN,
    'thread pause flag',
    [REQUIRED],
    'false'
  )

  static readonly PAUSE_AT = new XTaskThreadParameter(
    'pause_at',
    'Pause At',
    XTypes.INSTANT_MS,
    'thread pause timestamp'
  )

  static readonly PAUSE_BY = new XTaskThreadParameter('pause_by', 'Pause By', XTypes.USER_ID, 'thread pause user ID')

  static readonly RESUME = new XTaskThreadParameter(
    'resume',
    'Resume',
    XTypes.BOOLEAN,
    'thread resume flag',
    [REQUIRED],
    'false'
  )

  static readonly RESUME_AT = new XTaskThreadParameter(
    'resume_at',
    'Resume At',
    XTypes.INSTANT_MS,
    'thread resume timestamp'
  )

  static readonly RESUME_BY = new XTaskThreadParameter(
    'resume_by',
    'Resume By',
    XTypes.USER_ID,
    'thread resume user ID'
  )
}

export const XTaskThreadParameterManager = new XParameterManager<XTaskThreadParameter<unknown>>([
  XTaskThreadParameter.NAME,
  XTaskThreadParameter.TASK_ID,
  XTaskThreadParameter.TASK_STATE,
  XTaskThreadParameter.TASK_UPDATE,
  XTaskThreadParameter.LOCK,
  XTaskThreadParameter.LOCK_AT,
  XTaskThreadParameter.LOCK_BY,
  XTaskThreadParameter.PAUSE,
  XTaskThreadParameter.PAUSE_AT,
  XTaskThreadParameter.PAUSE_BY,
  XTaskThreadParameter.RESUME,
  XTaskThreadParameter.RESUME_AT,
  XTaskThreadParameter.RESUME_BY
])

export type XTeamParameterName =
  | 'team_id'
  | 'name'
  | 'label'
  | 'priority'
  | 'group_privileges'
  | 'database_privileges'
  | 'desc'

export interface XTeamInterface extends Partial<Record<XTeamParameterName, unknown>> {
  team_id: number
  name: string
  label: string
  priority: number
  group_privileges: unknown[]
  database_privileges: unknown[]
  desc?: string
}

export class XTeamParameter<T> extends XParameter<T, XTeamParameterName> {
  static readonly TEAM_ID = new XTeamParameter('team_id', 'Team ID', XTypes.SELF_ID, 'unique team identifier', [KEY])

  static readonly NAME = new XTeamParameter('name', 'Name', XTypes.ASCIISTRING32, 'unique team name', [REQUIRED])

  static readonly LABEL = new XTeamParameter('label', 'Label', XTypes.UTF8STRING64, 'unique team label', [REQUIRED])

  static readonly PRIORITY = new XTeamParameter('priority', 'Priority', XTypes.INT4, 'team priority', [REQUIRED], '0')

  static readonly GROUP_PRIVILEGES = new XTeamParameter(
    'group_privileges',
    'Group Privileges',
    XTypes.JSONARRAY,
    'default group privileges',
    [REQUIRED]
  )

  static readonly DATABASE_PRIVILEGES = new XTeamParameter(
    'database_privileges',
    'Database Privileges',
    XTypes.JSONARRAY,
    'default database privileges',
    [REQUIRED]
  )

  static readonly DESC = new XTeamParameter('desc', 'Description', XTypes.UTF8TEXT, 'team description')
}

export const XTeamParameterManager = new XParameterManager<XTeamParameter<unknown>>([
  XTeamParameter.TEAM_ID,
  XTeamParameter.NAME,
  XTeamParameter.LABEL,
  XTeamParameter.PRIORITY,
  XTeamParameter.GROUP_PRIVILEGES,
  XTeamParameter.DATABASE_PRIVILEGES,
  XTeamParameter.DESC
])

export type XTeamFileParameterName = 'team_id' | 'key' | 'type' | 'size' | 'md5'

export interface XTeamFileInterface extends Partial<Record<XTeamFileParameterName, unknown>> {
  team_id: number
  key: string
  type: string
  size: number
  md5: string
}

export class XTeamFileParameter<T> extends XParameter<T, XTeamFileParameterName> {
  static readonly TEAM_ID = new XTeamFileParameter('team_id', 'Team ID', XTypes.TEAM_ID, 'unique team identifier', [
    KEY
  ])

  static readonly KEY = new XTeamFileParameter('key', 'Key', XTypes.UTF8STRING64, 'unique file identifier', [KEY])

  static readonly TYPE = new XTeamFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file content type', [REQUIRED])

  static readonly SIZE = new XTeamFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XTeamFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash of the file', [REQUIRED])
}

export const XTeamFileParameterManager = new XParameterManager<XTeamFileParameter<unknown>>([
  XTeamFileParameter.TEAM_ID,
  XTeamFileParameter.KEY,
  XTeamFileParameter.TYPE,
  XTeamFileParameter.SIZE,
  XTeamFileParameter.MD5
])

export type XTeamObjectParameterName = 'team_id' | 'key' | 'value'

export interface XTeamObjectInterface extends Partial<Record<XTeamObjectParameterName, unknown>> {
  team_id: number
  key: string
  value?: unknown[] | Record<string, unknown>
}

export class XTeamObjectParameter<T> extends XParameter<T, XTeamObjectParameterName> {
  static readonly TEAM_ID = new XTeamObjectParameter('team_id', 'Team ID', XTypes.TEAM_ID, 'unique team identifier', [
    KEY
  ])

  static readonly KEY = new XTeamObjectParameter('key', 'Key', XTypes.UTF8STRING64, 'unique object identifier', [KEY])

  static readonly VALUE = new XTeamObjectParameter('value', 'Value', XTypes.JSON, 'object value')
}

export const XTeamObjectParameterManager = new XParameterManager<XTeamObjectParameter<unknown>>([
  XTeamObjectParameter.TEAM_ID,
  XTeamObjectParameter.KEY,
  XTeamObjectParameter.VALUE
])

export type XTeamSubParameterName =
  | 'sub_id'
  | 'team_id'
  | 'wall_id'
  | 'email'
  | 'file'
  | 'types'
  | 'levels'
  | 'keywords'
  | 'desc'

export interface XTeamSubInterface extends Partial<Record<XTeamSubParameterName, unknown>> {
  sub_id: string
  team_id: number
  wall_id?: string
  email: boolean
  file: boolean
  types?: number[]
  levels?: number[]
  keywords?: string[]
  desc?: string
}

export class XTeamSubParameter<T> extends XParameter<T, XTeamSubParameterName> {
  static readonly SUB_ID = new XTeamSubParameter('sub_id', 'Sub ID', XTypes.UUID, 'subscription identifier', [KEY])

  static readonly TEAM_ID = new XTeamSubParameter('team_id', 'Team ID', XTypes.TEAM_ID, 'team identifier', [
    REQUIRED,
    SYSTEM
  ])

  static readonly WALL_ID = new XTeamSubParameter('wall_id', 'Wall ID', XTypes.WALL_ID, 'wall identifier')

  static readonly EMAIL = new XTeamSubParameter('email', 'Email', XTypes.BOOLEAN, 'email flag', [REQUIRED], 'false')

  static readonly FILE = new XTeamSubParameter('file', 'File', XTypes.BOOLEAN, 'file filter flag', [REQUIRED], 'false')

  static readonly TYPES = new XTeamSubParameter('types', 'Types', XTypes.setOf<number>(XTypes.POST_TYPE), 'post types')

  static readonly LEVELS = new XTeamSubParameter(
    'levels',
    'Levels',
    XTypes.setOf<number>(XTypes.POST_LEVEL),
    'post levels'
  )

  static readonly KEYWORDS = new XTeamSubParameter(
    'keywords',
    'Keywords',
    XTypes.setOf<string>(XTypes.UTF8STRING64),
    'post keywords'
  )

  static readonly DESC = new XTeamSubParameter('desc', 'Description', XTypes.UTF8STRING, 'subscription description')
}

export const XTeamSubParameterManager = new XParameterManager<XTeamSubParameter<unknown>>([
  XTeamSubParameter.SUB_ID,
  XTeamSubParameter.TEAM_ID,
  XTeamSubParameter.WALL_ID,
  XTeamSubParameter.EMAIL,
  XTeamSubParameter.FILE,
  XTeamSubParameter.TYPES,
  XTeamSubParameter.LEVELS,
  XTeamSubParameter.KEYWORDS,
  XTeamSubParameter.DESC
])

export type XUserParameterName =
  | 'user_id'
  | 'username'
  | 'super'
  | 'read_all'
  | 'write_all'
  | 'email'
  | 'email2'
  | 'first'
  | 'middle'
  | 'last'
  | 'center'
  | 'employer'
  | 'phone'
  | 'title'
  | 'info'

export interface XUserInterface extends Partial<Record<XUserParameterName, unknown>> {
  user_id: number
  username: string
  super: boolean
  read_all: boolean
  write_all: boolean
  email?: string
  email2?: string
  first?: string
  middle?: string
  last?: string
  center?: string
  employer?: string
  phone?: string
  title?: string
  info?: string
}

export class XUserParameter<T> extends XParameter<T, XUserParameterName> {
  static readonly USER_ID = new XUserParameter('user_id', 'User ID', XTypes.SELF_ID, 'unique user identifier', [KEY])

  static readonly USERNAME = new XUserParameter('username', 'Username', XTypes.UTF8VSTRING128, 'unique username', [
    SYSTEM,
    REQUIRED
  ])

  static readonly SUPER = new XUserParameter('super', 'Super', XTypes.BOOLEAN, 'super privilege', [SYSTEM], 'false')

  static readonly READ_ALL = new XUserParameter(
    'read_all',
    'Read All',
    XTypes.BOOLEAN,
    'read all privilege',
    [SYSTEM],
    'false'
  )

  static readonly WRITE_ALL = new XUserParameter(
    'write_all',
    'Write All',
    XTypes.BOOLEAN,
    'write all privilege',
    [SYSTEM],
    'false'
  )

  static readonly EMAIL = new XUserParameter('email', 'Email', XTypes.UTF8TEXT, 'email address')

  static readonly EMAIL2 = new XUserParameter('email2', 'Email2', XTypes.UTF8TEXT, 'secondary email address')

  static readonly FIRST = new XUserParameter('first', 'First', XTypes.UTF8STRING64, 'first name')

  static readonly MIDDLE = new XUserParameter('middle', 'Middle', XTypes.UTF8STRING64, 'middle name')

  static readonly LAST = new XUserParameter('last', 'Last', XTypes.UTF8STRING64, 'last name')

  static readonly CENTER = new XUserParameter('center', 'Center', XTypes.UTF8STRING16, 'NASA center')

  static readonly EMPLOYER = new XUserParameter('employer', 'Employer', XTypes.UTF8STRING64, 'employer')

  static readonly PHONE = new XUserParameter('phone', 'Phone', XTypes.UTF8STRING16, 'phone')

  static readonly TITLE = new XUserParameter('title', 'Title', XTypes.UTF8STRING64, 'title')

  static readonly INFO = new XUserParameter('info', 'Info', XTypes.UTF8TEXT, 'information')
}

export const XUserParameterManager = new XParameterManager<XUserParameter<unknown>>([
  XUserParameter.USER_ID,
  XUserParameter.USERNAME,
  XUserParameter.SUPER,
  XUserParameter.READ_ALL,
  XUserParameter.WRITE_ALL,
  XUserParameter.EMAIL,
  XUserParameter.EMAIL2,
  XUserParameter.FIRST,
  XUserParameter.MIDDLE,
  XUserParameter.LAST,
  XUserParameter.CENTER,
  XUserParameter.EMPLOYER,
  XUserParameter.PHONE,
  XUserParameter.TITLE,
  XUserParameter.INFO
])

export type XUserFollowParameterName = 'user_id' | 'wall_id'

export interface XUserFollowInterface extends Partial<Record<XUserFollowParameterName, unknown>> {
  user_id: number
  wall_id: string
}

export class XUserFollowParameter<T> extends XParameter<T, XUserFollowParameterName> {
  static readonly USER_ID = new XUserFollowParameter('user_id', 'User ID', XTypes.USER_ID, 'user identifier', [KEY])

  static readonly WALL_ID = new XUserFollowParameter('wall_id', 'Wall ID', XTypes.WALL_ID, 'wall identifier', [KEY])
}

export const XUserFollowParameterManager = new XParameterManager<XUserFollowParameter<unknown>>([
  XUserFollowParameter.USER_ID,
  XUserFollowParameter.WALL_ID
])

export type XUserFileParameterName = 'user_id' | 'key' | 'type' | 'size' | 'md5'

export interface XUserFileInterface extends Partial<Record<XUserFileParameterName, unknown>> {
  user_id: number
  key: string
  type: string
  size: number
  md5: string
}

export class XUserFileParameter<T> extends XParameter<T, XUserFileParameterName> {
  static readonly USER_ID = new XUserFileParameter('user_id', 'User ID', XTypes.USER_ID, 'unique user identifier', [
    KEY
  ])

  static readonly KEY = new XUserFileParameter('key', 'Key', XTypes.UTF8STRING64, 'unique object identifier', [KEY])

  static readonly TYPE = new XUserFileParameter('type', 'Type', XTypes.UTF8STRING64, 'file content type', [REQUIRED])

  static readonly SIZE = new XUserFileParameter('size', 'Size', XTypes.INT8, 'file size in bytes', [REQUIRED])

  static readonly MD5 = new XUserFileParameter('md5', 'MD5', XTypes.ASCIISTRING32, 'MD5 hash of the blob', [REQUIRED])
}

export const XUserFileParameterManager = new XParameterManager<XUserFileParameter<unknown>>([
  XUserFileParameter.USER_ID,
  XUserFileParameter.KEY,
  XUserFileParameter.TYPE,
  XUserFileParameter.SIZE,
  XUserFileParameter.MD5
])
export type XUserKeyParameterName =
  | 'user_id'
  | 'key_id'
  | 'create_by'
  | 'create_at'
  | 'expires_at'
  | 'allow_http'
  | 'allow_tunnel'

export interface XUserKeyInterface extends Partial<Record<XUserKeyParameterName, unknown>> {
  user_id: number
  key_id: string
  create_by: number
  create_at: number
  expires_at?: number
  allow_http: boolean
  allow_tunnel: boolean
}

export class XUserKeyParameter<T> extends XParameter<T, XUserKeyParameterName> {
  static readonly USER_ID = new XUserKeyParameter('user_id', 'User ID', XTypes.SELF_ID, 'unique user identifier', [KEY])
  static readonly KEY_ID = new XUserKeyParameter('key_id', 'Key ID', XTypes.ASCIISTRING16, 'key ID', [KEY])
  static readonly CREATE_BY = new XUserKeyParameter(
    'create_by',
    'Create By',
    XTypes.USER_ID,
    'user who created the key',
    [REQUIRED]
  )
  static readonly CREATE_AT = new XUserKeyParameter(
    'create_at',
    'Create At',
    XTypes.INSTANT_MS,
    'instant when the key was created',
    [REQUIRED]
  )
  static readonly EXPIRES_AT = new XUserKeyParameter(
    'expires_at',
    'Expires At',
    XTypes.INSTANT_MS,
    'instant when the key expires'
  )
  static readonly ALLOW_HTTP = new XUserKeyParameter('allow_http', 'Allow HTTP', XTypes.BOOLEAN, 'allow HTTP access', [
    REQUIRED
  ])
  static readonly ALLOW_TUNNEL = new XUserKeyParameter(
    'allow_tunnel',
    'Allow Tunnel',
    XTypes.BOOLEAN,
    'allow tunnel access',
    [REQUIRED]
  )
}

export const XUserKeyParameterManager = new XParameterManager<XUserKeyParameter<unknown>>([
  XUserKeyParameter.USER_ID,
  XUserKeyParameter.KEY_ID,
  XUserKeyParameter.CREATE_BY,
  XUserKeyParameter.CREATE_AT,
  XUserKeyParameter.EXPIRES_AT,
  XUserKeyParameter.ALLOW_HTTP,
  XUserKeyParameter.ALLOW_TUNNEL
])

export type XUserObjectParameterName = 'user_id' | 'key' | 'value'

export interface XUserObjectInterface extends Partial<Record<XUserObjectParameterName, unknown>> {
  user_id: number
  key: string
  value?: unknown[] | Record<string, unknown>
}

export class XUserObjectParameter<T> extends XParameter<T, XUserObjectParameterName> {
  static readonly USER_ID = new XUserObjectParameter('user_id', 'User ID', XTypes.USER_ID, 'unique user identifier', [
    KEY
  ])

  static readonly KEY = new XUserObjectParameter('key', 'Key', XTypes.UTF8STRING64, 'unique object identifier', [KEY])

  static readonly VALUE = new XUserObjectParameter('value', 'Value', XTypes.JSON, 'object value')
}

export const XUserObjectParameterManager = new XParameterManager<XUserObjectParameter<unknown>>([
  XUserObjectParameter.USER_ID,
  XUserObjectParameter.KEY,
  XUserObjectParameter.VALUE
])

export type XUserSubParameterName =
  | 'sub_id'
  | 'user_id'
  | 'wall_id'
  | 'disabled'
  | 'email'
  | 'types'
  | 'levels'
  | 'keywords'
  | 'file'
  | 'desc'
  | 'src_id'
  | 'ref_id'

export interface XUserSubInterface extends Partial<Record<XUserSubParameterName, unknown>> {
  sub_id: string
  user_id: number
  wall_id?: string
  disabled: boolean
  email: boolean
  types?: number[]
  levels?: number[]
  keywords?: string[]
  file: boolean
  desc?: string
  src_id?: number
  ref_id?: string
}

export class XUserSubParameter<T> extends XParameter<T, XUserSubParameterName> {
  static readonly SUB_ID = new XUserSubParameter('sub_id', 'Sub ID', XTypes.UUID, 'subscription identifier', [KEY])

  static readonly USER_ID = new XUserSubParameter('user_id', 'User ID', XTypes.USER_ID, 'user identifier', [
    REQUIRED,
    SYSTEM
  ])

  static readonly WALL_ID = new XUserSubParameter('wall_id', 'Wall ID', XTypes.WALL_ID, 'wall identifier')

  static readonly DISABLED = new XUserSubParameter(
    'disabled',
    'Disabled',
    XTypes.BOOLEAN,
    'disabled flag',
    [REQUIRED],
    'false'
  )

  static readonly EMAIL = new XUserSubParameter('email', 'Email', XTypes.BOOLEAN, 'email flag', [REQUIRED], 'false')

  static readonly TYPES = new XUserSubParameter('types', 'Types', XTypes.setOf<number>(XTypes.POST_TYPE), 'post types')

  static readonly LEVELS = new XUserSubParameter(
    'levels',
    'Levels',
    XTypes.setOf<number>(XTypes.POST_LEVEL),
    'post levels'
  )

  static readonly KEYWORDS = new XUserSubParameter(
    'keywords',
    'Keywords',
    XTypes.setOf<string>(XTypes.UTF8STRING64),
    'post keywords'
  )

  static readonly FILE = new XUserSubParameter('file', 'File', XTypes.BOOLEAN, 'file filter flag', [REQUIRED], 'false')

  static readonly DESC = new XUserSubParameter('desc', 'Description', XTypes.UTF8STRING, 'description')

  static readonly SRC_ID = new XUserSubParameter('src_id', 'Source ID', XTypes.TEAM_ID, 'source team ID', [SYSTEM])

  static readonly REF_ID = new XUserSubParameter('ref_id', 'Ref ID', XTypes.UUID, 'reference ID', [SYSTEM])
}

export const XUserSubParameterManager = new XParameterManager<XUserSubParameter<unknown>>([
  XUserSubParameter.SUB_ID,
  XUserSubParameter.USER_ID,
  XUserSubParameter.WALL_ID,
  XUserSubParameter.DISABLED,
  XUserSubParameter.EMAIL,
  XUserSubParameter.TYPES,
  XUserSubParameter.LEVELS,
  XUserSubParameter.KEYWORDS,
  XUserSubParameter.FILE,
  XUserSubParameter.DESC,
  XUserSubParameter.SRC_ID,
  XUserSubParameter.REF_ID
])

export type XUserThreadParameterName = 'user_id' | 'thread_id' | 'wall_id'

export interface XUserThreadInterface extends Partial<Record<XUserThreadParameterName, unknown>> {
  user_id: number
  thread_id: number
  wall_id?: string
}

export class XUserThreadParameter<T> extends XParameter<T, XUserThreadParameterName> {
  static readonly USER_ID = new XUserThreadParameter('user_id', 'User ID', XTypes.USER_ID, 'user identifier', [KEY])

  static readonly THREAD_ID = new XUserThreadParameter('thread_id', 'Thread ID', XTypes.INT8, 'thread identifier', [
    KEY
  ])

  static readonly WALL_ID = new XUserThreadParameter('wall_id', 'Wall ID', XTypes.WALL_ID, 'wall identifier')
}

export const XUserThreadParameterManager = new XParameterManager<XUserThreadParameter<unknown>>([
  XUserThreadParameter.USER_ID,
  XUserThreadParameter.THREAD_ID,
  XUserThreadParameter.WALL_ID
])
