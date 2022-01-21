import { XGroupInterfaceExt } from '../..'
import { XAction } from './action'

export class XSchemaAction extends XAction<XGroupInterfaceExt[]> {
  getAction() {
    return 'schema'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {}
  }
}
