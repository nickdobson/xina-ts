import { XAction } from './action'

export class XResumeAction extends XAction {
  tasks: number[] = []
  cont = false

  getAction() {
    return 'resume'
  }

  setTasks(...tasks: number[]) {
    this.tasks = [...tasks]
    return this
  }

  setContinue(cont: boolean) {
    this.cont = cont
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      tasks: this.tasks,
      continue: this.cont
    }
  }
}
