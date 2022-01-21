import { XTeamInterfaceExt } from '../../element'
import { XAction } from './action'

export class XTeamsAction extends XAction<XTeamInterfaceExt[]> {
  getAction() {
    return 'teams'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {}
  }
}
