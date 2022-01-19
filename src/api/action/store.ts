import { XAction } from './action'

export class XStoreAction extends XAction {
  name?: string

  key?: string

  type?: string

  value?: unknown

  desc?: string

  getAction(): string {
    return 'store'
  }

  setName(name: string) {
    this.name = name
    return this
  }

  setKey(key: string) {
    this.key = key
    return this
  }

  setType(type: string) {
    this.type = type
    return this
  }

  setValue(value: unknown) {
    this.value = value
    return this
  }

  setDesc(desc: string) {
    this.desc = desc
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      name: this.name,
      key: this.key,
      type: this.type,
      value: this.value,
      desc: this.desc
    }
  }
}
