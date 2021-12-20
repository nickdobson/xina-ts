import { XAction } from './action'

export type XVersionResponse = {
  server: string
  host: string
  schema: number
  team: number
}

export class XVersionAction extends XAction {
  getAction() {
    return 'version'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {}
  }
}
