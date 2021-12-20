import Sugar from 'sugar'

import {
  checkOptionalString,
  checkString,
  isArray,
  isDatabase,
  isField,
  isNumber,
  ISO8601_DATE,
  ISO8601_DATETIME,
  ISO8601_LOCALDATETIME,
  isSimpleObject,
  isString,
  parseOptionalOrderTerms,
  parseSelect,
  toIdentifier,
  toSpecifier,
  XApiComponent,
  XApiContext,
  XAttribute,
  XBinaryOperator,
  XCompoundOperator,
  XDatabase,
  XDatabaseTable,
  XDatabaseTableName,
  XExpressionType,
  XExpressionTypeName,
  XField,
  XOrderTerm,
  XParameter,
  XResultColumn,
  XSearchOperator,
  XSelect,
  XSystemTable,
  XSystemTableName,
  XUnaryOperator
} from '../internal'

export function parseExpression(e: unknown, context: XApiContext) {
  if (e === false) return XNumberLiteral.FALSE
  if (e === true) return XNumberLiteral.TRUE
  if (isNumber(e)) return XNumberLiteral.of(e)
  if (isString(e)) return XStringLiteral.of(e)
  if (e instanceof Date) return XDateTimeLiteral.of(e)

  if (isSimpleObject(e)) {
    return new map[XExpressionTypeName.parse(e.type)]().load(e, context)
  }

  throw Error(`invalid expression: ${e}`)
}

export function parseExpressions(es: unknown, context: XApiContext) {
  if (!(es instanceof Array)) throw Error('expressions must be an array')
  return es.map((e) => parseExpression(e, context))
}

export function parseOptionalExpression(e: unknown, context: XApiContext) {
  if (e == null) return undefined
  return parseExpression(e, context)
}

export function parseOptionalExpressions(es: unknown, context: XApiContext) {
  if (es == null) return []
  return parseExpressions(es, context)
}

export type XExpressionable =
  | null
  | boolean
  | number
  | string
  | Date
  | XExpression
  | XSelect
  | XField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | XParameter<any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | XAttribute<any, any>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toOptionalExpression(v?: XExpressionable, _meta?: string | Record<string, unknown>) {
  if (v instanceof XExpression) return v

  if (v === undefined) return undefined

  if (v === null) return XNullLiteral.SINGLETON

  if (v === false) return new XNumberLiteral().setValue(0)
  if (v === true) return new XNumberLiteral().setValue(1)

  if (isNumber(v)) return new XNumberLiteral().setValue(v)
  if (isString(v)) return new XStringLiteral().setValue(v)
  if (v instanceof Date) return new XDateTimeLiteral().setValue(v)

  if (v instanceof XSelect) return new XSelectExpression().setSelect(v)

  if (isField(v)) return XColumnExpression.of(v, XDatabaseTable.RECORD, v.database)

  if (v instanceof XParameter) return XAliasExpression.of(v.name)

  if (v instanceof XAttribute) return XAliasExpression.of(v.name)

  throw Error(`invalid expression: ${v}`)
}

export function toExpression(v: XExpressionable, meta?: string | Record<string, unknown>) {
  const e = toOptionalExpression(v, meta)
  if (e === undefined) throw Error('expression cannot be undefined')
  return e
}

export abstract class XExpression implements XApiComponent<XExpression> {
  meta?: string | Record<string, unknown>

  abstract getName(): string
  abstract getType(): XExpressionType

  isValid() {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(_obj: Record<string, unknown>, _ctx: XApiContext) {
    return this
  }

  clone(): XExpression {
    return this
  }

  not() {
    return XUnaryExpression.of(XUnaryOperator.NOT, this)
  }

  negate() {
    return XUnaryExpression.of(XUnaryOperator.NEGATE, this)
  }

  bitInvert() {
    return XUnaryExpression.of(XUnaryOperator.BIT_INVERT, this)
  }

  ['~']() {
    return this.bitInvert()
  }

  and(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.AND, this, e)
  }

  ['&&'](e: XExpressionable) {
    return this.and(e)
  }

