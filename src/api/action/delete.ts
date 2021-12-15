import { XRecordsActionBase } from './action'

export class XDeleteAction extends XRecordsActionBase {
  getAction() {
    return 'delete'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean): Record<string, unknown> {
    return {}
  }
}
