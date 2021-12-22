import { toResultColumn } from '..'
import {
  isSimpleObject,
  parseOptionalExpression,
  parseOptionalExpressions,
  parseOptionalOrderTerms,
  parseOptionalSource,
  parseResultColumns,
  toExpression,
  toOptionalExpression,
  toSource,
  XApiComponent,
  XApiContext,
  XExpression,
  XExpressionable,
  XOrderTerm,
  XResultColumn,
  XResultColumnable,
  XSelectExpression,
  XSelectSource,
  XSource,
  XSourceable
} from '../internal'

export function parseSelect(select: unknown, ctx: XApiContext) {
  if (!isSimpleObject(select)) throw Error(`invalid select: ${select}`)
  return new XSelect().load(select, ctx)
}

export class XSelect implements XApiComponent<XSelect> {
  distinct = false

  unions: XSelect[] = []

  columns: XResultColumn[] = []

  source?: XSource
  where?: XExpression
  groupBy: XExpression[] = []
  having?: XExpression
  orderBy: XOrderTerm[] = []
  limit?: XExpression
  offset?: XExpression

  setDistinct(distinct = true) {
    this.distinct = distinct
    return this
  }

  setUnions(...unions: XSelect[]) {
    this.unions = [...unions]
    return this
  }

  addUnions(...unions: XSelect[]) {
    this.unions.push(...unions)
    return this
  }

  setColumns(...columns: XResultColumnable[]) {
    this.columns = [...columns.map((c) => toResultColumn(c))]
    return this
  }

  addColumns(...columns: XResultColumnable[]) {
    this.columns.push(...columns.map((c) => toResultColumn(c)))
    return this
  }

  setSource(source: XSourceable) {
    this.source = toSource(source)
    return this
  }

  setFrom(source: XSourceable) {
    return this.setSource(source)
  }

  setWhere(where: XExpressionable) {
    this.where = toExpression(where)
    return this
  }

  setGroupBy(...groupBy: XExpressionable[]) {
    this.groupBy = groupBy.map((e) => toExpression(e))
    return this
  }

  addGroupBy(...groupBy: XExpressionable[]) {
    this.groupBy.push(...groupBy.map((e) => toExpression(e)))
    return this
  }

  setHaving(having?: XExpressionable) {
    this.having = toOptionalExpression(having)
    return this
  }

  setOrderBy(...orderBy: XOrderTerm[]) {
    this.orderBy = [...orderBy]
    return this
  }

  addOrderBy(...orderBy: XOrderTerm[]) {
    this.orderBy.push(...orderBy)
    return this
  }

  setOrderByAsc(...orderBy: XExpressionable[]) {
    return this.setOrderBy(...orderBy.map((o) => XOrderTerm.ofAsc(o)))
  }

  setOrderByDesc(...orderBy: XExpressionable[]) {
    return this.setOrderBy(...orderBy.map((o) => XOrderTerm.ofDesc(o)))
  }

  addOrderByAsc(...orderBy: XExpressionable[]) {
    return this.addOrderBy(...orderBy.map((o) => XOrderTerm.ofAsc(o)))
  }

  addOrderByDesc(...orderBy: XExpressionable[]) {
    return this.addOrderBy(...orderBy.map((o) => XOrderTerm.ofDesc(o)))
  }

  setLimit(limit?: XExpressionable) {
    this.limit = toOptionalExpression(limit)
    return this
  }

  setOffset(offset?: XExpressionable) {
    this.offset = toOptionalExpression(offset)
    return this
  }

  toString() {
    let s = ''

    if (this.unions.length) {
      s = '(' + this.unions.map((u) => u.toString()).join(' UNION ') + ')'
    } else {
      s = 'SELECT '

      if (this.distinct) {
        s += 'DISTINCT '
      }

      if (this.columns.length) {
        s += this.columns
      } else {
        s += '*'
      }

      if (this.source) s += ` FROM ${this.source}`
    }

    if (this.where) s += ` WHERE ${this.where}`
    if (this.groupBy.length) s += ` GROUP BY ${this.groupBy}`
    if (this.having) s += ` HAVING ${this.having}`
    if (this.orderBy.length) s += ` ORDER BY ${this.orderBy}`
    if (this.limit) s += ` LIMIT ${this.limit}`
    if (this.offset) s += ` OFFSET ${this.offset}`

    return s
  }

  toExpression() {
    return XSelectExpression.of(this)
  }

  toSource() {
    return XSelectSource.of(this)
  }

  as(alias: string) {
    return this.toSource().setAlias(alias)
  }

  isValid() {
    if (!this.unions.some((u) => !u.isValid())) return false
    if (!this.columns.some((c) => !c.isValid())) return false

    // cannot specify both columns and unions
    if (this.unions.length && this.columns.length) return false

    if (this.source && !this.source.isValid()) return false
    if (this.where && !this.where.isValid()) return false
    if (this.having && !this.having.isValid()) return false
    if (this.offset && !this.offset.isValid()) return false
    if (this.limit && !this.limit.isValid()) return false

    if (this.groupBy.some((e) => !e.isValid())) return false
    if (this.orderBy.some((t) => !t.isValid())) return false

    return true
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.distinct = !!obj.distinct

    const columns = parseResultColumns(obj.columns, context)
    const source = parseOptionalSource(obj.from, context)
    const where = parseOptionalExpression(obj.where, context)
    const groupBy = parseOptionalExpressions(obj.group, context)
    const having = parseOptionalExpression(obj.having, context)
    const orderBy = parseOptionalOrderTerms(obj.order, context)
    const limit = parseOptionalExpression(obj.limit, context)
    const offset = parseOptionalExpression(obj.offset, context)

    this.columns = columns
    this.source = source
    this.where = where
    this.groupBy = groupBy
    this.having = having
    this.orderBy = orderBy
    this.limit = limit
    this.offset = offset

    return this
  }

  clone(): XSelect {
    const clone = Object.assign(new XSelect(), this)

    clone.unions = this.unions.map((u) => u.clone())
    clone.columns = this.columns.map((c) => c.clone())
    clone.groupBy = this.groupBy.map((g) => g.clone())
    clone.orderBy = this.orderBy.map((o) => o.clone())

    clone.where = this.where?.clone()
    clone.having = this.having?.clone()
    clone.limit = this.limit?.clone()
    clone.offset = this.offset?.clone()

    return clone
  }

  build(pretty: boolean): Record<string, unknown> {
    const group = this.groupBy.length ? this.groupBy.map((e) => e.build(pretty)) : undefined
    const order = this.orderBy.length ? this.orderBy.map((t) => t.build(pretty)) : undefined
    const where = this.where?.build(pretty)
    const having = this.having?.build(pretty)
    const limit = this.limit?.build(pretty)
    const offset = this.offset?.build(pretty)

    const base = { where, group, having, order, limit, offset }

    if (this.unions.length) {
      return { union: this.unions.map((u) => u.build(pretty)), ...base }
    } else {
      const columns = this.columns.length ? this.columns.map((c) => c.build(pretty)) : undefined
      const from = this.source ? this.source.build(pretty) : undefined

      return { distinct: this.distinct, columns, from, ...base }
    }
  }
}
