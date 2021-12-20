import { XAlterUserObjectsAction } from './action/alter'
import { XCancelAction } from './action/cancel'
import { XCleanAction } from './action/clean'
import { XDeleteAction } from './action/delete'
import { XDestroyAction } from './action/destroy'
import { XEditAction } from './action/edit'
import {
  XFetchRecordsAction,
  XFetchLogsAction,
  XFetchTasksAction,
  XFetchRequestsAction,
  XFetchNotificationsAction,
  XFetchSubscriptionsAction,
  XFetchKeysAction,
  XFetchUsersAction,
  XFetchThreadsAction
} from './action/fetch'
import { XGrantSuperAction, XGrantGroupsAction, XGrantDatabasesAction } from './action/grant'
import { XIfAction } from './action/if'
import { XInsertAction } from './action/insert'
import { XJoinDatabasesAction, XJoinGroupsAction, XJoinUsersAction } from './action/join'
import { XLeaveDatabasesAction, XLeaveGroupsAction, XLeaveUsersAction } from './action/leave'
import { XLinkAction } from './action/link'
import { XMoveAction } from './action/move'
import { XPauseAction } from './action/pause'
import { XPostAction } from './action/post'
import { XResumeAction } from './action/resume'
import { XRevokeSuperAction, XRevokeGroupsAction, XRevokeDatabasesAction } from './action/revoke'
import { XRunAction } from './action/run'
import { XSelectAction } from './action/select'
import { XStoreAction } from './action/store'
import { XTagAction } from './action/tag'
import { XTeamsAction } from './action/teams'
import { XTrashAction } from './action/trash'
import { XUnlinkAction } from './action/unlink'
import { XUntagAction } from './action/untag'
import { XUpdateAction } from './action/update'
import { XUpdateExpressionAction } from './action/update-expression'
import { XVersionAction } from './action/version'
import { XViewNotificationsAction, XViewTasksAction } from './action/view'
import { toExpression, XAliasExpression, XExpressionable } from './expression'
import { XOrderTerm } from './order-term'
import { XSelect } from './select'
import { toSource } from './source'

export const xapi = {
  expr: toExpression,
  alias: (alias: string) => XAliasExpression.of(alias),
  src: toSource,
  asc: (e: XExpressionable) => XOrderTerm.ofAsc(e),
  desc: (e: XExpressionable) => XOrderTerm.ofDesc(e),
  select: () => new XSelect(),
  act: {
    alter: {
      users: {
        objects: () => new XAlterUserObjectsAction()
      } as const
    } as const,
    cancel: () => new XCancelAction(),
    clean: () => new XCleanAction(),
    create: {} as const,
    delete: () => new XDeleteAction(),
    destroy: () => new XDestroyAction(),
    edit: () => new XEditAction(),
    fetch: {
      keys: () => new XFetchKeysAction(),
      logs: () => new XFetchLogsAction(),
      notifications: () => new XFetchNotificationsAction(),
      records: () => new XFetchRecordsAction(),
      requests: () => new XFetchRequestsAction(),
      subscriptions: () => new XFetchSubscriptionsAction(),
      tasks: () => new XFetchTasksAction(),
      threads: () => new XFetchThreadsAction(),
      users: () => new XFetchUsersAction()
    } as const,
    grant: {
      super: () => new XGrantSuperAction(),
      groups: () => new XGrantGroupsAction(),
      databases: () => new XGrantDatabasesAction()
    } as const,
    if: () => new XIfAction(),
    insert: () => new XInsertAction(),
    join: {
      databases: () => new XJoinDatabasesAction(),
      groups: () => new XJoinGroupsAction(),
      users: () => new XJoinUsersAction()
    } as const,
    leave: {
      databases: () => new XLeaveDatabasesAction(),
      groups: () => new XLeaveGroupsAction(),
      users: () => new XLeaveUsersAction()
    } as const,
    link: () => new XLinkAction(),
    move: () => new XMoveAction(),
    pause: () => new XPauseAction(),
    post: () => new XPostAction(),
    resume: () => new XResumeAction(),
    revoke: {
      super: () => new XRevokeSuperAction(),
      groups: () => new XRevokeGroupsAction(),
      databases: () => new XRevokeDatabasesAction()
    } as const,
    run: () => new XRunAction(),
    select: () => new XSelectAction(),
    store: () => new XStoreAction(),
    tag: () => new XTagAction(),
    teams: () => new XTeamsAction(),
    trash: () => new XTrashAction(),
    unlink: () => new XUnlinkAction(),
    untag: () => new XUntagAction(),
    update: () => new XUpdateAction(),
    updateExpression: () => new XUpdateExpressionAction(),
    version: () => new XVersionAction(),
    view: {
      notifications: () => new XViewNotificationsAction(),
      tasks: () => new XViewTasksAction()
    } as const
  } as const
} as const
