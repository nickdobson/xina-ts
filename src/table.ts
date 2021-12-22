import { z } from 'zod'

import {
  XBlobFileParameterManager,
  XBlobObjectParameterManager,
  XBlobParameterManager,
  XDatabaseFileParameterManager,
  XDatabaseObjectParameterManager,
  XDatabaseParameterManager,
  XFieldFileParameterManager,
  XFieldObjectParameterManager,
  XFieldParameterManager,
  XGroupFileParameterManager,
  XGroupObjectParameterManager,
  XGroupParameterManager,
  XLogEditParameterManager,
  XLogParameterManager,
  XNotificationParameterManager,
  XParameterManager,
  XPostParameterManager,
  XPrivDatabaseParameterManager,
  XPrivGroupParameterManager,
  XRecordLinkParameterManager,
  XRequestParameterManager,
  XStoreParameterManager,
  XTaskEventParameterManager,
  XTaskFileParameterManager,
  XTaskParameterManager,
  XTaskThreadParameterManager,
  XTeamFileParameterManager,
  XTeamObjectParameterManager,
  XTeamParameterManager,
  XTeamSubParameterManager,
  XUserFileParameterManager,
  XUserObjectParameterManager,
  XUserParameterManager,
  XUserSubParameterManager
} from './parameter'

abstract class XTable<N extends string> {
  name: N
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameter?: XParameterManager<any>
  record = false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(name: N, label: string, parameter?: XParameterManager<any>) {
    this.name = name
    this.label = label
    this.parameter = parameter
    this.record = !parameter
  }

  isSystem() {
    return false
  }

  isDatabase() {
    return false
  }

  toString() {
    return this.label
  }
}

const BLOB = 'blob'
const BLOB_FILE = 'blob_file'
const BLOB_OBJECT = 'blob_object'
const DATABASE = 'database'
const DATABASE_FILE = 'database_file'
const DATABASE_OBJECT = 'database_object'
const FIELD = 'field'
const FIELD_FILE = 'field_file'
const FIELD_OBJECT = 'field_object'
const GROUP = 'group'
const GROUP_FILE = 'group_file'
const GROUP_OBJECT = 'group_object'
const NOTIFICATION = 'notification'
const POST = 'post'
const PRIV_DATABASE = 'priv_database'
const PRIV_GROUP = 'priv_group'
const RECORD_LINK = 'record_link'
const REQUEST = 'request'
const STORE = 'store'
const TASK = 'task'
const TASK_EVENT = 'task_event'
const TASK_FILE = 'task_file'
const TASK_THREAD = 'task_thread'
const TEAM = 'team'
const TEAM_FILE = 'team_file'
const TEAM_OBJECT = 'team_object'
const TEAM_SUBSCRIPTION = 'team_subscription'
const USER = 'user'
const USER_FILE = 'user_file'
const USER_OBJECT = 'user_object'
const USER_SUBSCRIPTION = 'user_subscription'

export const XSystemTableName = z.enum([
  BLOB,
  BLOB_FILE,
  BLOB_OBJECT,
  DATABASE,
  DATABASE_FILE,
  DATABASE_OBJECT,
  FIELD,
  FIELD_FILE,
  FIELD_OBJECT,
  GROUP,
  GROUP_FILE,
  GROUP_OBJECT,
  NOTIFICATION,
  POST,
  PRIV_DATABASE,
  PRIV_GROUP,
  RECORD_LINK,
  REQUEST,
  STORE,
  TASK,
  TASK_EVENT,
  TASK_FILE,
  TASK_THREAD,
  TEAM,
  TEAM_FILE,
  TEAM_OBJECT,
  TEAM_SUBSCRIPTION,
  USER,
  USER_FILE,
  USER_OBJECT,
  USER_SUBSCRIPTION
])

export type XSystemTableName = z.infer<typeof XSystemTableName>

export class XSystemTable extends XTable<XSystemTableName> {
  isSystem() {
    return true
  }