  or(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.OR, this, e)
  }

  ['||'](e: XExpressionable) {
    return this.or(e)
  }

  equal(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.EQUAL, this, e)
  }

  eq(e: XExpressionable) {
    return this.equal(e)
  }

  ['=='](e: XExpressionable) {
    return this.equal(e)
  }

  notEqual(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.NOT_EQUAL, this, e)
  }

  neq(e: XExpressionable) {
    return this.notEqual(e)
  }

  ['!='](e: XExpressionable) {
    return this.notEqual(e)
  }

  less(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.LESS, this, e)
  }

  lt(e: XExpressionable) {
    return this.less(e)
  }

  ['<'](e: XExpressionable) {
    return this.less(e)
  }

  lessOrEqual(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.LESS_OR_EQUAL, this, e)
  }

  lte(e: XExpressionable) {
    return this.lessOrEqual(e)
  }

  ['<='](e: XExpressionable) {
    return this.lessOrEqual(e)
  }

  greater(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.GREATER, this, e)
  }

  gt(e: XExpressionable) {
    return this.greater(e)
  }

  ['>'](e: XExpressionable) {
    return this.greater(e)
  }

  greaterOrEqual(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.GREATER_OR_EQUAL, this, e)
  }

  gte(e: XExpressionable) {
    return this.greaterOrEqual(e)
  }

  ['>='](e: XExpressionable) {
    return this.greaterOrEqual(e)
  }

  is(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.IS, this, e)
  }

  isNull() {
    return XIsNullExpression.of(this)
  }

  isNotNull() {
    return this.isNull().not()
  }

  like(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.LIKE, this, e)
  }

  regexp(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.REGEXP, this, e)
  }

  plus(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.PLUS, this, e)
  }

  ['+'](e: XExpressionable) {
    return this.plus(e)
  }

  minus(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.MINUS, this, e)
  }

  ['-'](e: XExpressionable) {
    return this.minus(e)
  }

  multiply(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.MULTIPLY, this, e)
  }

  ['*'](e: XExpressionable) {
    return this.minus(e)
  }

  divide(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.DIVIDE, this, e)
  }

  ['/'](e: XExpressionable) {
    return this.divide(e)
  }

  mod(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.MOD, this, e)
  }

  ['%'](e: XExpressionable) {
    return this.mod(e)
  }

  bitAnd(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.BIT_AND, this, e)
  }

  ['&'](e: XExpressionable) {
    return this.bitAnd(e)
  }

  bitOr(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.BIT_OR, this, e)
  }

  ['|'](e: XExpressionable) {
    return this.bitOr(e)
  }

  shiftLeft(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.SHIFT_LEFT, this, e)
  }

  ['>>'](e: XExpressionable) {
    return this.shiftLeft(e)
  }

  shiftRight(e: XExpressionable) {
    return XBinaryExpression.of(XBinaryOperator.SHIFT_RIGHT, this, e)
  }

  ['<<'](e: XExpressionable) {
    return this.shiftRight(e)
  }

  between(min: XExpressionable, max: XExpressionable) {
    return XBetweenExpression.of(this, min, max)
  }

  in(v: XSelect | XExpressionable[]) {
    if (v instanceof XSelect) {
      return XInSelectExpression.of(this, v)
    } else if (v.length) {
      return XInExpression.of(this, v)
    } else {
      return XNumberLiteral.FALSE
    }
  }

  as(alias: string) {
    return XResultColumn.of(this, alias)
  }

  collate(collation: string) {
    return XCollateExpression.of(this, collation)
  }

  build(pretty: boolean) {
    const built = {
      type: this.getType().name,
      meta: this.meta,
      ...this.buildRest(pretty)
    } as Record<string, unknown>

    Object.keys(built).forEach((k) => {
      if (built[k] == null) delete built[k]
    })

    return built
  }

  abstract buildRest(pretty: boolean): Record<string, unknown>
}

// ============================================================================
// Literals
// ============================================================================

// ----------------------------------------------------------------------------
// Null Literal
// ----------------------------------------------------------------------------

export class XNullLiteral extends XExpression {
  getName() {
    return 'Null Literal'
  }

  getType(): XExpressionType {
    return XExpressionType.NULL
  }

  toString() {
    return 'NULL'
  }

  isValid() {
    return true
  }

  buildRest() {
    return {}
  }

  static readonly SINGLETON = new XNullLiteral()
}

// ----------------------------------------------------------------------------
// Number Literal
// ----------------------------------------------------------------------------

export class XNumberLiteral extends XExpression {
  value?: number

  getName() {
    return 'Number Literal'
  }

  getType(): XExpressionType {
    return XExpressionType.NUMBER
  }

  setValue(v: unknown) {
    const n = Number(v)
    if (isNaN(n)) throw Error(`value is not a number: ${v}`)
    this.value = n
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(obj: Record<string, unknown>, _ctx: XApiContext) {
    this.setValue(obj.value)
    return this
  }

  clone() {
    return Object.assign(new XNumberLiteral(), this)
  }

  buildRest() {
    return { value: this.value }
  }

  static of(value: number) {
    return new XNumberLiteral().setValue(value)
  }

  static readonly FALSE = XNumberLiteral.of(0)
  static readonly TRUE = XNumberLiteral.of(1)
}

// ----------------------------------------------------------------------------
// String Literal
// ----------------------------------------------------------------------------

export class XStringLiteral extends XExpression {
  value?: string

  getName() {
    return 'String Literal'
  }

