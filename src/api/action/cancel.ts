import { XAction } from './action'

export default class XCancelAction extends XAction {
  tasks: number[] = []
  ignore = false

  getAction() {
    return 'cancel'
  }

  setTasks(...tasks: number[]) {
    this.tasks = [...tasks]
    return this
  }

  setIgnore(ignore: boolean) {
    this.ignore = ignore
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      tasks: this.tasks,
      ignore: this.ignore
    }
  }
}