  static readonly BLOB = system('blob', 'Blob', XBlobParameterManager)
  static readonly BLOB_FILE = system('blob_file', 'Blob File', XBlobFileParameterManager)
  static readonly BLOB_OBJECT = system('blob_object', 'Blob Object', XBlobObjectParameterManager)
  static readonly DATABASE = system('database', 'Database', XDatabaseParameterManager)
  static readonly DATABASE_FILE = system('database_file', 'Database File', XDatabaseFileParameterManager)
  static readonly DATABASE_OBJECT = system('database_object', 'Database Object', XDatabaseObjectParameterManager)
  static readonly FIELD = system('field', 'Field', XFieldParameterManager)
  static readonly FIELD_FILE = system('field_file', 'Field File', XFieldFileParameterManager)
  static readonly FIELD_OBJECT = system('field_object', 'Field Object', XFieldObjectParameterManager)
  static readonly GROUP = system('group', 'Group', XGroupParameterManager)
  static readonly GROUP_FILE = system('group_file', 'Group File', XGroupFileParameterManager)
  static readonly GROUP_OBJECT = system('group_object', 'Group Object', XGroupObjectParameterManager)
  static readonly NOTIFICATION = system('notification', 'Notification', XNotificationParameterManager)
  static readonly POST = system('post', 'Post', XPostParameterManager)
  static readonly PRIV_DATABASE = system('priv_database', 'Priv Database', XPrivDatabaseParameterManager)
  static readonly PRIV_GROUP = system('priv_group', 'Priv Group', XPrivGroupParameterManager)
  static readonly RECORD_LINK = system('record_link', 'Record Link', XRecordLinkParameterManager)
  static readonly REQUEST = system('request', 'Request', XRequestParameterManager)
  static readonly STORE = system('store', 'Store', XStoreParameterManager)
  static readonly TASK = system('task', 'Task', XTaskParameterManager)
  static readonly TASK_EVENT = system('task_event', 'Task Event', XTaskEventParameterManager)
  static readonly TASK_FILE = system('task_file', 'Task File', XTaskFileParameterManager)
  static readonly TASK_THREAD = system('task_thread', 'Task Thread', XTaskThreadParameterManager)
  static readonly TEAM = system('team', 'Team', XTeamParameterManager)
  static readonly TEAM_FILE = system('team_file', 'Team File', XTeamFileParameterManager)
  static readonly TEAM_OBJECT = system('team_object', 'Team Object', XTeamObjectParameterManager)
  static readonly TEAM_SUBSCRIPTION = system('team_subscription', 'Team Subscription', XTeamSubParameterManager)
  static readonly USER = system('user', 'User', XUserParameterManager)
  static readonly USER_FILE = system('user_file', 'User File', XUserFileParameterManager)
  static readonly USER_OBJECT = system('user_object', 'User Object', XUserObjectParameterManager)
  static readonly USER_SUBSCRIPTION = system('user_subscription', 'User Subscription', XUserSubParameterManager)
}

const LOG = 'log'
const LOG_EDIT = 'log_edit'
const RECORD = 'record'
const TRASH = 'trash'

export const XDatabaseTableName = z.enum([RECORD, TRASH, LOG, LOG_EDIT])

export type XDatabaseTableName = z.infer<typeof XDatabaseTableName>

export class XDatabaseTable extends XTable<XDatabaseTableName> {
  isDatabase() {
    return true
  }

  static readonly LOG = database(LOG, 'Log', XLogParameterManager)
  static readonly LOG_EDIT = database(LOG_EDIT, 'Log Edit', XLogEditParameterManager)
  static readonly RECORD = database(RECORD, 'Record')
  static readonly TRASH = database(TRASH, 'Trash')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function system(name: XSystemTableName, label: string, parameter: XParameterManager<any>) {
  return new XSystemTable(name, label, parameter)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function database(name: XDatabaseTableName, label: string, parameter?: XParameterManager<any>) {
  return new XDatabaseTable(name, label, parameter)
}
