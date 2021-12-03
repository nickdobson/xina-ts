import { z } from 'zod'
import XVariant from '../variant'

const TABLE_SYSTEM = 'table_system'
const TS = 'ts'
const TABLE_DATABASE = 'table_database'
const TD = 'td'
const JOIN = 'join'
const SELECT = 'select'

export const XSourceTypeName = z.enum([TABLE_SYSTEM, TS, TABLE_DATABASE, TD, JOIN, SELECT])

export type XSourceTypeName = z.infer<typeof XSourceTypeName>

const of = (name: XSourceTypeName, aliases?: XSourceTypeName[]) => new XSourceType(name, aliases)

export class XSourceType extends XVariant<XSourceTypeName> {
  constructor(name: XSourceTypeName, aliases?: XSourceTypeName[]) {
    super(name, '', { aliases })

    XSourceType.map[name] = this
    this.aliases?.forEach((alias) => (XSourceType.map[alias] = this))
    XSourceType.values.push(this)
  }

  static parse(v: unknown) {
    return XSourceType.map[XSourceTypeName.parse(v)]
  }

  static readonly map = {} as Record<XSourceTypeName, XSourceType>
  static readonly values: XSourceType[] = []

  static readonly TABLE_SYSTEM = of(TS, [TABLE_SYSTEM])
  static readonly TABLE_DATABASE = of(TD, [TABLE_DATABASE])
  static readonly JOIN = of(JOIN)
  static readonly SELECT = of(SELECT)
}
