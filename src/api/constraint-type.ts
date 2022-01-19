import { z } from 'zod'
import XVariant from '../variant'

const ON = 'on'
const USING = 'using'

export const XConstraintTypeName = z.enum([ON, USING])

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type XConstraintTypeName = z.infer<typeof XConstraintTypeName>

export class XConstraintType extends XVariant<XConstraintTypeName> {
  constructor(name: XConstraintTypeName) {
    super(name, '', { label: name.toUpperCase() })

    XConstraintType.map[name] = this
    XConstraintType.values.push(this)
  }

  static parse(v: unknown) {
    return XConstraintType.map[XConstraintTypeName.parse(v)]
  }

  static readonly map = {} as Record<XConstraintTypeName, XConstraintType>

  static readonly values: XConstraintType[] = []

  static readonly ON = new XConstraintType(ON)

  static readonly USING = new XConstraintType(USING)
}
