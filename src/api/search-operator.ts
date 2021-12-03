/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'
import XVariant from '../variant'

const EQUAL = '='
const NOT_EQUAL = '!='

const LESS = '<'
const LESS_OR_EQUAL = '<='

const GREATER = '>'
const GREATER_OR_EQUAL = '>='

const CONTAINS = 'contains'
const NOT_CONTAINS = 'not_contains'

const STARTS_WITH = 'starts_with'
const NOT_STARTS_WITH = 'not_starts_with'

const ENDS_WITH = 'ends_with'
const NOT_ENDS_WITH = 'not_ends_with'

const IS_NULL = 'is_null'
const IS_NOT_NULL = 'is_not_null'

export const XSearchOperatorName = z.enum([
  EQUAL,
  NOT_EQUAL,
  LESS,
  LESS_OR_EQUAL,
  GREATER,
  GREATER_OR_EQUAL,
  CONTAINS,
  NOT_CONTAINS,
  STARTS_WITH,
  NOT_STARTS_WITH,
  ENDS_WITH,
  NOT_ENDS_WITH,
  IS_NULL,
  IS_NOT_NULL
])

export type XSearchOperatorName = z.infer<typeof XSearchOperatorName>

const contains = (a: any, b: any): boolean => ('' + a).toLowerCase().includes(('' + b).toLowerCase())
const startsWith = (a: any, b: any): boolean => ('' + a).toLowerCase().startsWith(('' + b).toLowerCase())
const endsWith = (a: any, b: any): boolean => ('' + a).toLowerCase().endsWith(('' + b).toLowerCase())

const of = (name: XSearchOperatorName, ev: (a: any, b?: any) => boolean) => new XSearchOperator(name, ev)

export class XSearchOperator extends XVariant<XSearchOperatorName> {
  readonly eval: (a: any, b?: any) => boolean

  constructor(name: XSearchOperatorName, ev: (a: any, b?: any) => boolean) {
    super(name, '')
    this.eval = ev

    XSearchOperator.map[name] = this
    XSearchOperator.values.push(this)
  }

  static parse(v: unknown) {
    return XSearchOperator.map[XSearchOperatorName.parse(v)]
  }

  static readonly map: Record<XSearchOperatorName, XSearchOperator> = {} as Record<XSearchOperatorName, XSearchOperator>
  static readonly values: XSearchOperator[] = []

  static readonly EQUAL = of(EQUAL, (a: any, b: any) => a === b)
  static readonly NOT_EQUAL = of(NOT_EQUAL, (a: any, b: any) => a !== b)

  static readonly GREATER = of(GREATER, (a: any, b: any) => a > b)
  static readonly GREATER_OR_EQUAL = of(GREATER_OR_EQUAL, (a: any, b: any) => a >= b)

  static readonly LESS = of(LESS, (a: any, b: any) => a < b)
  static readonly LESS_OR_EQUAL = of(LESS_OR_EQUAL, (a: any, b: any) => a <= b)

  static readonly CONTAINS = of(CONTAINS, contains)
  static readonly NOT_CONTAINS = of(NOT_CONTAINS, (a: any, b: any) => !contains(a, b))

  static readonly STARTS_WITH = of(STARTS_WITH, startsWith)
  static readonly NOT_STARTS_WITH = of(NOT_STARTS_WITH, (a: any, b: any) => !startsWith(a, b))

  static readonly ENDS_WITH = of(ENDS_WITH, endsWith)
  static readonly NOT_ENDS_WITH = of(NOT_ENDS_WITH, (a: any, b: any) => !endsWith(a, b))

  static readonly IS_NULL = of(IS_NULL, (a: any) => a == null)
  static readonly IS_NOT_NULL = of(IS_NOT_NULL, (a: any) => a != null)
}
