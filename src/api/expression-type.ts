import { z } from 'zod'
import XVariant from '../variant'

const ALIAS = 'alias'
const BETWEEN = 'between'
const BINARY = 'binary'
const CASE = 'case'
const COLLATE = 'collate'
const COLUMN = 'column'
const COL = 'col'
const COMPOUND = 'compound'
const COUNT_ROWS = 'count_rows'
const DATETIME = 'datetime'
const DATE_TIME = 'date_time'
const DT = 'dt'
const EXISTS = 'exists'
const FUNCTION = 'function'
const GROUP_CONCAT = 'group_concat'
const IN = 'in'
const IN_SELECT = 'in_select'
const IS_NULL = 'is_null'
const LOCALDATETIME = 'localdatetime'
const LDT = 'ldt'
// const LOCALDATE = 'localdate'
// const LD = 'ld'
// const LOCALTIME = 'localtime'
// const LT = 'lt'
const NULL = 'null'
const NUMBER = 'number'
const SELECT = 'select'
const SEARCH = 'search'
const STRING = 'string'
const UNARY = 'unary'

export const XExpressionTypeName = z.enum([
  ALIAS,
  BETWEEN,
  BINARY,
  CASE,
  COLLATE,
  COLUMN,
  COL,
  COMPOUND,
  COUNT_ROWS,
  DATETIME,
  DATE_TIME,
  DT,
  EXISTS,
  FUNCTION,
  GROUP_CONCAT,
  IN,
  IN_SELECT,
  IS_NULL,
  LOCALDATETIME,
  LDT,
  // LOCALDATE,
  // LD,
  // LOCALTIME,
  // LT,
  NULL,
  NUMBER,
  SELECT,
  SEARCH,
  STRING,
  UNARY
])

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type XExpressionTypeName = z.infer<typeof XExpressionTypeName>

const of = (name: XExpressionTypeName, aliases?: XExpressionTypeName[]) => new XExpressionType(name, aliases)

export class XExpressionType extends XVariant<XExpressionTypeName> {
  constructor(name: XExpressionTypeName, aliases?: XExpressionTypeName[]) {
    super(name, '', { aliases })

    XExpressionType.map[name] = this
    this.aliases?.forEach((alias) => (XExpressionType.map[alias] = this))
    XExpressionType.values.push(this)
  }

  static parse(v: unknown) {
    return XExpressionType.map[XExpressionTypeName.parse(v)]
  }

  static readonly map = {} as Record<XExpressionTypeName, XExpressionType>

  static readonly values: XExpressionType[] = []

  static readonly ALIAS = of(ALIAS)

  static readonly BETWEEN = of(BETWEEN)

  static readonly BINARY = of(BINARY)

  static readonly CASE = of(CASE)

  static readonly COLLATE = of(COLLATE)

  static readonly COLUMN = of(COL, [COLUMN])

  static readonly COMPOUND = of(COMPOUND)

  static readonly COUNT_ROWS = of(COUNT_ROWS)

  static readonly DATETIME = of(DT, [DATETIME, DATE_TIME])

  static readonly EXISTS = of(EXISTS)

  static readonly FUNCTION = of(FUNCTION)

  static readonly GROUP_CONCAT = of(GROUP_CONCAT)

  static readonly IN = of(IN)

  static readonly IN_SELECT = of(IN_SELECT)

  static readonly IS_NULL = of(IS_NULL)

  static readonly LOCALDATETIME = of(LDT, [LOCALDATETIME])

  // static readonly LOCALDATE = of(LD, [LOCALDATE])
  // static readonly LOCALTIME = of(LT, [LOCALTIME])
  static readonly NULL = of(NULL)

  static readonly NUMBER = of(NUMBER)

  static readonly SEARCH = of(SEARCH)

  static readonly SELECT = of(SELECT)

  static readonly STRING = of(STRING)

  static readonly UNARY = of(UNARY)
}
