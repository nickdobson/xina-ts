import { checkOptionalString, isSimpleObject } from '../util'
import { XApiComponent, XApiContext } from './api'
import { XExpressionable, XExpression, toExpression, parseExpression } from './expression'

export type XResultColumnable = XResultColumn | XExpressionable

export function toResultColumn(c: XResultColumnable, alias?: string) {
  if (c instanceof XResultColumn) return c
  return XResultColumn.of(c, alias)
}

export function parseResultColumns(cs: unknown, ctx: XApiContext) {
  if (!(cs instanceof Array)) throw Error('columns must be an array')
  return cs.map((c) => parseResultColumn(c, ctx))
}

export function parseResultColumn(c: unknown, ctx: XApiContext) {
  if (!isSimpleObject(c)) throw Error(`invalid result column: ${c}`)
  return new XResultColumn().load(c, ctx)
}

export class XResultColumn implements XApiComponent<XResultColumn> {
  e?: XExpression
  alias?: string

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  setAlias(alias?: string) {
    this.alias = alias
    return this
  }

  toString() {
    let s = `${this.e?.toString()}`
    if (this.alias) s += ' AS `' + this.alias + '`'
    return s
  }

  isValid(): boolean {
    return !!this.e?.isValid()
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    const e = parseExpression(obj.e, context)
    const alias = checkOptionalString(obj.alias)

    this.e = e
    this.alias = alias

    return this
  }

  clone(): XResultColumn {
    const clone = Object.assign(new XResultColumn(), this)
    clone.e = this.e?.clone()
    return clone
  }

  build(pretty: boolean): Record<string, unknown> {
    return {
      e: this.e?.build(pretty),
      alias: this.alias
    }
  }

  static of(e: XExpressionable, alias?: string) {
    return new XResultColumn().setExpression(e).setAlias(alias)
  }
}
