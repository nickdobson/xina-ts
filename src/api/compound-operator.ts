import { z } from 'zod'
import XVariant from '../variant'

const AND = 'and'
const OR = 'or'

export const XCompoundOperatorName = z.enum([AND, OR])

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type XCompoundOperatorName = z.infer<typeof XCompoundOperatorName>

export class XCompoundOperator extends XVariant<XCompoundOperatorName> {
  constructor(name: XCompoundOperatorName) {
    super(name, '', { label: name.toUpperCase() })

    XCompoundOperator.map[name] = this
    XCompoundOperator.values.push(this)
  }

  static parse(v: unknown) {
    return XCompoundOperator.map[XCompoundOperatorName.parse(v)]
  }

  static readonly map = {} as Record<XCompoundOperatorName, XCompoundOperator>

  static readonly values: XCompoundOperator[] = []

  static readonly AND = new XCompoundOperator(AND)

  static readonly OR = new XCompoundOperator(OR)
}
