abstract class XPrivilege {
  name: string

  category: string

  color: string

  constructor(name: string, category: string) {
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
    return false
  }

  isDatabase() {
    return false
  }
}

export class XGroupPrivilege extends XPrivilege {
  private constructor(name: string, category: string) {
    super(name, category)
    XGroupPrivilege.values.push(this)
  }

  isGroup() {
    return true
  }

  static readonly values: XGroupPrivilege[] = []

  static readonly SELECT = new XGroupPrivilege('select', 'read')

  static readonly REPLY = new XGroupPrivilege('reply', 'wall')

  static readonly POST = new XGroupPrivilege('post', 'wall')

  static readonly ALTER = new XGroupPrivilege('alter', 'admin')

  static readonly GRANT = new XGroupPrivilege('grant', 'admin')
}

export class XDatabasePrivilege extends XPrivilege {
  private constructor(name: string, category: string) {
    super(name, category)
    XDatabasePrivilege.values.push(this)
  }

  isDatabase() {
    return true
  }

  static readonly values: XDatabasePrivilege[] = []

  static readonly SELECT = new XDatabasePrivilege('select', 'read')

  static readonly REPLY = new XDatabasePrivilege('reply', 'wall')

  static readonly POST = new XDatabasePrivilege('post', 'wall')

  static readonly UPDATE = new XDatabasePrivilege('update', 'write')

  static readonly SIGN = new XDatabasePrivilege('sign', 'write')

  static readonly INSERT = new XDatabasePrivilege('insert', 'write')

  static readonly TRASH = new XDatabasePrivilege('trash', 'delete')

  static readonly DELETE = new XDatabasePrivilege('delete', 'delete')

  static readonly LOCK = new XDatabasePrivilege('lock', 'admin')

  static readonly ALTER = new XDatabasePrivilege('alter', 'admin')

  static readonly GRANT = new XDatabasePrivilege('grant', 'admin')
}
