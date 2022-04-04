import { isArray, isString } from 'lodash'
import { firstBy } from 'thenby'

import {
  XAliasExpression,
  XAttribute,
  XDatabase,
  XField,
  XOrderTerm,
  XOrderType,
  XParameter,
  XRecordAttribute
} from '.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type XSortKey = string | XField | XAttribute<any, any> | XParameter<any, any>

export type XSortColumn = {
  key: XSortKey
  order: XOrderType
}

export class XSortOrder {
  columns: XSortColumn[] = []

  constructor(...columns: (XSortColumn | [XSortKey, string?])[]) {
    this.addColumns(...columns)
  }

  setColumns(...columns: (XSortColumn | [XSortKey, string?])[]) {
    this.columns = []
    return this.addColumns(...columns)
  }

  addColumns(...columns: (XSortColumn | [XSortKey, string?])[]) {
    columns.forEach((c) => {
      if (isArray(c)) {
        this.columns.push({
          key: c[0],
          order: c.length > 1 && c[1] === 'desc' ? XOrderType.DESC : XOrderType.ASC
        })
      } else {
        this.columns.push(c)
      }
    })

    return this
  }

  clone() {
    return new XSortOrder(...this.columns)
  }

  toOrderTerms() {
    return this.columns.map((c) => {
      if (isString(c.key)) return XOrderTerm.of(XAliasExpression.of(c.key), c.order)
      return XOrderTerm.of(c.key, c.order)
    })
  }

  toAliasOrderTerms() {
    return this.columns.map((c) => {
      if (isString(c.key)) return XOrderTerm.of(XAliasExpression.of(c.key), c.order)
      return XOrderTerm.of(XAliasExpression.of(c.key.name), c.order)
    })
  }

  sort<T extends Record<string, unknown>>(values: T[]) {
    if (!this.columns.length) return values

    if (this.columns.length === 0) return undefined

    const nameOf = (c: XSortColumn) => (isString(c.key) ? c.key : c.key.name)
    const orderOf = (c: XSortColumn) => (c.order === XOrderType.DESC ? -1 : undefined)

    let chain = firstBy(nameOf(this.columns[0]), orderOf(this.columns[0]))

    for (let i = 1; i < this.columns.length; i++) {
      chain = chain.thenBy(nameOf(this.columns[i]), orderOf(this.columns[i]))
    }

    return values.sort(chain as IThenBy<T>)
  }

  static forDatabase(database: XDatabase, context?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let order: any[]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (context && (database.objects?.xo_context as any)?.[context]?.order) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order = (database.objects?.xo_context as any)?.[context]?.order as any[]
    } else {
      order = database.order ?? [XRecordAttribute.RECORD_ID]
    }

    return new XSortOrder(...order)
  }
}
