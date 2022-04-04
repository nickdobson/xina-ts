import { XDatabase, XGroup, XTeam, XUser } from '../../element'
import { toSpecifier } from '../api'
import { XAction } from './action'

abstract class XJoinAction extends XAction<void> {
  teams: (XTeam | string | number)[] = []

  getAction() {
    return 'join'
  }

  setTeams(...teams: (XTeam | string | number)[]) {
    this.teams = [...teams]
    return this
  }

  addTeams(...teams: (XTeam | string | number)[]) {
    this.teams.push(...teams)
    return this
  }

  buildRest(pretty: boolean) {
    return {
      join: this.getJoin(),
      teams: this.teams.map((t) => toSpecifier(t, pretty)),
      ...this.buildRestRest(pretty)
    }
  }

  abstract getJoin(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>
}

export class XJoinUsersAction extends XJoinAction {
  users: (XUser | string | number)[] = []

  admin = false

  getJoin() {
    return 'users'
  }

  setUsers(...users: (XUser | string | number)[]) {
    this.users = [...users]
    return this
  }

  addUsers(...users: (XUser | string | number)[]) {
    this.users.push(...users)
    return this
  }

  setAdmin(admin?: boolean) {
    this.admin = admin ?? false
    return this
  }

  buildRestRest(pretty: boolean) {
    return {
      admin: this.admin,
      users: this.users.map((t) => toSpecifier(t, pretty))
    }
  }
}

export class XJoinGroupsAction extends XJoinAction {
  groups: (XGroup | string | number)[] = []

  privileges?: Record<string, boolean>

  getJoin() {
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

  setPrivileges(privileges: Record<string, boolean>) {
    this.privileges = { ...privileges }
    return this
  }

  buildRestRest(pretty: boolean) {
    return {
      groups: this.groups.map((g) => toSpecifier(g, pretty)),
      privileges: this.privileges
    }
  }
}

export class XJoinDatabasesAction extends XJoinAction {
  databases: (XDatabase | string | number)[] = []

  privileges?: Record<string, boolean>

  getJoin() {
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

  setPrivileges(privileges: Record<string, boolean>) {
    this.privileges = { ...privileges }
    return this
  }

  buildRestRest(pretty: boolean) {
    return {
      databases: this.databases.map((d) => toSpecifier(d, pretty)),
      privileges: this.privileges
    }
  }
}
