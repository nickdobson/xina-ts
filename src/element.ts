import Sugar from 'sugar'

import { isNumber, isString, splitRest, trustIs } from './util'
import {
  XParameterManager,
  XDatabaseInterface,
  XDatabaseParameterManager,
  XFieldInterface,
  XGroupInterface,
  XTeamInterface,
  XTeamParameterManager,
  XBlobInterface,
  XGroupParameterManager,
  XFieldParameterManager,
  XBlobParameterManager,
  XGroupParameter,
  XParameter,
  XDatabaseParameter,
  XBlobParameter,
  XFieldParameter,
  XTeamParameter
} from './parameter'

import { XRecord } from './record'
import { XTypes } from './type'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class XElement<P extends XParameter<any, any>> implements Record<string, unknown> {
  [x: string]: unknown

  abstract getParameterManager(): XParameterManager<P>

  abstract getId(): number
  abstract getName(): string
  abstract getLabel(): string
  abstract getSpecifier(): string

  toString() {
    return this.getLabel()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class XElementSet<T extends XElement<any>> {
  readonly values: T[]

  private readonly idMap: Record<number, T> = {}
  private readonly nameMap: Record<string, T> = {}
  private readonly labelMap: Record<string, T> = {}

  constructor(Class: new (obj: Record<string, unknown>) => T, elements: (Record<string, unknown> | T)[] = []) {
    this.values = elements.map((e) => (e instanceof Class ? e : new Class(e)))

    this.values.forEach((e) => {
      this.idMap[e.getId()] = e
      this.nameMap[e.getName()] = e
      this.labelMap[e.getLabel()] = e
    })
  }

  parse(v: unknown): T {
    if (isNumber(v) || isString(v)) return this.get(v)
    throw Error(`invalid specifier: ${v}`)
  }

  get(s: number | string): T {
    let found: T | undefined

    if (isNumber(s)) {
      found = this.idMap[s]
    } else {
      s = s.toLowerCase()
      found = this.nameMap[s] || this.labelMap[s]
    }

    if (found) return found

    throw Error(`not found: ${s}`)
  }

  find(s: number | string): T | undefined {
    if (isNumber(s)) return this.idMap[s]

    if (isString(s)) {
      s = s.toLowerCase()
      return this.nameMap[s] || this.labelMap[s]
    }

    return undefined
  }

  findAll(s: (number | string)[]): T[] {
    const found: T[] = []
    s.forEach((spec) => {
      const v = this.find(spec)
      if (v) found.push(v)
    })
    return found
  }
}

interface XGroupInterfaceExt extends XGroupInterface {
  groups: Record<string, unknown>[]
  databases: Record<string, unknown>[]
}

export class XGroup extends XElement<XGroupParameter<unknown>> implements XGroupInterface {
  parent_id?: number
  group_id: number
  name: string
  label: string
  desc?: string
  priority: number
  face: boolean
  wall: boolean
  alias_id?: number

  parent?: XGroup
  groups: XElementSet<XGroup>
  databases: XElementSet<XDatabase>

  constructor(obj: Record<string, unknown>) {
    super()

    if (!trustIs<XGroupInterfaceExt>(obj)) throw Error(`invalid group: ${obj}`)

    this.parent_id = obj.parent_id
    this.group_id = obj.group_id
    this.name = obj.name
    this.label = obj.label
    this.priority = obj.priority
    this.face = obj.face
    this.wall = obj.wall
    this.alias_id = obj.alias_id

    this.groups = new XElementSet<XGroup>(XGroup, obj.groups)
    this.groups.values.forEach((g) => (g.parent = this))

    this.databases = new XElementSet<XDatabase>(XDatabase, obj.databases)
    this.databases.values.forEach((d) => (d.parent = this))
  }

  getId(): number {
    return this.group_id
  }

  getName(): string {
    return this.name
  }

  getLabel(): string {
    return this.label
  }

  getParameterManager() {
    return XGroupParameterManager
  }

  getSpecifier() {
    return this.getNamePath()
  }

  getPath(): XGroup[] {
    const path: XGroup[] = []
    if (this.parent) path.push(...this.parent.getPath())
    path.push(this)

    return path
  }

  getNamePath(depth = 32): string {
    if (this.parent && depth > 0) return `${this.parent.getNamePath(depth - 1)}.${this.name}`
    return this.name
  }

  getLabelPath(depth = 32): string {
    if (this.parent && depth > 0) return this.parent.getLabelPath(depth - 1) + ' ' + this.label
    return this.label
  }

  getGroup(s: string): XGroup {
    if (s.includes('.')) {
      const parts = splitRest(s, '.', 2)
      const base = parts[0]
      const rest = parts[1]
      return this.groups.get(base).getGroup(rest)
    } else {
      return this.groups.get(s)
    }
  }

  getDatabase(s: string): XDatabase | undefined {
    if (s.includes('.')) {
      const parts = splitRest(s, '.', 2)

      const base = parts[0]
      const rest = parts[1]

      const group = this.groups.get(base)
      if (group) return group.getDatabase(rest)

      const database = this.databases.get(base)
      if (database) return database.getDatabase(rest)

      return undefined
    } else {
      return this.databases.get(s)
    }
  }

  getRoot(): XGroup | undefined {
    if (this.parent) return this.parent.getRoot()
    return this
  }
}

interface XDatabaseInterfaceExt extends XDatabaseInterface {
  databases: Record<string, unknown>[]

  fields: Record<string, unknown>[]
  blobs: Record<string, unknown>[]

  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export class XDatabase extends XElement<XDatabaseParameter<unknown>> implements XDatabaseInterface {
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

  parent?: XGroup | XDatabase

  databases: XElementSet<XDatabase>

  fields: XElementSet<XField>
  blobs: XElementSet<XBlob>

  constructor(obj: Record<string, unknown>) {
    super()

    if (!trustIs<XDatabaseInterfaceExt>(obj)) throw Error(`invalid database: ${obj}`)

    this.parent_group_id = obj.parent_group_id
    this.parent_database_id = obj.parent_database_id
    this.database_id = obj.database_id
    this.name = obj.name
    this.label = obj.label
    this.version = obj.version
    this.locked = obj.locked
    this.format = obj.format
    this.file_format = obj.file_format
    this.singular = obj.singular
    this.plural = obj.plural
    this.order = obj.order
    this.indexes = obj.indexes
    this.partition = obj.partition
    this.priority = obj.priority
    this.backup = obj.backup
    this.dynamic = obj.dynamic
    this.event = obj.event
    this.face = obj.face
    this.file = obj.file
    this.keyless = obj.keyless
    this.link = obj.link
    this.lock = obj.lock
    this.log = obj.log
    this.notify = obj.notify
    this.sign = obj.sign
    this.subscribe = obj.subscribe
    this.tag = obj.tag
    this.track = obj.track
    this.trash = obj.trash
    this.wall = obj.wall
    this.clone_to = obj.clone_to
    this.desc = obj.desc

    this.databases = new XElementSet<XDatabase>(XDatabase, obj.databases)
    this.databases.values.forEach((d) => (d.parent = this))

    this.fields = new XElementSet<XField>(XField, obj.fields)
    this.fields.values.forEach((f) => (f.database = this))

    this.blobs = new XElementSet<XBlob>(XBlob, obj.blobs)
    this.blobs.values.forEach((b) => (b.database = this))
  }

  getId(): number {
    return this.database_id
  }

  getName(): string {
    return this.name
  }

  getLabel(): string {
    return this.label
  }

  getSpecifier() {
    return this.getNamePath()
  }

  getDatabase(s: string): XDatabase {
    if (s.includes('.')) {
      const parts = splitRest(s, '.', 2)
      const base = parts[0]
      const rest = parts[1]
      return this.databases.get(base).getDatabase(rest)
    }

    return this.databases.get(s)
  }

  getParameterManager() {
    return XDatabaseParameterManager
  }

  getPath(): Array<XGroup | XDatabase> {
    const path: Array<XGroup | XDatabase> = []
    if (this.parent) path.push(...this.parent.getPath())
    path.push(this)

    return path
  }

  getNamePath(): string {
    return this.getPath()
      .map((v) => v.name)
      .join('.')
  }

  getLabelPath(): string {
    return this.getPath()
      .map((v) => v.label)
      .join(' ')
  }

  formatRecord(record: XRecord, format = this.format) {
    if (!format) {
      format = ''
      this.fields.values.filter((f) => f.key).forEach((field) => (format += ' {' + field.name + '}'))
      format = format.trim()
    }

    return format.replace(/\{(([^{%]+)(%([^{%]+))?)}/g, (_m, _g1, key: string, _g3, f) => {
      if (record[key] == null) return 'none'
      if (f === '*us')
        return Sugar.Date.format(Sugar.Date.create((record[key] as number) / 1e3), '{yyyy}-{MM}-{dd}-{HH}:{mm}')
      return this.fields.get(key).getType().format(record[key])
    })
  }
}

interface XFieldInterfaceExt extends XFieldInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export class XField extends XElement<XFieldParameter<unknown>> implements XFieldInterface {
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

  objects: Record<string, unknown>
  files: Record<string, unknown>

  database?: XDatabase

  constructor(obj: Record<string, unknown>) {
    super()

    if (!trustIs<XFieldInterfaceExt>(obj)) throw Error(`invalid field: ${obj}`)

    this.database_id = obj.database_id
    this.field_id = obj.database_id
    this.ref = obj.ref
    this.ord = obj.ord
    this.name = obj.name
    this.label = obj.label
    this.type = obj.type
    this.key = obj.key
    this.nul = obj.nul
    this.options = obj.options
    this.strict = obj.strict
    this.lock = obj.lock
    this.any = obj.any
    this.format = obj.format
    this.meas = obj.meas
    this.unit = obj.unit
    this.desc = obj.desc
    this.def = obj.def

    this.objects = obj.objects
    this.files = obj.files
  }

  getId() {
    return this.field_id
  }

  getName() {
    return this.name
  }

  getLabel() {
    return this.label
  }

  getType() {
    return XTypes.of(this.type)
  }

  getSpecifier() {
    return this.name
  }

  getParameterManager() {
    return XFieldParameterManager
  }
}

interface XBlobInterfaceExt extends XBlobInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export class XBlob extends XElement<XBlobParameter<unknown>> implements XBlobInterface {
  database_id: number
  blob_id: number
  ord: number
  name: string
  label: string
  nul: boolean
  lock: boolean
  desc?: string

  database?: XDatabase

  objects: Record<string, unknown>
  files: Record<string, unknown>

  constructor(obj: Record<string, unknown>) {
    super()

    if (!trustIs<XBlobInterfaceExt>(obj)) throw Error(`invalid blob: ${obj}`)

    this.database_id = obj.database_id
    this.blob_id = obj.blob_id
    this.ord = obj.ord
    this.name = obj.name
    this.label = obj.label
    this.nul = obj.nul
    this.lock = obj.lock
    this.desc = obj.desc

    this.objects = obj.objects
    this.files = obj.files
  }

  getId() {
    return this.blob_id
  }

  getName() {
    return this.name
  }

  getLabel() {
    return this.label
  }

  getSpecifier() {
    return this.name
  }

  getParameterManager() {
    return XBlobParameterManager
  }
}

interface XTeamInterfaceExt extends XTeamInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>

  admins: number[]
  users: number[]

  groups: Record<number, Record<string, boolean>>
  databases: Record<number, Record<string, boolean>>
}

export class XTeam extends XElement<XTeamParameter<unknown>> implements XTeamInterfaceExt {
  team_id: number
  name: string
  label: string
  priority: number
  group_privileges: unknown[]
  database_privileges: unknown[]
  desc?: string

  objects: Record<string, unknown>
  files: Record<string, unknown>

  admins: number[]
  users: number[]

  groups: Record<number, Record<string, boolean>>
  databases: Record<number, Record<string, boolean>>

  constructor(obj: Record<string, unknown>) {
    super()

    if (!trustIs<XTeamInterfaceExt>(obj)) throw Error(`invalid team: ${obj}`)

    this.team_id = obj.team_id
    this.name = obj.name
    this.label = obj.label
    this.priority = obj.priority
    this.group_privileges = obj.group_privileges
    this.database_privileges = obj.database_privileges
    this.desc = obj.desc

    this.objects = obj.objects
    this.files = obj.files

    this.admins = obj.admins
    this.users = obj.users

    this.groups = obj.groups
    this.databases = obj.databases
  }

  getId(): number {
    return this.team_id
  }

  getName(): string {
    return this.name
  }

  getLabel(): string {
    return this.label
  }

  getSpecifier() {
    return this.name
  }

  getParameterManager() {
    return XTeamParameterManager
  }
}
