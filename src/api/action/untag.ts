import { XRecordsActionBase } from './action'

export default class XUntagAction extends XRecordsActionBase {
  tags: string[] = []

  getAction(): string {
    return 'untag'
  }

  setTags(...tags: unknown[]) {
    this.tags = [...tags.map((t) => String(t))]
    return this
  }

  addTags(...tags: unknown[]) {
    this.tags.push(...tags.map((t) => String(t)))
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean): Record<string, unknown> {
    return { tags: this.tags }
  }
}
