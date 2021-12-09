import { XField } from '../../element'
import { XRecordsActionBase } from './action'

export default class XUpdateAction extends XRecordsActionBase {
  values: Record<string, unknown> = {}

  getAction(): string {
    return 'update'
  }

  setField(field: XField, value: unknown) {
    this.values[field.getName()] = field.getType().parse(value)
    return this
  }

  setFile(objectId: string) {
    this.values.file = objectId
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean): Record<string, unknown> {
    return { set: this.values }
  }
}
