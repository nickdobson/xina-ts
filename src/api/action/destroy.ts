import { XAction } from './action'

export default class XDestroyAction extends XAction {
  tasks: number[] = []

  getAction() {
    return 'destroy'
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
