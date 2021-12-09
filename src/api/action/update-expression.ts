import { XField } from '../../element'
import { toExpression, XExpression, XExpressionable } from '../expression'
import { XRecordsActionBase } from './action'

export default class XUpdateExpressionAction extends XRecordsActionBase {
  values: Record<string, XExpression> = {}

  getAction(): string {
    return 'update_expression'
  }

  setField(field: XField, value: XExpressionable) {
    this.values[field.getName()] = toExpression(value)
    return this
  }

  buildRestRest(pretty: boolean): Record<string, unknown> {
    const built: Record<string, unknown> = {}

    for (const [key, val] of Object.entries(this.values)) {
      built[key] = val.build(pretty)
    }

    return { set: this.values }
  }
}
