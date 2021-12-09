import { XAlterUserObjectsAction } from './action/alter'
import XCancelAction from './action/cancel'
import XCleanAction from './action/clean'
import XDeleteAction from './action/delete'
import XDestroyAction from './action/destroy'
import XEditAction from './action/edit'
import { XFetchLogsAction, XFetchRecordsAction } from './action/fetch'
import { XGrantDatabasesAction, XGrantSuperAction } from './action/grant'
import XIfAction from './action/if'
import XInsertAction from './action/insert'
import XLinkAction from './action/link'
import { toExpression, XAliasExpression, XExpressionable } from './expression'
import { XOrderTerm } from './order-term'
import { toSource } from './source'

export const xapi = {
  expr: toExpression,
  alias: (alias: string) => XAliasExpression.of(alias),
  src: toSource,
  asc: (e: XExpressionable) => XOrderTerm.ofAsc(e),
  desc: (e: XExpressionable) => XOrderTerm.ofDesc(e),
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
    logs: () => new XFetchLogsAction()
  } as const,
  grant: {
    super: () => new XGrantSuperAction(),
    groups: () => new XGrantSuperAction(),
    databases: () => new XGrantDatabasesAction()
  } as const,
  if: () => new XIfAction(),
  insert: () => new XInsertAction(),
  join: {} as const,
  leave: {} as const,
  link: () => new XLinkAction()
} as const
