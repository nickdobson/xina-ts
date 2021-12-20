import Sugar from 'sugar'

import {
  isNumber,
  isString,
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
  XType,
  XTypes,
  XUserInterface
} from './internal'

const GROUP_SYMBOL = Symbol('group')
const DATABASE_SYMBOL = Symbol('database')
const FIELD_SYMBOL = Symbol('field')
const BLOB_SYMBOL = Symbol('blob')
const TEAM_SYMBOL = Symbol('team')
const USER_SYMBOL = Symbol('user')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isGroup = (v: unknown): v is XGroup => v && (v as any)[GROUP_SYMBOL]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDatabase = (v: unknown): v is XDatabase => v && (v as any)[DATABASE_SYMBOL]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isField = (v: unknown): v is XField => v && (v as any)[FIELD_SYMBOL]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBlob = (v: unknown): v is XBlob => v && (v as any)[BLOB_SYMBOL]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isTeam = (v: unknown): v is XTeam => v && (v as any)[TEAM_SYMBOL]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isUser = (v: unknown): v is XUser => v && (v as any)[USER_SYMBOL]

export interface XElement {
  getId(): number
  getName(): string
  getLabel(): string
  getSpecifier(): string
  toString(): string
}

export class XElementSet<T extends XElement> {
  readonly values: T[]

  private readonly idMap: Record<number, T> = {}
  private readonly nameMap: Record<string, T> = {}
  private readonly labelMap: Record<string, T> = {}

