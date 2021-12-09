import { XUser } from '../../element'
import { toSpecifier } from '../api'
import { XAction } from './action'

abstract class XAlterAction extends XAction {
  getAction() {
    return 'alter'
  }

  abstract getAlter(): string
  abstract getOp(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>

  buildRest(pretty: boolean) {
    return {
      alter: this.getAlter(),
      op: this.getOp(),
      ...this.buildRestRest(pretty)
    }
  }
}

abstract class XAlterUserAction extends XAlterAction {
  user?: XUser | string | number

  getAlter() {
    return 'user'
  }
}

export class XAlterUserObjectsAction extends XAlterUserAction {
  objects?: Record<string, unknown>

  getOp() {
    return 'objects'
  }

  setObjects(objects: Record<string, unknown>) {
    this.objects = { ...objects }
  }

  buildRestRest(pretty: boolean) {
    return {
      user: toSpecifier(this.user, pretty),
      objects: this.objects
    }
  }
}
