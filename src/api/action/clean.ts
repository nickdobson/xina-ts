import { isNumber } from 'lodash'
import { XTaskInterface } from '../../parameter'
import { XAction } from './action'

export class XCleanAction extends XAction<void> {
  tasks: number[] = []

  ignore = false

  getAction() {
    return 'clean'
  }

  setTasks(...tasks: (XTaskInterface | number)[]) {
    this.tasks = [...tasks.map((t) => (isNumber(t) ? t : t.task_id))]
    return this
  }

  setIgnore(ignore = false) {
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
