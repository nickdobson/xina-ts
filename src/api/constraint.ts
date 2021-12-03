import { isSimpleObject } from '../util'
import { XApiComponent, XApiContext } from './api'
import { XConstraintType, XConstraintTypeName } from './constraint-type'
import { XExpressionable, XExpression, toExpression, parseExpression } from './expression'

export type XConstraintable = XConstraint | XExpressionable | string[]

export function parseConstraint(c: unknown, context: XApiContext) {
  if (!isSimpleObject(c)) throw Error(`invalid constraint: ${c}`)
  return new map[XConstraintTypeName.parse(c.type)]().load(c, context)
}

export abstract class XConstraint implements XApiComponent<XConstraint> {
  abstract getName(): string
  abstract getType(): XConstraintType
  abstract toString(): string
  abstract isValid(): boolean
  abstract load(obj: Record<string, unknown>, context: XApiContext): this
  abstract clone(): XConstraint
  abstract buildRest(pretty: boolean): Record<string, unknown>

  build(pretty: boolean): Record<string, unknown> {
    return { type: this.getType(), ...this.buildRest(pretty) }
  }
}

export class XOnConstraint extends XConstraint {
  e?: XExpression

  getName() {
    return 'On Constraint'
  }

  getType(): XConstraintType {
    return XConstraintType.ON
  }

  setExpression(e: XExpressionable) {
    this.e = toExpression(e)
    return this
  }

  toString() {
    return `ON (${this.e})`
  }

  isValid() {
    return !!this.e?.isValid()
  }

  load(obj: Record<string, unknown>, context: XApiContext) {
    this.e = parseExpression(obj.e, context)
    return this
  }

  clone() {
    const clone = Object.assign(new XOnConstraint(), this)
    if (this.e) clone.setExpression(this.e.clone())
    return clone
  }

  buildRest(pretty: boolean) {
    return {
      e: this.e?.build(pretty)
    }
  }

  static of(e: XExpressionable) {
    return new XOnConstraint().setExpression(e)
  }
}

export class XUsingConstraint extends XConstraint {
  columns?: string[]

  getName() {
    return 'Using Constraint'
  }

  getType(): XConstraintType {
    return XConstraintType.USING
  }

  setColumns(columns: string[]) {
    this.columns = columns
    return this
  }

  toString() {
    return `USING (${this.columns})`
  }

  isValid() {
    return !!this.columns && !!this.columns.length
  }

  load(json: Record<string, unknown>) {
    if (json.columns instanceof Array) this.columns = json.columns
    return this
  }

  clone() {
    const clone = Object.assign(new XUsingConstraint(), this)
    if (this.columns) clone.setColumns([...this.columns])
    return clone
  }

  buildRest() {
    return {
      columns: this.columns
    }
  }

  static of(columns: string[]) {
    return new XUsingConstraint().setColumns(columns)
  }
}

const map: Record<XConstraintTypeName, new () => XConstraint> = {
  [XConstraintTypeName.enum.on]: XOnConstraint,
  [XConstraintTypeName.enum.using]: XUsingConstraint
} as const