  getType(): XExpressionType {
    return XExpressionType.STRING
  }

  isValid() {
    return !!this.value
  }

  setValue(v: unknown): XStringLiteral {
    if (v == null) throw Error('value cannot be null or undefined')

    if (isString(v)) {
      this.value = v
    } else {
      this.value = '' + v
    }

    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(obj: Record<string, unknown>, _ctx: XApiContext) {
    this.setValue(obj.value)
    return this
  }

  clone() {
    return XStringLiteral.of(this.value)
  }

  buildRest() {
    return { value: this.value }
  }

  static of(s: unknown) {
    return new XStringLiteral().setValue(s)
  }
}

// ----------------------------------------------------------------------------
// Date Time Literal
// ----------------------------------------------------------------------------

export class XDateTimeLiteral extends XExpression {
  value?: Date

  getName() {
    return 'Date Time Literal'
  }

  getType(): XExpressionType {
    return XExpressionType.DATETIME
  }

  isValid() {
    return !!(this.value && Sugar.Date.isValid(this.value))
  }

  setValue(v: unknown): XDateTimeLiteral {
    if (v == null) throw Error('value cannot be null or undefined')

    if (v instanceof Date) {
      this.value = v
    } else if (isString(v) || isNumber(v)) {
      const date = Sugar.Date.create(v)
      if (Sugar.Date.isValid(date)) this.value = date
    } else {
      throw Error(`invalid datetime literal: ${v}`)
    }

    return this
  }

  toString() {
    return this.value ? Sugar.Date.format(this.value, ISO8601_DATETIME) : ''
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)
    this.setValue(obj.value)
    return this
  }

  clone() {
    return Object.assign(new XDateTimeLiteral(), this)
  }

  buildRest() {
    return {
      value: this.value ? Sugar.Date.format(this.value, ISO8601_DATETIME) : undefined
    }
  }

  static of(date: unknown) {
    return new XDateTimeLiteral().setValue(date)
  }
}

// ----------------------------------------------------------------------------
// Local Date Time Literal
// ----------------------------------------------------------------------------

export class XLocalDateTimeLiteral extends XExpression {
  value?: Date

  getName() {
    return 'Local Date Time Literal'
  }

  getType(): XExpressionType {
    return XExpressionType.LOCALDATETIME
  }

  isValid() {
    return !!(this.value && Sugar.Date.isValid(this.value))
  }

  setValue(v: unknown) {
    if (v == null) throw Error('value cannot be null or undefined')

    if (v instanceof Date) {
      this.value = v
    } else if (isString(v) || isNumber(v)) {
      const date = Sugar.Date.create(v)
      if (Sugar.Date.isValid(date)) this.value = date
    } else {
      throw Error(`invalid datetime literal: ${v}`)
    }

    return this
  }

  toString() {
    return this.value ? Sugar.Date.format(this.value, ISO8601_LOCALDATETIME) : ''
  }

  load(obj: Record<string, unknown>) {
    return this.setValue(obj.value)
  }

  clone() {
    return Object.assign(new XLocalDateTimeLiteral(), this)
  }

  buildRest() {
    return {
      value: this.value ? Sugar.Date.format(this.value, ISO8601_LOCALDATETIME) : undefined
    }
  }

  static of(date: unknown) {
    return new XLocalDateTimeLiteral().setValue(date)
  }
}

// ============================================================================
// Expressions
// ============================================================================

// ----------------------------------------------------------------------------
// Alias
// ----------------------------------------------------------------------------

export class XAliasExpression extends XExpression {
  alias?: string

  getName() {
    return 'Alias Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.ALIAS
  }

  isValid() {
    return !!this.alias
  }

  toString() {
    return '`' + this.alias + '`'
  }

  setAlias(alias: unknown) {
    if (alias == null) throw Error('alias cannot be null or undefined')

    if (isString(alias)) {
      this.alias = alias
    } else {
      this.alias = '' + alias
    }

    return this
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)
    return this.setAlias(obj.alias)
  }

  clone() {
    return Object.assign(new XAliasExpression(), this)
  }

  buildRest() {
    return { alias: this.alias }
  }

  static of(alias: string) {
    return new XAliasExpression().setAlias(alias)
  }
}

// ----------------------------------------------------------------------------
// Between
// ----------------------------------------------------------------------------

export class XBetweenExpression extends XExpression {
  e?: XExpression
  min?: XExpression
  max?: XExpression

  getName() {
    return 'Between Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.BETWEEN
  }

  isValid() {
    return !!(this.e?.isValid() && this.min?.isValid() && this.max?.isValid())
  }

