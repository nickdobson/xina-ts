import { isNumber, isString } from 'lodash'
import Sugar from 'sugar'
import { forDatabase, XRecordAttribute } from '.'

import {
  splitRest,
  XBlobInterface,
  XDatabaseInterface,
  XDatabasePrivilege,
  XFieldInterface,
  XGroupInterface,
  XGroupPrivilege,
  XPrivDatabaseInterface,
  XPrivGroupInterface,
  XRecord,
  XTeamInterface,
  XTypes,
  XUserInterface
} from './internal'

export const isGroup = (v: unknown): v is XGroup => !!v && v instanceof XGroup

export const isDatabase = (v: unknown): v is XDatabase => !!v && v instanceof XDatabase

export const isField = (v: unknown): v is XField => !!v && v instanceof XField

export const isBlob = (v: unknown): v is XBlob => !!v && v instanceof XBlob

export const isTeam = (v: unknown): v is XTeam => !!v && v instanceof XTeam

export const isUser = (v: unknown): v is XUser => !!v && v instanceof XUser

export interface XElement {
  /**
   * Returns the unique ID val
   */
  getId(): number
  getName(): string
  getLabel(): string
  getSpecifier(): string
  toString(): string
}

export class XElementSet<T extends XElement> {
  readonly values: T[] = []

  private readonly map: Record<number | string, T> = {}

  constructor(values: T[] = []) {
    this.push(...values)
  }

  push(...values: T[]) {
    this.values.push(...values)

    values.forEach((e) => {
      this.map[e.getId()] = e
      this.map[e.getName()] = e
      this.map[e.getName().toLowerCase()] = e
      this.map[e.getLabel()] = e
      this.map[e.getLabel().toLowerCase()] = e
    })
  }

  parse(v: unknown): T {
    if (isNumber(v) || isString(v)) return this.get(v)
    throw Error(`invalid specifier: ${v}`)
  }

  get(s: number | string): T {
    const found = this.find(s)

    if (found) return found

    throw Error(`element not found: ${s}`)
  }

