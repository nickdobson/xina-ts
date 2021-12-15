import { XAction } from './action'

export class XEditAction extends XAction {
  post?: number
  text?: string
  active?: boolean

  getAction(): string {
    return 'edit'
  }

  setPost(post: number) {
    this.post = post
    return this
  }

  setText(text: string) {
    this.text = text
    return this
  }

  setActive(active: boolean) {
    this.active = active
    return this
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      post: this.post,
      text: this.text,
      active: this.active
    }
  }
}
