import { z } from 'zod'
import XVariant from '../variant'

const JOIN = 'join'
const LEFT = 'left'
const LEFT_OUTER = 'left_outer'
const INNER = 'inner'
const CROSS = 'cross'

export const XJoinOperatorName = z.enum([JOIN, LEFT, LEFT_OUTER, INNER, CROSS])

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type XJoinOperatorName = z.infer<typeof XJoinOperatorName>

const of = (name: XJoinOperatorName) => new XJoinOperator(name)

export class XJoinOperator extends XVariant<XJoinOperatorName> {
  constructor(name: XJoinOperatorName) {
    super(name, '', { label: name.toUpperCase() })

    XJoinOperator.map[name] = this
    XJoinOperator.values.push(this)
  }

  static parse(v: unknown) {
    return XJoinOperator.map[XJoinOperatorName.parse(v)]
  }

  static readonly map = {} as Record<XJoinOperatorName, XJoinOperator>

  static readonly values: XJoinOperator[] = []

  static readonly JOIN = of(JOIN)

  static readonly LEFT = of(LEFT)

  static readonly LEFT_OUTER = of(LEFT_OUTER)

  static readonly INNER = of(INNER)

  static readonly CROSS = of(CROSS)
}
