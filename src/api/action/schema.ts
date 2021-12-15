import { XAction } from './action'

export class XSchemaAction extends XAction {
  getAction() {
    return 'schema'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {}
  }
}
