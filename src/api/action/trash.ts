import { XRecordsActionBase } from './action'
export class XTrashAction extends XRecordsActionBase {
  getAction() {
    return 'trash'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean): Record<string, unknown> {
    return {}
  }
}
