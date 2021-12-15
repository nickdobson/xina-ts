import { XAction } from './action'

export class XRunAction extends XAction {
  tasks: Record<string, unknown>[] = []

  getAction() {
    return 'run'
  }

  setTasks(...tasks: Record<string, unknown>[]) {
    this.tasks = [...tasks]
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean) {
    return {
      tasks: this.tasks
    }
  }
}