  toString() {
    return `(${this.e}) BETWEEN (${this.min}) AND (${this.max})`
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  setMin(min: XExpressionable) {
    this.min = toExpression(min)
    return this
  }

  setMax(max: XExpressionable) {
    this.max = toExpression(max)
    return this
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)

    this.e = parseExpression(obj.e, context)
    this.min = parseExpression(obj.min, context)
    this.max = parseExpression(obj.max, context)

    return this
  }

  clone() {
    const clone = Object.assign(new XBetweenExpression(), this)

    clone.e = this.e?.clone()
    clone.min = this.min?.clone()
    clone.max = this.max?.clone()

    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty),
      min: this.min?.build(pretty),
      max: this.max?.build(pretty)
    }
  }

  static of(e: XExpressionable, min: XExpressionable, max: XExpressionable) {
    return new XBetweenExpression().setExpression(e).setMin(min).setMax(max)
  }
}

// ----------------------------------------------------------------------------
// Binary
// ----------------------------------------------------------------------------

export class XBinaryExpression extends XExpression {
  op?: XBinaryOperator
  e1?: XExpression
  e2?: XExpression

  getName() {
    return 'Binary Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.BINARY
  }

  setOp(op: XBinaryOperator) {
    this.op = op
    return this
  }

  setExpression1(e1: XExpressionable) {
    this.e1 = toExpression(e1)
    return this
  }

  setExpression2(e2: XExpressionable) {
    this.e2 = toExpression(e2)
    return this
  }

  isValid() {
    return !!(this.op && this.e1?.isValid() && this.e2?.isValid())
  }

  toString() {
    return `(${this.e1}) ${this.op} (${this.e2})`
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)

    this.op = XBinaryOperator.parse(obj.op)
    this.e1 = parseExpression(obj.e1, context)
    this.e2 = parseExpression(obj.e2, context)

    return this
  }

  clone() {
    const clone = Object.assign(new XBinaryExpression(), this)

    clone.e1 = this.e1?.clone()
    clone.e2 = this.e2?.clone()

    return clone
  }

  buildRest(pretty: boolean) {
    return {
      op: this.op,
      e1: this.e1?.build(pretty),
      e2: this.e2?.build(pretty)
    }
  }

  static of(op: XBinaryOperator, e1: XExpressionable, e2: XExpressionable) {
    return new XBinaryExpression().setOp(op).setExpression1(e1).setExpression2(e2)
  }
}

// ----------------------------------------------------------------------------
// Case
// ----------------------------------------------------------------------------

export class XCaseExpression extends XExpression {
  baseExpression?: XExpression
  elseExpression?: XExpression
  cases: { when: XExpression; then: XExpression }[] = []

  getName() {
    return 'Case Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.CASE
  }

  setBaseExpression(e?: XExpressionable) {
    this.baseExpression = e === undefined ? e : toExpression(e)
    return this
  }

  setElseExpression(e?: XExpressionable) {
    this.elseExpression = e === undefined ? e : toExpression(e)
    return this
  }

  setCases(cases: { when: XExpressionable; then: XExpressionable }[]) {
    this.cases = []
    return this.addCases(cases)
  }

  addCase(when: XExpressionable, then: XExpressionable) {
    this.cases.push({ when: toExpression(when), then: toExpression(then) })
    return this
  }

  addCases(cases: { when: XExpressionable; then: XExpressionable }[]) {
    this.cases.push(...cases.map((c) => ({ when: toExpression(c.when), then: toExpression(c.then) })))
    return this
  }

  isValid() {
    if (this.baseExpression && !this.baseExpression.isValid()) return false
    if (this.elseExpression && !this.elseExpression.isValid()) return false

    for (const c of this.cases) {
      if (!c.when.isValid() || !c.then.isValid()) return false
    }

    return !!this.cases.length
  }

  toString() {
    let s = 'CASE'

    if (this.baseExpression) s += ` (${this.baseExpression})`

    this.cases.forEach(function (c) {
      s += ` WHEN (${c.when}) THEN (${c.then})`
    })

    if (this.elseExpression) s += ` ELSE (${this.elseExpression})`

    return s
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isArray<any>(obj.cases)) throw Error(`invalid case expression: ${obj}`)

    const cases = obj.cases.map((c) => ({
      when: parseExpression(c.when, context),
      then: parseExpression(c.then, context)
    }))

    let baseExpression = undefined
    let elseExpression = undefined

    if (obj.base) baseExpression = parseExpression(obj.base, context)
    if (obj.else) elseExpression = parseExpression(obj.else, context)

    this.cases = cases
    this.baseExpression = baseExpression
    this.elseExpression = elseExpression

