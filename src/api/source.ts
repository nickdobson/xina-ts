import { isNumber, isString } from 'lodash'
import {
  XDatabase,
  isDatabase,
  checkOptionalString,
  isSimpleObject,
  parseConstraint,
  parseSelect,
  toIdentifier,
  toSpecifier,
  XApiComponent,
  XApiContext,
  XConstraint,
  XDatabaseTable,
  XDatabaseTableName,
  XExpressionable,
  XJoinOperator,
  XOnConstraint,
  XSelect,
  XSourceType,
  XSourceTypeName,
  XSystemTable,
  XSystemTableName,
  XUsingConstraint
} from '../internal'

export function parseSources(sources: unknown, context: XApiContext) {
  if (!(sources instanceof Array)) throw Error('sources must be an array')
  return sources.map((source) => parseSource(source, context))
}

export function parseSource(source: unknown, context: XApiContext) {
  if (!isSimpleObject(source)) throw Error(`invalid source: ${source}`)
  return new sourceMap[XSourceTypeName.parse(source.type)]().load(source, context)
}

export function parseOptionalSource(source: unknown, context: XApiContext) {
  if (source === undefined) return undefined
  return parseSource(source, context)
}

export type XSourceable = XSystemTable | XSelect | XSource | XDatabase

export function toOptionalSource(v?: XSourceable) {
  if (v === undefined) return undefined
  return toSource(v)
}

export function toSource(v: XSourceable): XSource {
  if (v instanceof XSource) return v
  if (isDatabase(v)) return XDatabaseTableSource.of(v, XDatabaseTable.RECORD)
  if (v instanceof XSelect) return XSelectSource.of(v)
  if (v instanceof XSystemTable) return XSystemTableSource.of(v)

  throw new TypeError('invalid source type: ' + typeof v)
}

export abstract class XSource implements XApiComponent<XSource> {
  meta?: string | Record<string, unknown>

  alias?: string

  abstract getName(): string
  abstract getType(): XSourceType
  abstract toStringBase(): string
  abstract buildRest(pretty: boolean): Record<string, unknown>

  setMeta(meta?: string | Record<string, unknown>) {
    this.meta = meta
    return this
  }

  setAlias(alias?: string) {
    this.alias = alias
    return this
  }

  isValid() {
    return true
  }

  toString() {
    return this.toStringBase() + (this.alias ? ` AS ${this.alias}` : '')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(obj: Record<string, unknown>, _ctx: XApiContext) {
    this.alias = checkOptionalString(obj.alias, 'alias')
    return this
  }

  clone() {
    return this
  }

  build(pretty: boolean): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      type: this.getType().name,
      ...this.buildRest(pretty)
    }

    if (this.meta) obj.meta = this.meta
    if (this.alias) obj.alias = this.alias

    return obj
  }

  join(s: XSourceable) {
    return XJoinSource.of(XJoinOperator.JOIN, this, s)
  }

  leftJoin(s: XSourceable) {
    return XJoinSource.of(XJoinOperator.LEFT, this, s)
  }

  leftOuterJoin(s: XSourceable) {
    return XJoinSource.of(XJoinOperator.LEFT_OUTER, this, s)
  }

  innerJoin(s: XSourceable) {
    return XJoinSource.of(XJoinOperator.INNER, this, s)
  }

  crossJoin(s: XSourceable) {
    return XJoinSource.of(XJoinOperator.CROSS, this, s)
  }
}

export class XSystemTableSource extends XSource {
  table?: XSystemTable | XSystemTableName

  getName() {
    return 'System Table Source'
  }

  getType(): XSourceType {
    return XSourceType.TABLE_SYSTEM
  }

  setTable(table: XSystemTable | XSystemTableName) {
    this.table = table
    return this
  }

  toStringBase() {
    return '`' + this.table + '`'
  }

  isValid() {
    return this.table != null
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)

    this.table = XSystemTableName.parse(obj.table)

    return this
  }

  clone() {
    return Object.assign(new XSystemTableSource(), this)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {
      table: toIdentifier(this.table)
    }
  }

  static of(table: XSystemTable | XSystemTableName, alias?: string): XSystemTableSource {
    return new XSystemTableSource().setTable(table).setAlias(alias)
  }
}

export class XDatabaseTableSource extends XSource {
  database?: XDatabase | string | number

  table?: XDatabaseTable | XDatabaseTableName

  getName() {
    return 'Database Table Source'
  }

