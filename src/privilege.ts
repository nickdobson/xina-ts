const GROUP_SYMBOL = Symbol('group')
const DATABSE_SYMBOL = Symbol('database')

export class XPrivilege {
  type: symbol
  name: string
  category: string
  color: string

  constructor(type: symbol, name: string, category: string) {
    this.type = type
    this.name = name
    this.category = category

    if (category === 'read') {
      this.color = 'green'
    } else if (category === 'wall') {
      this.color = 'orange'
    } else if (category === 'write') {
      this.color = 'deep-orange'
    } else if (category === 'delete') {
      this.color = 'danger'
    } else if (category === 'admin') {
      this.color = 'indigo'
    } else {
      this.color = 'grey'
    }
  }

  isGroup() {
    return this.type === GROUP_SYMBOL
  }

  isDatabase() {
    return this.type === DATABSE_SYMBOL
  }
}

function group(name: string, category: string) {
  return new XPrivilege(GROUP_SYMBOL, name, category)
}

function database(name: string, category: string) {
  return new XPrivilege(DATABSE_SYMBOL, name, category)
}

export const XDatabasePrivilege = Object.freeze({
  SELECT: database('select', 'read'),
  REPLY: database('reply', 'wall'),
  POST: database('post', 'wall'),
  UPDATE: database('update', 'write'),
  SIGN: database('sign', 'write'),
  INSERT: database('insert', 'write'),
  TRASH: database('trash', 'delete'),
  DELETE: database('delete', 'delete'),
  LOCK: database('lock', 'admin'),
  ALTER: database('alter', 'admin'),
  GRANT: database('grant', 'admin')
})

export const XDatabasePrivileges = [
  XDatabasePrivilege.SELECT,
  XDatabasePrivilege.REPLY,
  XDatabasePrivilege.POST,
  XDatabasePrivilege.UPDATE,
  XDatabasePrivilege.SIGN,
  XDatabasePrivilege.INSERT,
  XDatabasePrivilege.TRASH,
  XDatabasePrivilege.DELETE,
  XDatabasePrivilege.LOCK,
  XDatabasePrivilege.ALTER,
  XDatabasePrivilege.GRANT
]

export const XGroupPrivilege = Object.freeze({
  SELECT: group('select', 'read'),
  REPLY: group('reply', 'wall'),
  POST: group('post', 'wall'),
  ALTER: group('alter', 'admin'),
  GRANT: group('grant', 'admin')
})
