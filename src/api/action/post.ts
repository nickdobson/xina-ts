import { XWall } from '../wall'
import { XAction } from './action'

export class XPostAction extends XAction<void> {
  wall?: XWall

  post?: Record<string, unknown>

  thread?: number

  setWall(wall: XWall) {
    this.wall = wall
    return this
  }

  setPost(post: Record<string, unknown>) {
    this.post = post
    return this
  }

  setThread(thread?: number) {
    this.thread = thread
    return this
  }

  getAction() {
    return 'post'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRest(_pretty: boolean): Record<string, unknown> {
    return {
      action: 'post',
      wall: this.wall?.build(),
      thread: this.thread,
      post: this.post
    }
  }
}
