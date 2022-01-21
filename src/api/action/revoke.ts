import { XDatabase, XGroup, XUser } from '../../element'
import { XDatabasePrivilege, XGroupPrivilege } from '../../privilege'
import { toSpecifier } from '../api'
import { XAction } from './action'

abstract class XRevokeAction extends XAction<void> {
  users: (XUser | string | number)[] = []

  getAction() {
    return 'revoke'
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
      revoke: this.getRevoke(),
      users: this.users.map((u) => toSpecifier(u, pretty)),
      ...this.buildRestRest(pretty)
    }
  }

  abstract getRevoke(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>
}

export class XRevokeSuperAction extends XRevokeAction {
  getRevoke() {
    return 'super'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean) {
    return {}
  }
}

export class XRevokeGroupsAction extends XRevokeAction {
  groups: (XGroup | string | number)[] = []

  privileges: XGroupPrivilege[] = []

  getRevoke() {
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

export class XRevokeDatabasesAction extends XRevokeAction {
  databases: (XDatabase | string | number)[] = []

  privileges: XDatabasePrivilege[] = []

  getRevoke() {
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
