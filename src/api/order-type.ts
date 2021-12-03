import { z } from 'zod'
import XVariant from '../variant'

const ASC = 'asc'
const DESC = 'desc'

export const XOrderTypeName = z.enum([ASC, DESC])

export type XOrderTypeName = z.infer<typeof XOrderTypeName>

export class XOrderType extends XVariant<XOrderTypeName> {
  constructor(name: XOrderTypeName) {
    super(name, '', { label: name.toUpperCase() })

    XOrderType.map[name] = this
    XOrderType.values.push(this)
  }

  static parse(v: unknown) {
    return XOrderType.map[XOrderTypeName.parse(v)]
  }

  static readonly map = {} as Record<XOrderTypeName, XOrderType>
  static readonly values: XOrderType[] = []

  static readonly ASC = new XOrderType(ASC)
  static readonly DESC = new XOrderType(DESC)
}
