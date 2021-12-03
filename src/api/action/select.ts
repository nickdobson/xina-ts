import { XSelect } from '../select'
import { XAction } from './action'

export default class XSelectAction extends XAction {
  select?: XSelect
  useStrings = false

  getAction() {
    return 'select'
  }

  setSelect(select: XSelect) {
    this.select = select
    return this
  }

  setUseStrings(useStrings: boolean) {
    this.useStrings = useStrings
    return this
  }

  buildRest(pretty: boolean) {
    return {
      select: this.select?.build(pretty),
      use_strings: this.useStrings
    }
  }
}