  constructor(values: T[]) {
    this.values = [...values]

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

export interface XGroupInterfaceExt extends XGroupInterface {
  groups: XGroupInterfaceExt[]
  databases: XDatabaseInterfaceExt[]
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export interface XGroup extends XGroupInterface, XElement {
  [GROUP_SYMBOL]: true
  parent?: XGroup
  groups: XElementSet<XGroup>
  databases: XElementSet<XDatabase>
  objects: Record<string, unknown>
  files: Record<string, unknown>
  getPath(): XGroup[]
  getNamePath(depth?: number): string
  getLabelPath(depth?: number): string
  getGroup(s: string): XGroup
  getDatabase(s: string): XDatabase | undefined
  getRoot(): XGroup | undefined
}

export const toGroups = (objs: XGroupInterfaceExt[]): XGroup[] => objs.map((g) => toGroup(g))

export const toGroup = (obj: XGroupInterfaceExt): XGroup => {
  const groups = new XElementSet<XGroup>(toGroups(obj.groups))
  const databases = new XElementSet<XDatabase>(toDatabases(obj.databases))

  const group: XGroup = {
    [GROUP_SYMBOL]: true,
    ...obj,
    groups,
    databases,
    getId() {
      return this.group_id
    },
    getName() {
      return this.name
    },
    getLabel() {
      return this.label
    },
    getSpecifier() {
      return this.getNamePath()
    },
    getPath(): XGroup[] {
      const path: XGroup[] = []
      if (this.parent) path.push(...this.parent.getPath())
      path.push(this)

      return path
    },
    getNamePath(depth = 32): string {
      if (this.parent && depth > 0) return `${this.parent.getNamePath(depth - 1)}.${this.name}`
      return this.name
    },
    getLabelPath(depth = 32): string {
      if (this.parent && depth > 0) return this.parent.getLabelPath(depth - 1) + ' ' + this.label
      return this.label
    },
    getGroup(s: string): XGroup {
      if (s.includes('.')) {
        const parts = splitRest(s, '.', 2)
        const base = parts[0]
        const rest = parts[1]
        return this.groups.get(base).getGroup(rest)
      } else {
        return this.groups.get(s)
      }
    },
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
    },
    getRoot(): XGroup | undefined {
      if (this.parent) return this.parent.getRoot()
      return this
    }
  }

  groups.values.forEach((g) => (g.parent = group))
  databases.values.forEach((d) => (d.parent = group))

  return group
}

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

export interface XDatabase extends XDatabaseInterface, XElement {
  [DATABASE_SYMBOL]: true
  parent?: XGroup | XDatabase
  databases: XElementSet<XDatabase>
  fields: XElementSet<XField>
  blobs: XElementSet<XBlob>
  objects: Record<string, unknown>
  files: Record<string, unknown>
  getDatabase(s: string): XDatabase
  getPath(): (XGroup | XDatabase)[]
  getNamePath(): string
  getLabelPath(): string
  formatRecord(record: XRecord, format?: string): string
}

export const toDatabases = (objs: XDatabaseInterfaceExt[]): XDatabase[] => objs.map((d) => toDatabase(d))

export const toDatabase = (obj: XDatabaseInterfaceExt): XDatabase => {
  const databases = new XElementSet<XDatabase>(toDatabases(obj.databases))
  const fields = new XElementSet<XField>(toFields(obj.fields))
  const blobs = new XElementSet<XBlob>(toBlobs(obj.blobs))

  const database: XDatabase = {
    [DATABASE_SYMBOL]: true,
    ...obj,
    databases,
    fields,
    blobs,
    getId(): number {
      return this.database_id
    },
    getName(): string {
      return this.name
    },
    getLabel(): string {
      return this.label
    },
    getSpecifier() {
      return this.getNamePath()
    },
    getDatabase(s: string): XDatabase {
      if (s.includes('.')) {
        const parts = splitRest(s, '.', 2)
        const base = parts[0]
        const rest = parts[1]
        return this.databases.get(base).getDatabase(rest)
      }

      return this.databases.get(s)
    },
    getPath(): (XGroup | XDatabase)[] {
      const path: (XGroup | XDatabase)[] = []
      if (this.parent) path.push(...this.parent.getPath())
      path.push(this)

      return path
    },
    getNamePath(): string {
      return this.getPath()
        .map((v) => v.name)
        .join('.')
    },
    getLabelPath(): string {
      return this.getPath()
        .map((v) => v.label)
        .join(' ')
    },
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
  }

  databases.values.forEach((d) => (d.parent = database))
  fields.values.forEach((f) => (f.database = database))
  blobs.values.forEach((b) => (b.database = database))

  return database
}

export interface XFieldInterfaceExt extends XFieldInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export interface XField extends XFieldInterfaceExt, XElement {
  [FIELD_SYMBOL]: true
  database?: XDatabase
  getType(): XType<unknown>
}

export const toFields = (objs: XFieldInterfaceExt[]): XField[] => objs.map((f) => toField(f))
export const toField = (obj: XFieldInterfaceExt): XField => {
  const field: XField = {
    [FIELD_SYMBOL]: true,
    ...obj,
    getId() {
      return this.field_id
    },
    getName() {
      return this.name
    },
    getLabel() {
      return this.label
    },
    getSpecifier() {
      return this.name
    },
    getType() {
      return XTypes.of(this.type)
    }
  }
  return field
}

export interface XBlobInterfaceExt extends XBlobInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>
}

export interface XBlob extends XBlobInterfaceExt, XElement {
  [BLOB_SYMBOL]: true
  database?: XDatabase
}

export const toBlobs = (objs: XBlobInterfaceExt[]): XBlob[] => objs.map((b) => toBlob(b))
export const toBlob = (obj: XBlobInterfaceExt): XBlob => {
  const blob: XBlob = {
    [BLOB_SYMBOL]: true,
    ...obj,
    getId() {
      return this.blob_id
    },
    getName() {
      return this.name
    },
    getLabel() {
      return this.label
    },
    getSpecifier() {
      return this.name
    }
  }
  return blob
}

export interface XTeamInterfaceExt extends XTeamInterface {
  objects: Record<string, unknown>
  files: Record<string, unknown>

  admins: number[]
  users: number[]

