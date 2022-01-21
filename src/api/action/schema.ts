import { XGroupInterfaceExt } from '../../element'
import { XAction } from './action'

export type XSchemaResponse = {
  groups: XGroupInterfaceExt[]
}

export class XSchemaAction extends XAction<XSchemaResponse> {
  getAction() {
    return 'schema'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {}
  }
}
