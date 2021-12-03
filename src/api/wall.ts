import { XDatabase, XGroup, XTeam } from '../element'
import { isRecord, XRecord } from '../record'
import { toSpecifier } from './api'

export abstract class XWall {
  abstract build(): string

  static of(v: XDatabase | XRecord | XGroup | XTeam) {
    if (isRecord(v)) return new XRecordWall(v.$database, v)
    if (v instanceof XDatabase) return new XDatabaseWall(v)
    if (v instanceof XGroup) return new XGroupWall(v)
    return new XTeamWall(v)
  }
}

export class XDatabaseWall extends XWall {
  constructor(private database: XDatabase | number) {
    super()
  }

  build() {
    return `d${this.database}`
  }
}

export class XRecordWall extends XWall {
  constructor(private database: XDatabase | number, private record: XRecord | number) {
    super()
  }

  build() {
    return `d${toSpecifier(this.database)}r${toSpecifier(this.record)}`
  }
}

export class XGroupWall extends XWall {
  constructor(private group: XGroup | number) {
    super()
  }

  build() {
    return `g${toSpecifier(this.group)}`
  }
}

export class XTeamWall extends XWall {
  constructor(private team: XTeam | number) {
    super()
  }

  build() {
    return `t${toSpecifier(this.team)}`
  }
}
