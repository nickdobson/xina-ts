import { XDatabase, XGroup, XUser } from '../../element'
import { XDatabasePrivilege, XGroupPrivilege } from '../../privilege'
import { toSpecifier } from '../api'
import { XAction } from './action'

abstract class XGrantAction extends XAction {
  users: (XUser | string | number)[] = []

  getAction() {
    return 'grant'
  }

  setUsers(...users: (XUser | string | number)[]) {
    this.users = [...users]
    return this
  }

  addUsers(...users: (XUser | string | number)[]) {
    this.users.push(...users)
    return this
  }

  buildRest(pretty: boolean) {
    return {
      grant: this.getGrant(),
      users: this.users.map((u) => toSpecifier(u, pretty)),
      ...this.buildRestRest(pretty)
    }
  }

  abstract getGrant(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>
}

export class XGrantSuperAction extends XGrantAction {
  getGrant() {
    return 'super'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean) {
    return {}
  }
}

export class XGrantGroupsAction extends XGrantAction {
  groups: (XGroup | string | number)[] = []
  privileges: XGroupPrivilege[] = []

  getGrant() {
    return 'groups'
  }

  setGroups(...groups: (XGroup | string | number)[]) {
    this.groups = [...groups]
    return this
  }

  addGroups(...groups: (XGroup | string | number)[]) {
    this.groups.push(...groups)
    return this
  }

  setPrivileges(...privileges: XGroupPrivilege[]) {
    this.privileges = [...privileges]
    return this
  }

  addPrivileges(...privileges: XGroupPrivilege[]) {
    this.privileges.push(...privileges)
    return this
  }

  buildRestRest(pretty: boolean) {
    return {
      groups: this.groups.map((g) => toSpecifier(g, pretty)),
      privileges: this.privileges.map((p) => p.name)
    }
  }
}

export class XGrantDatabasesAction extends XGrantAction {
  databases: (XDatabase | string | number)[] = []
  privileges: XDatabasePrivilege[] = []

  getGrant() {
    return 'databases'
  }

  setDatabases(...databases: (XDatabase | string | number)[]) {
    this.databases = [...databases]
    return this
  }

  addDatabases(...databases: (XDatabase | string | number)[]) {
    this.databases.push(...databases)
    return this
  }

  setPrivileges(...privileges: XDatabasePrivilege[]) {
    this.privileges = [...privileges]
    return this
  }

  addPrivileges(...privileges: XDatabasePrivilege[]) {
    this.privileges.push(...privileges)
    return this
  }

  buildRestRest(pretty: boolean) {
    return {
      databases: this.databases.map((d) => toSpecifier(d, pretty)),
      privileges: this.privileges.map((p) => p.name)
    }
  }
}
