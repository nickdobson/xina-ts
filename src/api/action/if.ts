import { XSelect } from '../select'
import { XAction } from './action'

export class XIfAction extends XAction<void> {
  cases: { condition: XSelect; action: XAction<unknown> }[] = []

  els?: XAction<unknown>

  getAction() {
    return 'if'
  }

  addCase(condition: XSelect, action: XAction<unknown>) {
    this.cases.push({ condition, action })
  }

  setElse(action?: XAction<unknown>) {
    this.els = action
  }

  buildRest(pretty: boolean) {
    return {
      do: this.cases.map((c) => ({
        if: c.condition.build(pretty),
        then: c.action.build(pretty)
      })),
      else: this.els?.build(pretty)
    }
  }
}
