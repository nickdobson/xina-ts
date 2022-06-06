import { XDatabase, XElementSet, XGroup, XTeam, XUser } from './element'
import { XPostInterface } from './parameter'
import { toRecords, XRecord, XRecordInterfaceExt } from './record'

export type XPostWall =
  | {
      label: 'Global'
      global: true
    }
  | {
      label: string
      team?: XTeam
      user?: XUser
      group?: XGroup
      database?: XDatabase
      record?: XRecord
    }

export interface XPostFile extends Record<string, unknown> {
  name: string
  type: string
  url: string
  size: number
}

export interface XPostInterfaceExt extends XPostInterface {
  files?: XPostFile[]
  record?: XRecordInterfaceExt
}

export interface XPost extends XPostInterface {
  files?: XPostFile[]
  record?: XRecord
  wall: XPostWall
}

export function toPost(
  post: XPostInterfaceExt,
  teams: XElementSet<XTeam>,
  users: XElementSet<XUser>,
  groups: XElementSet<XGroup>,
  databases: XElementSet<XDatabase>
): XPost {
  const wallId = post.wall_id
  let wall: XPostWall
  let record: XRecord | undefined

  if (wallId === '$') {
    wall = {
      label: 'Global',
      global: true
    }
  } else if (wallId.startsWith('t')) {
    const team = teams.get(Number(wallId.substring(1)))

    wall = {
      label: team.getLabel(),
      team
    }
  } else if (wallId.startsWith('u')) {
    const user = users.get(Number(wallId.substring(1)))

    wall = {
      label: user.fullName,
      user
    }
  } else if (wallId.startsWith('g')) {
    const group = groups.get(Number(wallId.substring(1)))

    wall = {
      label: group.getLabelPath(),
      group
    }
  } else if (wallId.startsWith('d') && wallId.includes('r')) {
    const parts = wallId.split('r')

    const database = databases.get(Number(parts[0].substring(1)))
    const recordId = Number(parts[1])

    record = post.record ? toRecords(database, [post.record])[0] : undefined

    wall = {
      label: `${database.getLabelPath()} ${record ? record.$format() : ' (record ' + recordId + ' not found)'}`,
      database,
      record
    }
  } else {
    const database = databases.get(Number(wallId.substring(1)))

    wall = {
      label: database.getLabelPath(),
      database
    }
  }

  return { ...post, wall, record } as XPost
}

export function toPosts(
  posts: XPostInterfaceExt[],
  teams: XElementSet<XTeam>,
  users: XElementSet<XUser>,
  groups: XElementSet<XGroup>,
  databases: XElementSet<XDatabase>
) {
  return posts.map((post) => toPost(post, teams, users, groups, databases))
}
