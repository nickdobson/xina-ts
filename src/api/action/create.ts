import { XDatabase, XGroup } from '../..'
import { toOptionalSpecifier, toSpecifier } from '../api'
import { XAction } from './action'

abstract class XCreateAction extends XAction {
  getAction() {
    return 'create'
  }

  buildRest(pretty: boolean) {
    return {
      create: this.getCreate(),
      ...this.buildRestRest(pretty)
    }
  }

  abstract getCreate(): string
  abstract buildRestRest(pretty: boolean): Record<string, unknown>
}

export class XCreateGroupAction extends XCreateAction {
  parent?: XGroup

  group?: Record<string, unknown>

  getCreate(): string {
    return 'group'
  }

  setParent(parent: XGroup) {
    this.parent = parent
    return this
  }

  setGroup(group: Record<string, unknown>) {
    this.group = group
    return this
  }

  buildRestRest(pretty: boolean): Record<string, unknown> {
    return {
      parent: toOptionalSpecifier(this.parent, pretty),
      group: this.group
    }
  }
}

export class XCreateDatabaseAction extends XCreateAction {
  parent?: XGroup | XDatabase

  database?: Record<string, unknown>

  getCreate() {
    return 'database'
  }

  setParent(parent: XGroup | XDatabase) {
    this.parent = parent
    return this
  }

  setDatabase(database: Record<string, unknown>) {
    this.database = database
    return this
  }

  buildRestRest(pretty: boolean) {
    return {
      parent: toSpecifier(this.parent, pretty),
      database: this.database
    }
  }
}

export class XCreateTeamAction extends XCreateAction {
  team?: Record<string, unknown>

  getCreate() {
    return 'team'
  }

  setTeam(team: Record<string, unknown>) {
    this.team = team
    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRestRest(_pretty: boolean) {
    return {
      team: this.team
    }
  }
}