  groups: Record<number, Record<string, boolean>>
  databases: Record<number, Record<string, boolean>>
}

export interface XTeam extends XTeamInterfaceExt, XElement {
  [TEAM_SYMBOL]: true
  groupPrivileges: Partial<Record<string, boolean>>
  databasePrivileges: Partial<Record<string, boolean>>
  getGroupPrivileges(g: XGroup | number): Partial<Record<string, boolean>>
  getDatabasePrivileges(d: XDatabase | number): Partial<Record<string, boolean>>
}

export const toTeams = (objs: XTeamInterfaceExt[]): XTeam[] => objs.map((t) => toTeam(t))
export const toTeam = (obj: XTeamInterfaceExt): XTeam => {
  const groupPrivileges: Partial<Record<string, boolean>> = {}
  const databasePrivileges: Partial<Record<string, boolean>> = {}

  obj.group_privileges.forEach((p) => (groupPrivileges[String(p)] = true))
  obj.database_privileges.forEach((p) => (databasePrivileges[String(p)] = true))

  return {
    [TEAM_SYMBOL]: true,
    ...obj,
    groupPrivileges,
    databasePrivileges,
    getId() {
      return this.team_id
    },
    getName() {
      return this.name
    },
    getLabel() {
      return this.label
    },
    getSpecifier() {
      return this.name
    },
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
    },
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
  }
}

export interface XUser extends XUserInterface, XElement {
  [USER_SYMBOL]: true
  fullName: string
  groupPrivileges: Partial<Record<number, Partial<Record<string, boolean>>>>
  databasePrivileges: Partial<Record<number, Partial<Record<string, boolean>>>>
  teamGroupPrivileges: Partial<Record<number, Partial<Record<string, boolean>>>>
  teamDatabasePrivileges: Partial<Record<number, Partial<Record<string, boolean>>>>
  hasGroupPrivilege(priv: XGroupPrivilege): { on: (g: XGroup) => boolean; in: (gs: XGroup[]) => XGroup[] }
  hasDatabasePrivilege(priv: XDatabasePrivilege): {
    on: (d: XDatabase) => boolean
    in: (ds: XDatabase[]) => XDatabase[]
  }
  setGroupPrivileges(privs: XPrivGroupInterface[]): this
  setDatabasePrivileges(privs: XPrivDatabaseInterface[]): this
  refreshTeamPrivileges(teams: XTeam[]): this
}

export const toUsers = (objs: XUserInterface[]): XUser[] => objs.map((u) => toUser(u))
export const toUser = (obj: XUserInterface): XUser => {
  const first = fixCase(obj.first)
  const last = fixCase(obj.last)

  const user: XUser = {
    [USER_SYMBOL]: true,
    ...obj,
    first,
    last,
    fullName: `${first} ${last}`,
    groupPrivileges: {},
    databasePrivileges: {},
    teamGroupPrivileges: {},
    teamDatabasePrivileges: {},
    getId() {
      return this.user_id
    },
    getName() {
      return this.username
    },
    getLabel() {
      return this.fullName
    },
    getSpecifier() {
      return this.username
    },
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
    },
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
    },
    setGroupPrivileges(ps: XPrivGroupInterface[]) {
      this.groupPrivileges = {}
      ps.forEach((p) => (this.groupPrivileges[p.group_id] = p as unknown as Partial<Record<string, boolean>>))
      return this
    },
    setDatabasePrivileges(ps: XPrivDatabaseInterface[]) {
      this.databasePrivileges = {}
      ps.forEach((p) => (this.databasePrivileges[p.database_id] = p as unknown as Partial<Record<string, boolean>>))
      return this
    },
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
  return user
}

function fixCase(s?: string) {
  if (!s) return s
  s = s.trim()

  if (!s.match(/^[a-z\-\s]+$/) && !s.match(/^[A-Z\-\s]+$/)) return s

  return Sugar.String.capitalize(s, true)
}
