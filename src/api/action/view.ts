import { XAction } from './action'

abstract class XViewAction extends XAction {
  getAction() {
    return 'view'
  }

  buildRest(pretty: boolean) {
    return { view: this.getView(), ...this.buildRestRest(pretty) }
  }

  abstract getView(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>
}

export class XViewTasksAction extends XViewAction {
  tasks: number[] = []

  setTasks(...tasks: number[]) {
    this.tasks = [...tasks]
    return this
  }

  getView() {
    return 'tasks'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean): Record<string, unknown> {
    return { tasks: this.tasks }
  }
}

export class XViewNotificationsAction extends XViewAction {
  notifications: string[] = []

  setNotifications(...notifications: string[]) {
    this.notifications = [...notifications]
    return this
  }

  getView() {
    return 'notifications'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean): Record<string, unknown> {
    return { notifications: this.notifications }
  }
}