    return this
  }

  clone() {
    const clone = Object.assign(new XCaseExpression(), this)

    clone.cases = this.cases.map((c) => ({ when: c.when.clone(), then: c.then.clone() }))
    clone.baseExpression = this.baseExpression?.clone()
    clone.elseExpression = this.elseExpression?.clone()

    return clone
  }

  buildRest(pretty: boolean) {
    const cases = []

    for (const c of this.cases) {
      cases.push({
        when: c.when.build(pretty),
        then: c.then.build(pretty)
      })
    }

    const obj: Record<string, unknown> = { cases }

    if (this.baseExpression) {
      obj.base = this.baseExpression.build(pretty)
    }

    if (this.elseExpression) {
      obj.else = this.elseExpression.build(pretty)
    }

    return obj
  }

  static of(
    cases: { when: XExpressionable; then: XExpressionable }[],
    baseExpression?: XExpressionable,
    elseExpression?: XExpressionable
  ) {
    return new XCaseExpression().setCases(cases).setBaseExpression(baseExpression).setElseExpression(elseExpression)
  }
}

// ----------------------------------------------------------------------------
// Collate
// ----------------------------------------------------------------------------

export class XCollateExpression extends XExpression {
  e?: XExpression
  collation?: string

  getName() {
    return 'Collate Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.COLLATE
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  setCollation(collation: string) {
    this.collation = collation
    return this
  }

  toString() {
    return `(${this.e}) COLLATE ${this.collation}`
  }

  isValid() {
    return !!(this.e?.isValid() && this.collation)
  }

  load(obj: Record<string, unknown>, ctx: XApiContext) {
    if (!isString(obj.collation)) throw Error(`invalid collate expression: ${obj}`)

    this.e = parseExpression(obj.e, ctx)
    this.collation = obj.collation

    return this
  }

  clone() {
    const clone = Object.assign(new XCollateExpression(), this)
    clone.e = this.e?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty),
      collation: this.collation
    }
  }

  static of(e: XExpressionable, collation: string) {
    return new XCollateExpression().setExpression(e).setCollation(collation)
  }
}

// ----------------------------------------------------------------------------
// Column
// ----------------------------------------------------------------------------

export class XColumnExpression extends XExpression {
  database?: XDatabase | string | number
  table?: XSystemTable | XSystemTableName | XDatabaseTable | XDatabaseTableName
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column?: XField | XParameter<any, any> | XAttribute<any, any> | string

  getName(): string {
    return 'Column Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.COLUMN
  }

  setDatabase(database?: XDatabase | string | number) {
    this.database = database
    return this
  }

  setTable(table: XSystemTable | XSystemTableName | XDatabaseTable | XDatabaseTableName) {
    this.table = table
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setColumn(column: XField | XParameter<any, any> | XAttribute<any, any> | string) {
    this.column = column
    return this
  }

  isValid() {
    return !!this.table && !!this.column
  }

  toString() {
    let s = '`' + this.table + '`.`' + this.column + '`'
    const db = this.database

    if (db !== undefined) {
      s = '`' + (isDatabase(db) ? db.getLabelPath() : db) + '`.' + s
    }

    return s
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)

    const d = obj.database
    const t = obj.table
    const c = obj.column

    let database: XDatabase | undefined = undefined
    let table: XSystemTableName | XDatabaseTableName
    const column = checkString(c, 'column')

    if (d != null) {
      if (isNumber(obj.database) || isString(obj.database)) {
        database = context.databases.get(obj.database)
      }

      throw Error(`invalid database specifier: ${d}`)
    }

    if (XSystemTableName.safeParse(t).success) {
      if (d) throw Error(`cannot specify system table with database present: ${t}`)
      table = XSystemTableName.parse(t)
    } else if (XDatabaseTableName.safeParse(t).success) {
      if (!d) throw Error(`cannot specify database table without database present: ${t}`)
      table = XDatabaseTableName.parse(t)
    } else {
      throw Error(`invalid table specifier: ${t}`)
    }

    this.database = database
    this.table = table
    this.column = column

    return this
  }

  clone() {
    return Object.assign(new XColumnExpression(), this)
  }

  buildRest(pretty: boolean) {
    const obj: Record<string, unknown> = {
      table: toIdentifier(this.table),
      column: toIdentifier(this.column)
    }

    if (this.database) obj.database = toSpecifier(this.database, pretty)

    return obj
  }

  static of(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    column: XField | XParameter<any, any> | XAttribute<any, any> | string,
    table: XSystemTable | XSystemTableName | XDatabaseTable | XDatabaseTableName,
    database?: XDatabase | string | number
  ) {
    return new XColumnExpression().setColumn(column).setTable(table).setDatabase(database)
  }
}

// ----------------------------------------------------------------------------
// Compound
// ----------------------------------------------------------------------------

export class XCompoundExpression extends XExpression {
  op?: XCompoundOperator
  expressions: XExpression[] = []

  getName() {
    return 'Compound Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.COMPOUND
  }

  setOp(op: XCompoundOperator) {
    this.op = op
    return this
  }

