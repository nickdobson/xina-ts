import { z } from 'zod'
import XVariant from '../variant'

const AND = 'and'
const OR = 'or'

const EQUAL = '='
const NOT_EQUAL = '!='

const LESS = '<'
const LESS_OR_EQUAL = '<='

const GREATER = '>'
const GREATER_OR_EQUAL = '>='

const IS = 'is'
const LIKE = 'like'
const REGEXP = 'regexp'

const PLUS = '+'
const MINUS = '-'
const MULTIPLY = '*'
const DIVIDE = '/'
const MOD = '%'

const BIT_AND = '&'
const BIT_OR = '|'
const SHIFT_LEFT = '<<'
const SHIFT_RIGHT = '>>'

export const XBinaryOperatorName = z.enum([
  AND,
  OR,
  EQUAL,
  NOT_EQUAL,
  LESS,
  LESS_OR_EQUAL,
  GREATER,
  GREATER_OR_EQUAL,
  IS,
  LIKE,
  REGEXP,
  PLUS,
  MINUS,
  MULTIPLY,
  DIVIDE,
  MOD,
  BIT_AND,
  BIT_OR,
  SHIFT_LEFT,
  SHIFT_RIGHT
])

export type XBinaryOperatorName = z.infer<typeof XBinaryOperatorName>

const of = (name: XBinaryOperatorName) => new XBinaryOperator(name)

export class XBinaryOperator extends XVariant<XBinaryOperatorName> {
  constructor(name: XBinaryOperatorName) {
    super(name, '', { label: name.toUpperCase() })

    XBinaryOperator.map[name] = this
    XBinaryOperator.values.push(this)
  }

  static parse(v: unknown) {
    return XBinaryOperator.map[XBinaryOperatorName.parse(v)]
  }

  static readonly map = {} as Record<XBinaryOperatorName, XBinaryOperator>
  static readonly values: XBinaryOperator[] = []

  static readonly AND = of(AND)
  static readonly OR = of(OR)

  static readonly EQUAL = of(EQUAL)
  static readonly NOT_EQUAL = of(NOT_EQUAL)

  static readonly GREATER = of(GREATER)
  static readonly GREATER_OR_EQUAL = of(GREATER_OR_EQUAL)

  static readonly LESS = of(LESS)
  static readonly LESS_OR_EQUAL = of(LESS_OR_EQUAL)

  static readonly IS = of(IS)
  static readonly LIKE = of(LIKE)
  static readonly REGEXP = of(REGEXP)

  static readonly PLUS = of(PLUS)
  static readonly MINUS = of(MINUS)
  static readonly MULTIPLY = of(MULTIPLY)
  static readonly DIVIDE = of(DIVIDE)
  static readonly MOD = of(MOD)

  static readonly BIT_AND = of(BIT_AND)
  static readonly BIT_OR = of(BIT_OR)

  static readonly SHIFT_LEFT = of(SHIFT_LEFT)
  static readonly SHIFT_RIGHT = of(SHIFT_RIGHT)
}
