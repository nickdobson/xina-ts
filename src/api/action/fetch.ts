import Sugar from 'sugar'

import { XDatabase, XRecord, isRecord, isNumber, XGroup, XTeam, XUser } from '../..'
import { toSpecifier, toOptionalSpecifier } from '../api'
import { XExpression, XExpressionable, toOptionalExpression } from '../expression'
import { XOrderTerm } from '../order-term'
import { XWall, toWall } from '../wall'
import { XAction } from './action'

abstract class XFetchAction extends XAction {
  where?: XExpression

  orderBy: XOrderTerm[] = []

  limit?: XExpression

  offset?: XExpression

  abstract getFetch(): string
  abstract buildFetch(pretty: boolean): Record<string, unknown>

  getAction() {
    return 'fetch'
  }

  setLimit(limit?: XExpressionable) {
    this.limit = toOptionalExpression(limit)
    return this
  }

  setOffset(offset?: XExpressionable) {
    this.offset = toOptionalExpression(offset)
    return this
  }

  buildRest(pretty: boolean) {
    const order = this.orderBy.length ? this.orderBy.map((t) => t.build(pretty)) : undefined
    const where = this.where?.build(pretty)
    const limit = this.limit?.build(pretty)
    const offset = this.offset?.build(pretty)

    return { fetch: this.getFetch(), order, where, limit, offset, ...this.buildFetch(pretty) }
  }
}

export class XFetchRecordsAction extends XFetchAction {
  database?: XDatabase | string | number

  records: Array<XRecord | Record<string, unknown> | number> = []

  getFetch() {
    return 'records'
  }

  setDatabase(database: XDatabase) {
    this.database = database
    return this
  }

  setRecords(...records: Array<XRecord | Record<string, unknown> | number>) {
    this.records = []
    return this.addRecords(...records)
  }

  addRecords(...records: Array<XRecord | Record<string, unknown> | number>) {
    this.records.push(...records)
    return this
  }

  buildFetch(pretty: boolean): Record<string, unknown> {
    const records = this.records.length
      ? this.records.map((r) => {
          if (isRecord(r)) return r.$id
          if (isNumber(r)) return r
          return { type: 'key', key: r }
        })
      : { type: 'all' }

    return {
      database: toSpecifier(this.database, pretty),
      records
    }
  }
}

export class XFetchLogsAction extends XFetchAction {
  database?: XDatabase | string | number

  record?: XRecord | number

  getFetch() {
    return 'logs'
  }

  setDatabase(database: XDatabase | string | number) {
    this.database = database
    return this
  }

  setRecord(record: XRecord | number) {
    this.record = record
    return this
  }

  buildFetch(pretty: boolean) {
    return {
      database: toSpecifier(this.database, pretty),
      record: toSpecifier(this.record, pretty)
    }
  }
}

export class XFetchPostsAction extends XFetchAction {
  wall?: XWall

  following?: boolean

  threads?: boolean

  children?: boolean

  text?: string

  post?: number

  thread?: number

  from?: number

  mode?: string

  getFetch() {
    return 'posts'
  }

  setFollowing(following = true) {
    this.following = following
    return this
  }

  setThreads(threads = true) {
    this.threads = threads
    return this
  }

  setChildren(children = true) {
    this.children = children
    return this
  }

  setText(text: string) {
    this.text = text
    return this
  }

  setThread(thread: number) {
    this.thread = thread
    return this
  }

  setWall(wall: XWall | XDatabase | XRecord | XGroup | XTeam) {
    this.wall = toWall(wall)
    return this
  }

  setBefore(t: Date | string | number) {
    this.from = Sugar.Date.create(t).getTime()
    this.mode = 'before'
    return this
  }

  setAfter(t: Date | string | number) {
    this.from = Sugar.Date.create(t).getTime()
    this.mode = 'after'
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildFetch(_pretty: boolean) {
    return {
      wall: this.wall?.build(),
      post: this.post,
      following: this.following,
      threads: this.threads,
      children: this.children,
      text: this.text,
      thread: this.thread,
      from: this.from,
      mode: this.mode
    }
  }
}

export class XFetchTasksAction extends XFetchAction {
  user?: XUser | string | number

  tasks: number[] = []

  from?: number

  auto?: boolean

  text?: string

  getFetch() {
    return 'tasks'
  }

  setUser(user: XUser | string | number) {
    this.user = user
    return this
  }

  setTasks(...tasks: number[]) {
    this.tasks = [...tasks]
    return this
  }

  addTasks(...tasks: number[]) {
    this.tasks.push(...tasks)
    return this
  }

  setFrom(from: Date | string | number) {
    this.from = Sugar.Date.create(from).getTime()
    return this
  }

  setAuto(auto = true) {
    this.auto = auto
    return this
  }

  setText(text: string) {
    this.text = text
    return this
  }

  buildFetch(pretty: boolean): Record<string, unknown> {
    return {
      user: toOptionalSpecifier(this.user, pretty),
      from: this.from,
      auto: this.auto,
      text: this.text,
      tasks: this.tasks.length ? this.tasks : undefined
    }
  }
}

export class XFetchUsersAction extends XFetchAction {
  users: (XUser | string | number)[] = []

  getFetch() {
    return 'users'
  }

  setUsers(...users: (XUser | string | number)[]) {
    this.users = [...users]
    return this
  }

  addUsers(...users: (XUser | string | number)[]) {
    this.users.push(...users)
    return this
  }

  buildFetch(pretty: boolean) {
    return {
      users: this.users.length ? this.users.map((u) => toSpecifier(u, pretty)) : undefined
    }
  }
}

export class XFetchThreadsAction extends XFetchAction {
  getFetch() {
    return 'threads'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildFetch(_pretty: boolean) {
    return {}
  }
}

export class XFetchNotificationsAction extends XFetchAction {
  type?: string | number

  seen?: boolean

  getFetch() {
    return 'notifications'
  }

  setType(type: string | number) {
    this.type = type
    return this
  }

  setSeen(seen = true) {
    this.seen = seen
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildFetch(_pretty: boolean) {
    return { type: this.type, seen: this.seen }
  }
}

export class XFetchRequestsAction extends XFetchAction {
  user?: XUser | string | number

  getFetch() {
    return 'requests'
  }

  setUser(user: XUser | string | number) {
    this.user = user
    return this
  }

  buildFetch(pretty: boolean) {
    return {
      user: toOptionalSpecifier(this.user, pretty)
    }
  }
}

export class XFetchSubscriptionsAction extends XFetchAction {
  user?: XUser | string | number

  team?: XTeam | string | number

  getFetch() {
    return 'requests'
  }

  setUser(user: XUser | string | number) {
    this.user = user
    return this
  }

  setTeam(team: XTeam | string | number) {
    this.team = team
    return this
  }

  buildFetch(pretty: boolean) {
    return {
      user: toOptionalSpecifier(this.user, pretty),
      team: toOptionalSpecifier(this.team, pretty)
    }
  }
}
export class XFetchKeysAction extends XFetchAction {
  user?: XUser | string | number

  getFetch() {
    return 'keys'
  }

  setUser(user: XUser | string | number) {
    this.user = user
    return this
  }

  buildFetch(pretty: boolean) {
    return {
      user: toSpecifier(this.user, pretty)
    }
  }
}