  setExpressions(es: XExpressionable[]) {
    this.expressions = es.map((e) => toExpression(e))
    return this
  }

  addExpressions(es: XExpressionable[] | XExpression) {
    if (es instanceof Array) {
      this.expressions.push(...es.map((e) => toExpression(e)))
    } else {
      this.expressions.push(toExpression(es))
    }
    return this
  }

  addExpression(e: XExpressionable) {
    this.expressions.push(toExpression(e))
    return this
  }

  toString() {
    return this.expressions.join(` ${this.op} `)
  }

  isValid() {
    return !!(this.op && this.expressions.length && !this.expressions.some((e) => !e.isValid()))
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.op = XCompoundOperator.parse(obj.op)
    this.expressions = parseExpressions(obj.expressions, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XCompoundExpression(), this)
    clone.expressions = this.expressions.map((e) => e.clone())
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      op: this.op,
      expressions: this.expressions.map((e) => e.build(pretty))
    }
  }

  static of(op: XCompoundOperator, expressions: XExpressionable[]) {
    return new XCompoundExpression().setOp(op).setExpressions(expressions)
  }
}

// ----------------------------------------------------------------------------
// Count Rows
// ----------------------------------------------------------------------------

export class XCountRowsExpression extends XExpression {
  getName() {
    return 'Count Rows'
  }

  getType(): XExpressionType {
    return XExpressionType.COUNT_ROWS
  }

  toString() {
    return 'COUNT(*)'
  }

  isValid() {
    return true
  }

  buildRest() {
    return {}
  }

  static readonly SINGLETON = new XCountRowsExpression()
}

// ----------------------------------------------------------------------------
// Exists
// ----------------------------------------------------------------------------

export class XExistsExpression extends XExpression {
  e?: XExpression

  getName() {
    return 'Exists Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.EXISTS
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  isValid() {
    return !!this.e?.isValid()
  }

  toString() {
    return `EXISTS (${this.e})`
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.e = parseExpression(obj.e, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XExistsExpression(), this)
    clone.e = this.e?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty)
    }
  }

  static of(e: XExpressionable) {
    return new XExistsExpression().setExpression(e)
  }
}

// ----------------------------------------------------------------------------
// Function
// ----------------------------------------------------------------------------

export class XFunctionExpression extends XExpression {
  func?: string
  args: XExpression[] = []

  getName() {
    return 'Function Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.FUNCTION
  }

  setFunction(func: string) {
    this.func = func
    return this
  }

  setArgs(...args: XExpressionable[]) {
    this.args = args.map((arg) => toExpression(arg))
    return this
  }

  addArgs(...args: XExpressionable[]) {
    this.args.push(...args.map((arg) => toExpression(arg)))
    return this
  }

  toString() {
    return `${this.func?.toUpperCase()} (${this.args.join(', ')})`
  }

  isValid() {
    return !!this.func && !this.args.some((arg) => !arg.isValid())
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    if (!isString(obj.function)) throw Error(`invalid function expression: ${obj}`)

    this.func = obj.function
    this.args = parseExpressions(obj.args, context)

    return this
  }

  clone() {
    const clone = Object.assign(new XFunctionExpression(), this)
    clone.args = this.args.map((arg) => arg.clone())
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      function: this.func,
      args: this.args.map((arg) => arg.build(pretty))
    }
  }

  static of(func: string, ...args: XExpressionable[]) {
    return new XFunctionExpression().setFunction(func).setArgs(...args)
  }
}

// ----------------------------------------------------------------------------
// Group Concat
// ----------------------------------------------------------------------------

export class XGroupConcatExpression extends XExpression {
  distinct = false
  args: XExpression[] = []
  separator?: string
  orderBy: XOrderTerm[] = []

  getName() {
    return 'Group Concat Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.GROUP_CONCAT
  }

  setDistinct(distinct: boolean) {
    this.distinct = distinct
    return this
  }

  setSeparator(separator?: string) {
    this.separator = separator
    return this
  }

  setArgs(args: XExpressionable[]) {
    this.args = args.map((arg) => toExpression(arg))
    return this
  }

  addArg(arg: XExpressionable) {
    this.args.push(toExpression(arg))
    return this
  }

  setOrderBy(ts?: XOrderTerm[] | XOrderTerm) {
    if (isArray(ts)) {
      this.orderBy = [...ts]
    } else if (ts) {
      this.orderBy = [ts]
    } else {
      this.orderBy = []
    }

    return this
  }

  setOrderByAsc(e: XExpressionable) {
    return this.setOrderBy(XOrderTerm.ofAsc(e))
  }

  setOrderByDesc(e: XExpressionable) {
    return this.setOrderBy(XOrderTerm.ofDesc(e))
  }

  addOrderBy(ts: XOrderTerm[] | XOrderTerm) {
    if (isArray(ts)) {
      this.orderBy.push(...ts)
    } else {
      this.orderBy.push(ts)
    }

    return this
  }

