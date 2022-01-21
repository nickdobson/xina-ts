import { XTaskInterface } from '../../parameter'
import { isNumber } from '../../util'
import { XAction } from './action'

export class XDestroyAction extends XAction<void> {
  tasks: number[] = []

  getAction() {
    return 'destroy'
  }

  setTasks(...tasks: (XTaskInterface | number)[]) {
    this.tasks = [...tasks.map((t) => (isNumber(t) ? t : t.task_id))]
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      tasks: this.tasks
    }
  }
}
