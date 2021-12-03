import { XAction } from './action'

export default class XPauseAction extends XAction {
  tasks: number[] = []

  getAction() {
    return 'pause'
  }

  setTasks(...tasks: number[]) {
    this.tasks = [...tasks]
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      tasks: this.tasks
    }
  }
}
