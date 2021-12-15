import {
  toExpression,
  XAliasExpression,
  toSource,
  XExpressionable,
  XOrderTerm,
  XSelect,
  XAlterUserObjectsAction,
  XCancelAction,
  XCleanAction,
  XDeleteAction,
  XDestroyAction,
  XEditAction,
  XFetchRecordsAction,
  XFetchLogsAction,
  XGrantSuperAction,
  XGrantDatabasesAction,
  XIfAction,
  XInsertAction,
  XLinkAction,
  XGrantGroupsAction,
  XMoveAction,
  XPauseAction,
  XPostAction,
  XResumeAction,
  XRevokeGroupsAction,
  XRevokeSuperAction,
  XRevokeDatabasesAction,
  XRunAction,
  XSelectAction,
  XStoreAction,
  XTagAction,
  XTeamsAction,
  XTrashAction,
  XUnlinkAction,
  XUntagAction,
  XUpdateAction,
  XUpdateExpressionAction,
  XVersionAction,
  XViewTasksAction,
  XViewNotificationsAction,
  XJoinGroupsAction,
  XJoinDatabasesAction,
  XJoinUsersAction,
  XLeaveDatabasesAction,
  XLeaveGroupsAction,
  XLeaveUsersAction,
  XFetchKeysAction,
  XFetchNotificationsAction,
  XFetchRequestsAction,
  XFetchSubscriptionsAction,
  XFetchTasksAction
} from '..'

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
      records: () => new XFetchRecordsAction(),
      logs: () => new XFetchLogsAction(),
      tasks: () => new XFetchTasksAction(),
      requests: () => new XFetchRequestsAction(),
      notifications: () => new XFetchNotificationsAction(),
      subscriptions: () => new XFetchSubscriptionsAction(),
      keys: () => new XFetchKeysAction()
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