  find(s: number | string): T | undefined {
    return this.map[s] || (isString(s) ? this.map[s.toLowerCase()] : undefined)
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

export interface XGroupInterfaceExt extends XGroupInterface {
  groups: XGroupInterfaceExt[]
  databases: XDatabaseInterfaceExt[]
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export class XGroup implements XElement, XGroupInterface {
  parent_id?: number
  group_id!: number
  name!: string
  label!: string
  desc?: string
  priority!: number
  face!: boolean
  wall!: boolean
  alias_id?: number

  parent?: XGroup
  groups: XElementSet<XGroup>
  databases: XElementSet<XDatabase>
  objects!: Record<string, unknown>
  files!: Record<string, unknown>

  constructor(obj: XGroupInterfaceExt) {
    Object.assign(this, obj)

    this.groups = new XElementSet<XGroup>(toGroups(obj.groups))
    this.databases = new XElementSet<XDatabase>(toDatabases(obj.databases))

    this.groups.values.forEach((g) => (g.parent = this))
    this.databases.values.forEach((d) => (d.parent = this))
  }

  getId() {
    return this.group_id
  }

  getName() {
    return this.name
  }

  getLabel() {
    return this.label
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
      const [base, rest] = splitRest(s, '.', 2)
      return this.groups.get(base).getGroup(rest)
    } else {
      return this.groups.get(s)
    }
  }

  findGroup(s: string): XGroup | undefined {
    if (s.includes('.')) {
      const [base, rest] = splitRest(s, '.', 2)
      return this.groups.find(base)?.findGroup(rest)
    } else {
      return this.groups.find(s)
    }
  }

  getDatabase(s: string): XDatabase {
    if (s.includes('.')) {
      const [base, rest] = splitRest(s, '.', 2)
      return (this.groups.get(base) || this.databases.get(base)).getDatabase(rest)
    } else {
      return this.databases.get(s)
    }
  }

  findDatabase(s: string): XDatabase | undefined {
    if (s.includes('.')) {
      const [base, rest] = splitRest(s, '.', 2)
      return (this.groups.find(base) || this.databases.find(base))?.findDatabase(rest)
    } else {
      return this.databases.find(s)
    }
  }

  getRoot(): XGroup {
    if (this.parent) return this.parent.getRoot()
    return this
  }

  toString(): string {
    return this.getLabelPath()
  }
}

export const toGroups = (objs: XGroupInterfaceExt[]): XGroup[] => objs.map((g) => toGroup(g))

export const toGroup = (obj: XGroupInterfaceExt) => new XGroup(obj)

export interface XDatabaseInterfaceExt extends XDatabaseInterface {
  databases: XDatabaseInterfaceExt[]

  fields: XFieldInterfaceExt[]
  blobs: XBlobInterfaceExt[]

  objects: Record<string, unknown>
  files: Record<string, unknown>

  getDatabase(s: string): XDatabase
  getPath(): (XGroup | XDatabase)[]
  getNamePath(): string
  getLabelPath(): string
  formatRecord(record: XRecord, format?: string): string
}

export class XDatabase implements XDatabaseInterface, XElement {
  parent_group_id?: number
  parent_database_id?: number
  database_id!: number
  name!: string
  label!: string
  version!: number
  locked!: boolean
  format?: string
  file_format?: string
  singular?: string
  plural?: string
  order?: unknown[]
  indexes?: unknown[]
  partition?: Record<string, unknown>
  priority!: number
  backup!: boolean
  dynamic!: boolean
  event!: boolean
  face!: boolean
  file!: boolean
  keyless!: boolean
  link!: boolean
  lock!: boolean
  log!: boolean
  notify!: boolean
  sign!: boolean
  subscribe!: boolean
  tag!: boolean
  track!: boolean
  trash!: boolean
  wall!: boolean
  clone_to?: number
  desc?: string

  objects!: Record<string, unknown>
  files!: Record<string, unknown>

  parent?: XGroup | XDatabase
  databases: XElementSet<XDatabase>
  columns: (XRecordAttribute<unknown> | XField)[]
  fields: XElementSet<XField>
  blobs: XElementSet<XBlob>

  constructor(obj: XDatabaseInterfaceExt) {
    Object.assign(this, obj)

    this.databases = new XElementSet<XDatabase>(toDatabases(obj.databases))
    this.fields = new XElementSet<XField>(toFields(obj.fields))
    this.blobs = new XElementSet<XBlob>(toBlobs(obj.blobs))

    this.columns = [...forDatabase(this), ...this.fields.values]

    this.databases.values.forEach((d) => (d.parent = this))
    this.fields.values.forEach((f) => (f.database = this))
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
      const [base, rest] = splitRest(s, '.', 2)
      return this.databases.get(base).getDatabase(rest)
    } else {
      return this.databases.get(s)
    }
  }

  findDatabase(s: string): XDatabase | undefined {
    if (s.includes('.')) {
      const [base, rest] = splitRest(s, '.', 2)
      return this.databases.find(base)?.findDatabase(rest)
    } else {
      return this.databases.find(s)
    }
  }

  getPath(): (XGroup | XDatabase)[] {
    const path: (XGroup | XDatabase)[] = []
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

  formatRecord(record: XRecord, format?: string) {
    format = format || this.format

    if (!format) {
      format = ''
      this.fields.values.filter((f) => f.key).forEach((field) => (format += ' {' + field.name + '}'))
      format = format.trim()
    }

    return format.replace(/\{(([^{%]+)(%([^{%]+))?)}/g, (_m, _g1, key: string, _g3, f) => {
      if (record[key] == null) return 'none'
      if (f === '*us') {
        return Sugar.Date.format(Sugar.Date.create((record[key] as number) / 1e3), '{yyyy}-{MM}-{dd}-{HH}:{mm}')
      }
      return this.fields.get(key).getType().format(record[key])
    })
  }

  toString(): string {
    return this.getLabelPath()
  }
}

export const toDatabases = (objs: XDatabaseInterfaceExt[]) => objs.map((d) => toDatabase(d))

export const toDatabase = (obj: XDatabaseInterfaceExt) => new XDatabase(obj)

export interface XFieldInterfaceExt extends XFieldInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export class XField implements XFieldInterfaceExt, XElement {
  database_id!: number
  field_id!: number
  ref?: string
  ord!: number
  name!: string
  label!: string
  type!: string
  key!: boolean
  nul!: boolean
  options?: unknown[]
  strict!: boolean
  lock!: boolean
  any!: boolean
  format?: string
  meas?: string
  unit?: string
  desc?: string
  def?: string

  objects!: Record<string, unknown>
  files!: Record<string, unknown>

  database?: XDatabase

  constructor(obj: XFieldInterfaceExt) {
    Object.assign(this, obj)
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

  getSpecifier() {
    return this.name
  }

  getType() {
    return XTypes.of(this.type)
  }

  formatValue(v: unknown) {
    return this.getType().format(v, this.format)
  }

  formatRecord(r: XRecord) {
    return this.formatValue(r[this.name])
  }

  toString(): string {
    return this.label
  }
}

export const toFields = (objs: XFieldInterfaceExt[]): XField[] => objs.map((f) => toField(f))
export const toField = (obj: XFieldInterfaceExt) => new XField(obj)

export interface XBlobInterfaceExt extends XBlobInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export class XBlob implements XBlobInterfaceExt, XElement {
  database_id!: number
  blob_id!: number
  ord!: number
  name!: string
  label!: string
  nul!: boolean
  lock!: boolean
  desc?: string

  objects!: Record<string, unknown>
  files!: Record<string, unknown>

  database?: XDatabase

  constructor(obj: XBlobInterfaceExt) {
    Object.assign(this, obj)
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
}

export const toBlobs = (objs: XBlobInterfaceExt[]): XBlob[] => objs.map((b) => toBlob(b))
export const toBlob = (obj: XBlobInterfaceExt) => new XBlob(obj)

export interface XTeamInterfaceExt extends XTeamInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>

  admins: number[]
  users: number[]

  groups: Record<number, Record<string, boolean>>
  databases: Record<number, Record<string, boolean>>
}

export class XTeam implements XTeamInterfaceExt, XElement {
  team_id!: number
  name!: string
  label!: string
  priority!: number
  group_privileges!: unknown[]
  database_privileges!: unknown[]
  desc?: string

  objects!: Record<string, unknown>
  files!: Record<string, unknown>

  admins!: number[]
  users!: number[]

  groups!: Record<number, Record<string, boolean>>
  databases!: Record<number, Record<string, boolean>>

  groupPrivileges: Partial<Record<string, boolean>> = {}
  databasePrivileges: Partial<Record<string, boolean>> = {}

  constructor(obj: XTeamInterfaceExt) {
    Object.assign(this, obj)

    obj.group_privileges.forEach((p) => (this.groupPrivileges[String(p)] = true))
    obj.database_privileges.forEach((p) => (this.databasePrivileges[String(p)] = true))
  }

  getId() {
    return this.team_id
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

  getGroupPrivileges(g: XGroup | number) {
    const id = isGroup(g) ? g.getId() : g

    if (!this.groups[id]) return {}

    const base = { ...this.groupPrivileges }
    const overrides = this.groups[id]

    XGroupPrivilege.values.forEach((p) => {
      const override = overrides[p.name]
      if (override == null) return
      base[p.name] = override
    })

    return base
  }

  getDatabasePrivileges(d: XDatabase | number) {
    const id = isDatabase(d) ? d.getId() : d

    if (!this.databases[id]) return {}

    const base = { ...this.databasePrivileges }
    const overrides = this.databases[id]

    XDatabasePrivilege.values.forEach((p) => {
      const override = overrides[p.name]
      if (override == null) return
      base[p.name] = override
    })

    return base
  }

  toString() {
    return this.label
  }
}

export const toTeams = (objs: XTeamInterfaceExt[]): XTeam[] => objs.map((t) => toTeam(t))
export const toTeam = (obj: XTeamInterfaceExt) => new XTeam(obj)

export class XUser implements XUserInterface, XElement {
  user_id!: number
  username!: string
  super!: boolean
  read_all!: boolean
  write_all!: boolean
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

  fullName!: string

  groupPrivileges: Partial<Record<number, Partial<Record<string, boolean>>>> = {}
  databasePrivileges: Partial<Record<number, Partial<Record<string, boolean>>>> = {}

  teamGroupPrivileges: Partial<Record<number, Partial<Record<string, boolean>>>> = {}
  teamDatabasePrivileges: Partial<Record<number, Partial<Record<string, boolean>>>> = {}

  constructor(obj: XUserInterface) {
    Object.assign(this, obj)

    this.first = fixCase(obj.first)
    this.last = fixCase(obj.last)

    this.fullName = `${this.first} ${this.last}`
  }

  getId() {
    return this.user_id
  }

  getName() {
    return this.username
  }

  getLabel() {
    return this.fullName
  }

  getSpecifier() {
    return this.username
  }

  hasGroupPrivilege(p: XGroupPrivilege): { on: (g: XGroup) => boolean; in: (gs: XGroup[]) => XGroup[] } {
    const onFn = (g: XGroup | number): boolean => {
      if (this.super) return true
      const id = isGroup(g) ? g.getId() : g
      return !!(this.groupPrivileges[id]?.[p.name] || this.teamGroupPrivileges[id]?.[p.name])
    }

    const inFn = (gs: XGroup[]): XGroup[] => {
      if (this.super) return [...gs]
      return gs.filter((g) => onFn(g))
    }

    return {
      on: onFn,
      in: inFn
    }
  }

  hasDatabasePrivilege(p: XDatabasePrivilege): {
    on: (d: XDatabase) => boolean
    in: (ds: XDatabase[]) => XDatabase[]
  } {
    const onFn = (d: XDatabase | number): boolean => {
      if (this.super) return true
      const id = isDatabase(d) ? d.getId() : d
      return !!(this.databasePrivileges[id]?.[p.name] || this.teamDatabasePrivileges[id]?.[p.name])
    }

    const inFn = (ds: XDatabase[]): XDatabase[] => {
      if (this.super) return [...ds]
      return ds.filter((d) => onFn(d))
    }

    return {
      on: onFn,
      in: inFn
    }
  }

  setGroupPrivileges(ps: XPrivGroupInterface[]) {
    this.groupPrivileges = {}
    ps.forEach((p) => (this.groupPrivileges[p.group_id] = p as unknown as Partial<Record<string, boolean>>))
    return this
  }

  setDatabasePrivileges(ps: XPrivDatabaseInterface[]) {
    this.databasePrivileges = {}
    ps.forEach((p) => (this.databasePrivileges[p.database_id] = p as unknown as Partial<Record<string, boolean>>))
    return this
  }

  refreshTeamPrivileges(teams: XTeam[]) {
    this.teamGroupPrivileges = {}
    this.teamDatabasePrivileges = {}

    teams.forEach((team) => {
      if (!team.users.includes(this.user_id)) return

      for (const idstr of Object.keys(team.groups)) {
        const id = Number(idstr)
        const base = (this.teamGroupPrivileges[id] = this.teamGroupPrivileges[id] || {})
        const privs = team.getGroupPrivileges(id)
        XGroupPrivilege.values.forEach((p) => (base[p.name] = base[p.name] || privs[p.name]))
      }

      for (const idstr of Object.keys(team.databases)) {
        const id = Number(idstr)
        const base = (this.teamDatabasePrivileges[id] = this.teamDatabasePrivileges[id] || {})
        const privs = team.getDatabasePrivileges(id)
        XDatabasePrivilege.values.forEach((p) => (base[p.name] = base[p.name] || privs[p.name]))
      }
    })

    return this
  }
}

export const toUsers = (objs: XUserInterface[]): XUser[] => objs.map((u) => toUser(u))
export const toUser = (obj: XUserInterface) => new XUser(obj)

function fixCase(s?: string) {
  if (!s) return s
  s = s.trim()

  if (!s.match(/^[a-z\-\s]+$/) && !s.match(/^[A-Z\-\s]+$/)) return s

  return Sugar.String.capitalize(s, true)
}
