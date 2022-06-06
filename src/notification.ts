import { toPost } from '.'
import { XDatabase, XElementSet, XGroup, XTeam, XUser } from './element'
import { XNotificationInterface, XRequestInterface } from './parameter'
import { XPost, XPostInterfaceExt } from './post'
import { XTaskInterfaceExt } from './task'

export interface XNotificationInterfaceExt extends XNotificationInterface {
  post?: XPostInterfaceExt
  request?: XRequestInterface
  task?: XTaskInterfaceExt
}

export interface XNotification extends XNotificationInterfaceExt {
  post?: XPost
  request?: XRequestInterface
  task?: XTaskInterfaceExt
}

export const toNotification = (
  notification: XNotificationInterfaceExt,
  teams: XElementSet<XTeam>,
  users: XElementSet<XUser>,
  groups: XElementSet<XGroup>,
  databases: XElementSet<XDatabase>
): XNotification => {
  return {
    ...notification,
    post: notification.post ? toPost(notification.post, teams, users, groups, databases) : undefined
  }
}