  addOrderByAsc(e: XExpressionable) {
    return this.addOrderBy(XOrderTerm.ofAsc(e))
  }

  addOrderByDesc(e: XExpressionable) {
    return this.addOrderBy(XOrderTerm.ofDesc(e))
  }

  toString() {
    return `GROUP_CONCAT(${this.distinct ? 'DISTINCT ' : ''} ${this.args.join(', ')} ${
      this.orderBy.length ? 'ORDER BY ' : ''
    }${this.orderBy.join(', ')}${this.separator ? 'SEPARATOR ' + this.separator : ''})`
  }

  isValid() {
    return !!this.args.length && !this.args.some((arg) => !arg.isValid()) && !this.orderBy.some((arg) => !arg.isValid())
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.args = parseExpressions(obj.args, context)
    this.distinct = !!obj.distinct
    this.separator = checkOptionalString(obj.separator)
    this.orderBy = parseOptionalOrderTerms(obj.order, context)

    return this
  }

  clone() {
    const clone = Object.assign(new XGroupConcatExpression(), this)
    clone.args = this.args.map((arg) => arg.clone())
    clone.orderBy = this.orderBy.map((term) => term.clone())
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      args: this.args.map((arg) => arg.build(pretty)),
      distinct: this.distinct,
      separator: this.separator,
      order: this.orderBy.length ? this.orderBy.map((term) => term.build(pretty)) : undefined
    }
  }

  static of(args: XExpressionable[], orderBy?: XOrderTerm[], separator?: string, distinct = false) {
    return new XGroupConcatExpression().setArgs(args).setOrderBy(orderBy).setSeparator(separator).setDistinct(distinct)
  }
}

// ----------------------------------------------------------------------------
// In
// ----------------------------------------------------------------------------

export class XInExpression extends XExpression {
  e?: XExpression
  es: XExpression[] = []

  getName() {
    return 'In Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.IN
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  setExpressions(es: XExpressionable[]) {
    this.es = es.map((e) => toExpression(e))
    return this
  }

  addExpression(e: XExpressionable) {
    this.es.push(toExpression(e))
    return this
  }

  toString() {
    return `${this.e} IN (${this.es.join(', ')})`
  }

  isValid() {
    return !!(this.e?.isValid() && !this.es.some((e) => !e.isValid()))
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.e = parseExpression(obj.e, context)
    this.es = parseExpressions(obj.values, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XInExpression(), this)

    clone.e = this.e?.clone()
    clone.es = this.es.map((e) => e.clone())

    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty),
      values: this.es.map((e) => e.build(pretty))
    }
  }

  static of(e: XExpressionable, es: XExpressionable[]) {
    return new XInExpression().setExpression(e).setExpressions(es)
  }
}

// ----------------------------------------------------------------------------
// In Select
// ----------------------------------------------------------------------------

export class XInSelectExpression extends XExpression {
  e?: XExpression
  select?: XSelect

  getName() {
    return 'In Select Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.IN_SELECT
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  setSelect(select: XSelect) {
    this.select = select
    return this
  }

  toString() {
    return `${this.e} IN (${this.select})`
  }

  isValid() {
    return !!(this.e?.isValid() && this.select?.isValid())
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.e = parseExpression(obj.e, context)
    this.select = parseSelect(obj.select, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XInSelectExpression(), this)
    clone.e = this.e?.clone()
    clone.select = this.select?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty),
      select: this.select?.build(pretty)
    }
  }

  static of(e: XExpressionable, select: XSelect) {
    return new XInSelectExpression().setExpression(e).setSelect(select)
  }
}

// ----------------------------------------------------------------------------
// Is Null
// ----------------------------------------------------------------------------

export class XIsNullExpression extends XExpression {
  e?: XExpression

  getName() {
    return 'Is Null Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.IS_NULL
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  isValid() {
    return !!this.e?.isValid()
  }

  toString() {
    return `${this.e} IS NULL`
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.e = parseExpression(obj.e, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XIsNullExpression(), this)
    clone.e = this.e?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty)
    }
  }

  static of(e: XExpressionable) {
    return new XIsNullExpression().setExpression(e)
  }
}

// ----------------------------------------------------------------------------
// Search
// ----------------------------------------------------------------------------

export class XSearchExpression extends XExpression {
  database?: XDatabase | string | number
  search?: XField | string
  op?: XSearchOperator
  value?: Date | string
  cs?: boolean
  js?: string

  getName() {
    return 'Search Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.SEARCH
  }

  setDatabase(database: XDatabase | string | number) {
    this.database = database
    return this
  }

  setSearch(search: XField | string) {
    this.search = search
    return this
  }

