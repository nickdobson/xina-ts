import { XAction } from './action'

export class XPauseAction extends XAction {
  threads: string[] = []

  getAction() {
    return 'pause'
  }

  setThreads(...threads: string[]) {
    this.threads = [...threads]
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      threads: this.threads
    }
  }
}