  getType(): XSourceType {
    return XSourceType.TABLE_DATABASE
  }

  setDatabase(database: XDatabase | string | number) {
    this.database = database
    return this
  }

  setTable(table: XDatabaseTable | XDatabaseTableName) {
    this.table = table
    return this
  }

  toStringBase(): string {
    return '`' + this.database + '`.`' + this.table + '`'
  }

  isValid() {
    return this.database != null && this.table != null
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)

    if (isNumber(obj.database) || isString(obj.database)) {
      this.database = context.getDatabase(obj.database)
    } else {
      throw Error(`invalid database specifier: ${obj.database}`)
    }

    this.table = XDatabaseTableName.parse(obj.table)

    return this
  }

  clone() {
    return Object.assign(new XDatabaseTableSource(), this)
  }

  buildRest(pretty: boolean) {
    return {
      database: toSpecifier(this.database, pretty),
      table: toIdentifier(this.table)
    }
  }

  static of(
    database: XDatabase | string | number,
    table: XDatabaseTable | XDatabaseTableName,
    alias?: string
  ): XDatabaseTableSource {
    return new XDatabaseTableSource().setDatabase(database).setTable(table).setAlias(alias)
  }
}

export class XSelectSource extends XSource {
  select?: XSelect

  getName() {
    return 'System Table Source'
  }

  getType(): XSourceType {
    return XSourceType.SELECT
  }

  setSelect(select: XSelect) {
    this.select = select
    return this
  }

  toStringBase() {
    return `${this.select}`
  }

  isValid() {
    return !!this.select?.isValid()
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)
    this.select = parseSelect(obj.select, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XSelectSource(), this)
    clone.select = this.select?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      select: this.select?.build(pretty)
    }
  }

  static of(select: XSelect, alias?: string): XSelectSource {
    return new XSelectSource().setSelect(select).setAlias(alias)
  }
}

export default class XJoinSource extends XSource {
  op?: XJoinOperator

  s1?: XSource

  s2?: XSource

  constraint?: XConstraint

  getName() {
    return 'Join Source'
  }

  getType(): XSourceType {
    return XSourceType.JOIN
  }

  setOperator(op: XJoinOperator) {
    this.op = op
    return this
  }

  setSource1(s: XSourceable) {
    this.s1 = toSource(s)
    return this
  }

  setSource2(s: XSourceable) {
    this.s2 = toSource(s)
    return this
  }

  setConstraint(constraint: XConstraint) {
    this.constraint = constraint
    return this
  }

  on(e: XExpressionable) {
    this.constraint = XOnConstraint.of(e)
    return this
  }

  using(columns: string[]) {
    this.constraint = XUsingConstraint.of(columns)
    return this
  }

  isValid() {
    return !!(this.op && this.s1?.isValid() && this.s2?.isValid() && this.constraint?.isValid())
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.op = XJoinOperator.parse(obj.op)
    this.s1 = parseSource(obj.s1, context)
    this.s2 = parseSource(obj.s2, context)
    this.constraint = parseConstraint(obj.constraint, context)

    return this
  }

  clone() {
    const clone = Object.assign(new XJoinSource(), this)

    clone.s1 = this.s1?.clone()
    clone.s2 = this.s2?.clone()
    clone.constraint = this.constraint?.clone()

    return clone
  }

  toStringBase() {
    return `(${this.s1}) ${this.op} (${this.s2}) ${this.constraint}`
  }

  buildRest(pretty: boolean) {
    return {
      op: this.op?.name,
      s1: this.s1?.build(pretty),
      s2: this.s2?.build(pretty),
      constraint: this.constraint?.build(pretty)
    }
  }

  static of(op: XJoinOperator, s1: XSourceable, s2: XSourceable, constraint?: XConstraint) {
    const src = new XJoinSource().setOperator(op).setSource1(s1).setSource2(s2)
    if (constraint) return src.setConstraint(constraint)
    return src
  }
}

const sourceMap: Record<XSourceTypeName, new () => XSource> = {
  [XSourceTypeName.enum.table_system]: XSystemTableSource,
  [XSourceTypeName.enum.ts]: XSystemTableSource,
  [XSourceTypeName.enum.table_database]: XDatabaseTableSource,
  [XSourceTypeName.enum.td]: XDatabaseTableSource,
  [XSourceTypeName.enum.join]: XJoinSource,
  [XSourceTypeName.enum.select]: XSelectSource
} as const
