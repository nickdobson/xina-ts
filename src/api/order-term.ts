import {
  isSimpleObject,
  parseExpression,
  toExpression,
  XApiComponent,
  XApiContext,
  XExpression,
  XExpressionable,
  XOrderType
} from '../internal'

export function parseOrderTerm(t: unknown, ctx: XApiContext) {
  if (!isSimpleObject(t)) throw Error(`invalid order term: ${t}`)
  return new XOrderTerm().load(t, ctx)
}

export function parseOrderTerms(ts: unknown, ctx: XApiContext) {
  if (!(ts instanceof Array)) throw Error('order terms must be an array')
  return ts.map((c) => parseOrderTerm(c, ctx))
}

export function parseOptionalOrderTerm(t: unknown, ctx: XApiContext) {
  if (t == null) return undefined
  return parseOrderTerm(t, ctx)
}

export function parseOptionalOrderTerms(ts: unknown, ctx: XApiContext) {
  if (ts == null) return []
  return parseOrderTerms(ts, ctx)
}

export class XOrderTerm implements XApiComponent<XOrderTerm> {
  e?: XExpression

  order?: XOrderType

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  setOrder(order: XOrderType) {
    this.order = order
    return this
  }

  toString() {
    return `${this.e} ${this.order}`
  }

  isValid() {
    return !!(this.order && this.e?.isValid())
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.e = parseExpression(obj.e, context)
    this.order = XOrderType.parse(obj.order)
    return this
  }

  clone() {
    return Object.assign(new XOrderTerm(), this)
  }

  build(pretty: boolean): Record<string, unknown> {
    return {
      e: this.e?.build(pretty),
      order: this.order?.name
    }
  }

  static of(e: XExpressionable, order: XOrderType = XOrderType.ASC): XOrderTerm {
    return new XOrderTerm().setExpression(e).setOrder(order)
  }

  static ofAsc(e: XExpressionable): XOrderTerm {
    return XOrderTerm.of(e, XOrderType.ASC)
  }

  static ofDesc(e: XExpressionable): XOrderTerm {
    return XOrderTerm.of(e, XOrderType.DESC)
  }
}
