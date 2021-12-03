import { z } from 'zod'
import XVariant from '../variant'

const NOT = 'not'
const NEGATE = '-'
const BIT_INVERT = '~'

export const XUnaryOperatorName = z.enum([NOT, NEGATE, BIT_INVERT])

export type XUnaryOperatorName = z.infer<typeof XUnaryOperatorName>

export class XUnaryOperator extends XVariant<XUnaryOperatorName> {
  constructor(name: XUnaryOperatorName) {
    super(name, '', { label: name.toUpperCase() })

    XUnaryOperator.map[name] = this
    XUnaryOperator.values.push(this)
  }

  static parse(v: unknown) {
    return XUnaryOperator.map[XUnaryOperatorName.parse(v)]
  }

  static readonly map = {} as Record<XUnaryOperatorName, XUnaryOperator>
  static readonly values: XUnaryOperator[] = []

  static readonly NOT = new XUnaryOperator(NOT)
  static readonly NEGATE = new XUnaryOperator(NEGATE)
  static readonly BIT_INVERT = new XUnaryOperator(BIT_INVERT)
}
