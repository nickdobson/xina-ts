import { XAction } from './action'

export class XResumeAction extends XAction {
  threads: string[] = []
  cont = false

  getAction() {
    return 'resume'
  }

  setThreads(...threads: string[]) {
    this.threads = [...threads]
    return this
  }

  setContinue(cont = false) {
    this.cont = cont
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      threads: this.threads,
      continue: this.cont
    }
  }
}
