import { XDatabase } from '../../element'
import { isRecord, XRecord } from '../../record'
import { isNumber } from '../../util'
import { XAction } from './action'
import { toSpecifier } from '../api'
import { toOptionalExpression, XExpression, XExpressionable } from '../expression'
import { XOrderTerm } from '../order-term'

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

  buildFetch(pretty: boolean): Record<string, unknown> {
    return {
      database: toSpecifier(this.database, pretty),
      record: toSpecifier(this.record, pretty)
    }
  }
}

/*
;(function () {
  xo.api.action.fetch.creator = {
    posts: function (posts) {
      return new xo.api.action.fetch.Posts(posts)
    },
    groups: function (groups) {
      return new xo.api.action.fetch.Groups(groups)
    },
    users: function (users) {
      return new xo.api.action.fetch.Users(users)
    },
    tasks: function (tasks) {
      return new xo.api.action.fetch.Tasks(tasks)
    },
    threads: function () {
      return new xo.api.action.fetch.Threads()
    },
    notifications: function () {
      return new xo.api.action.fetch.Notifications()
    },
    requests: function () {
      return new xo.api.action.fetch.Requests()
    },
    subscriptions: function () {
      return new xo.api.action.fetch.Subscriptions()
    },
    keys: function (user) {
      return new xo.api.action.fetch.Keys(user)
    }
  }

  // ---- #xo.api.action.fetch.Posts ---------------------------------------------------------------------------------

  xo.api.action.fetch.Posts = class XOFetchPostsAction extends XOFetchAction {
    constructor(posts) {
      super()

      this.posts = posts || null
      this.wall = null
    }

    withFollowing() {
      this.following = true
      return this
    }

    withThreads() {
      this.threads = true
      return this
    }

    withChildren() {
      this.children = true
      return this
    }

    withText(text) {
      this.text = text
      return this
    }

    withThread(thread) {
      this.thread = thread
      return this
    }

    fromWall(wall) {
      this.wall = wall
      return this
    }

    fromDatabase(database) {
      return this.fromWall(new xo.api.wall.Database(database))
    }

    fromGroup(group) {
      return this.fromWall(new xo.api.wall.Group(group))
    }

    fromRecord(database, record) {
      return this.fromWall(new xo.api.wall.Record(database, record))
    }

    fromUser(user) {
      return this.fromWall(new xo.api.wall.User(user))
    }

    before(t) {
      this.t = Date.create(t).getTime()
      this.mode = 'before'
      return this
    }

    after(t) {
      this.t = Date.create(t).getTime()
      this.mode = 'after'
      return this
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'posts',
        wall: xo.api.util.build(this.wall),
        posts: xo.util.toSpecifier(this.posts),
        following: this.following,
        threads: this.threads,
        children: this.children,
        text: this.text,
        thread: this.thread,
        from: this.t,
        mode: this.mode
      })
    }
  }

  // ---- #xo.api.action.fetch.Users ---------------------------------------------------------------------------------

  xo.api.action.fetch.Users = class XOFetchUsersAction extends XOFetchAction {
    constructor(users) {
      super()

      this.users = users || null
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'users',
        users: xo.util.toSpecifier(this.users)
      })
    }
  }

  // ---- #xo.api.action.fetch.Tasks ---------------------------------------------------------------------------------

  xo.api.action.fetch.Tasks = class XOFetchTasksAction extends XOFetchAction {
    constructor(tasks) {
      super()

      this.tasks = tasks || null
    }

    withUser(user) {
      this.user = user
      return this
    }

    withFrom(from) {
      this.from = from
      return this
    }

    withAuto(auto) {
      this.auto = auto
      return this
    }

    withText(text) {
      this.text = text
      return this
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'tasks',
        user: this.user ? xo.util.toSpecifier(this.user) : null,
        from: this.from,
        auto: this.auto,
        text: this.text,
        tasks: this.tasks
      })
    }
  }

  // ---- #xo.api.action.fetch.Threads ---------------------------------------------------------------------------------

  xo.api.action.fetch.Threads = class XOFetchThreadsAction extends XOFetchAction {
    constructor() {
      super()
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'threads'
      })
    }
  }

  // ---- #xo.api.action.fetch.Notifications --------------------------------------------------------------------------

  xo.api.action.fetch.Notifications = class XOFetchNotificationsAction extends XOFetchAction {
    constructor() {
      super()
    }

    withType(type) {
      this.type = type
      return this
    }

    withSeen(seen) {
      this.seen = seen
      return this
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'notifications',
        type: this.type,
        seen: this.seen
      })
    }
  }

  // ---- #xo.api.action.fetch.Requests -------------------------------------------------------------------------------

  xo.api.action.fetch.Requests = class XOFetchRequestsAction extends XOFetchAction {
    constructor() {
      super()
    }

    withUser(user) {
      this.user = user
      return this
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'requests',
        user: this.user ? xo.util.toSpecifier(this.user) : null
      })
    }
  }

  // ---- #xo.api.action.fetch.Subscriptions --------------------------------------------------------------------------

  xo.api.action.fetch.Subscriptions = class XOFetchSubscriptionsAction extends XOFetchAction {
    constructor() {
      super()
    }

    withUser(user) {
      this.user = user
      return this
    }

    withTeam(team) {
      this.team = team
      return this
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'subscriptions',
        user: this.user ? xo.util.toSpecifier(this.user) : null,
        team: this.team ? xo.util.toSpecifier(this.team) : null
      })
    }
  }

  // ---- #xo.api.action.fetch.Keys --------------------------------------------------------------------------

  xo.api.action.fetch.Keys = class XOFetchKeysAction extends XOFetchAction {
    constructor(user) {
      super()

      this.user = user
    }

    build() {
      return Object.merge(this.buildCore(), {
        fetch: 'keys',
        user: xo.util.toSpecifier(this.user)
      })
    }
  }
})()
*/
