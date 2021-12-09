import { XDatabase, XGroup, XTeam, XUser } from '../../element'
import { toSpecifier } from '../api'
import { XAction } from './action'

abstract class XLeaveAction extends XAction {
  teams: (XTeam | string | number)[] = []

  getAction() {
    return 'leave'
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
      leave: this.getLeave(),
      teams: this.teams.map((t) => toSpecifier(t, pretty))
    }
  }

  abstract getLeave(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>
}

export class XLeaveUsersAction extends XLeaveAction {
  users: (XUser | string | number)[] = []

  getLeave() {
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

  buildRestRest(pretty: boolean) {
    return {
      users: this.users.map((t) => toSpecifier(t, pretty))
    }
  }
}

export class XLeaveGroupsAction extends XLeaveAction {
  groups: (XGroup | string | number)[] = []

  getLeave() {
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

  buildRestRest(pretty: boolean) {
    return {
      groups: this.groups.map((g) => toSpecifier(g, pretty))
    }
  }
}

export class XLeaveDatabasesAction extends XLeaveAction {
  databases: (XDatabase | string | number)[] = []

  getLeave() {
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

  buildRestRest(pretty: boolean) {
    return {
      databases: this.databases.map((d) => toSpecifier(d, pretty))
    }
  }
}
