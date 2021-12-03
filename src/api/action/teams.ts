import { XAction } from './action'

export default class XTeamsAction extends XAction {
  getAction() {
    return 'teams'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {}
  }
}