  isValid() {
    return !!(this.database && this.search && this.op)
  }

  toString() {
    if (!this.search || !this.value) return 'all'
    return (isString(this.search) ? this.search : '`' + this.search + '`') + `${this.js} ${this.op} "${this.value}"`
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.database = context.databases.parse(obj.database)

    if (isString(obj.search) && obj.search.startsWith('$')) {
      this.search = obj.search.substring(1)
    } else {
      this.search = this.database.fields.parse(obj.search)
    }

    this.op = XSearchOperator.parse(obj.op)

    this.value = checkString(obj.value)
    this.cs = !!obj.cs
    this.js = checkString(obj.json)

    return this
  }

  clone() {
    return Object.assign(new XSearchExpression(), this)
  }

  buildRest(pretty: boolean) {
    const search = isString(this.search) ? '$' + this.search : this.search?.name
    const value = this.value instanceof Date ? Sugar.Date.format(this.value, ISO8601_DATE) : this.value

    return {
      database: toSpecifier(this.database, pretty),
      search: search,
      op: this.op?.name,
      value: value,
      cs: !!this.cs,
      json: this.js
    }
  }

  static of(e: XExpressionable) {
    return new XIsNullExpression().setExpression(e)
  }
}

// ----------------------------------------------------------------------------
// Select
// ----------------------------------------------------------------------------

export class XSelectExpression extends XExpression {
  select?: XSelect

  getName() {
    return 'Select Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.SELECT
  }

  setSelect(select: XSelect) {
    this.select = select
    return this
  }

  isValid() {
    return !!this.select?.isValid()
  }

  toString() {
    return `(${this.select})`
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.select = parseSelect(obj.select, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XSelectExpression(), this)
    clone.select = this.select?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      select: this.select?.build(pretty)
    }
  }

  static of(select: XSelect) {
    return new XSelectExpression().setSelect(select)
  }
}

// ----------------------------------------------------------------------------
// Unary
// ----------------------------------------------------------------------------

export class XUnaryExpression extends XExpression {
  op?: XUnaryOperator
  e?: XExpression

  getName() {
    return 'Unary Expression'
  }

  getType(): XExpressionType {
    return XExpressionType.UNARY
  }

  setOp(op: XUnaryOperator) {
    this.op = op
    return this
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  isValid() {
    return !!(this.op && this.e?.isValid())
  }

  toString() {
    return `${this.op} (${this.e})`
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    super.load(obj, context)
    this.op = XUnaryOperator.parse(obj.op)
    this.e = parseExpression(obj.e, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XUnaryExpression(), this)
    clone.e = this.e?.clone()
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      op: this.op,
      e: this.e?.build(pretty)
    }
  }

  static of(op: XUnaryOperator, e: XExpressionable) {
    return new XUnaryExpression().setOp(op).setExpression(e)
  }
}

const map: Record<XExpressionTypeName, new () => XExpression> = {
  [XExpressionTypeName.enum.alias]: XAliasExpression,
  [XExpressionTypeName.enum.between]: XBetweenExpression,
  [XExpressionTypeName.enum.binary]: XBinaryExpression,
  [XExpressionTypeName.enum.case]: XCaseExpression,
  [XExpressionTypeName.enum.collate]: XCollateExpression,
  [XExpressionTypeName.enum.column]: XColumnExpression,
  [XExpressionTypeName.enum.col]: XColumnExpression,
  [XExpressionTypeName.enum.compound]: XCompoundExpression,
  [XExpressionTypeName.enum.count_rows]: XCountRowsExpression,
  [XExpressionTypeName.enum.datetime]: XDateTimeLiteral,
  [XExpressionTypeName.enum.date_time]: XDateTimeLiteral,
  [XExpressionTypeName.enum.dt]: XDateTimeLiteral,
  [XExpressionTypeName.enum.exists]: XExistsExpression,
  [XExpressionTypeName.enum.function]: XFunctionExpression,
  [XExpressionTypeName.enum.group_concat]: XGroupConcatExpression,
  [XExpressionTypeName.enum.in]: XInExpression,
  [XExpressionTypeName.enum.in_select]: XInSelectExpression,
  [XExpressionTypeName.enum.is_null]: XIsNullExpression,
  [XExpressionTypeName.enum.localdatetime]: XLocalDateTimeLiteral,
  [XExpressionTypeName.enum.ldt]: XLocalDateTimeLiteral,
  [XExpressionTypeName.enum.null]: XNullLiteral,
  [XExpressionTypeName.enum.number]: XNumberLiteral,
  [XExpressionTypeName.enum.search]: XSearchExpression,
  [XExpressionTypeName.enum.select]: XSelectExpression,
  [XExpressionTypeName.enum.string]: XStringLiteral,
  [XExpressionTypeName.enum.unary]: XUnaryExpression
} as const
