import { XAction } from './action'

export class XMoveAction extends XAction {
  from?: Record<string, string>

  to?: Record<string, string>

  getAction() {
    return 'move'
  }

  setFrom(name: string, key: string, type: string) {
    this.from = { name, key, type }
    return this
  }

  setTo(name: string, key: string, type: string) {
    this.to = { name, key, type }
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      from: this.from,
      to: this.to
    }
  }
}
