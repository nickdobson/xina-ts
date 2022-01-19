import { XDatabase } from '../../element'
import { XRecordsSpecifier, buildRecordsSpecifier } from '../../record'
import { toSpecifier } from '../api'
import { XAction } from './action'

export class XUnlinkAction extends XAction {
  fromDatabase?: XDatabase | string | number

  fromRecords: XRecordsSpecifier = []

  toDatabase?: XDatabase | string | number

  toRecords: XRecordsSpecifier = []

  getAction() {
    return 'unlink'
  }

  setFrom(database: XDatabase, ...records: XRecordsSpecifier) {
    this.fromDatabase = database
    this.fromRecords = [...records]
    return this
  }

  setTo(database: XDatabase, ...records: XRecordsSpecifier) {
    this.toDatabase = database
    this.toRecords = [...records]
    return this
  }

  buildRest(pretty: boolean): Record<string, unknown> {
    return {
      from: {
        database: toSpecifier(this.fromDatabase, pretty),
        records: buildRecordsSpecifier(this.fromRecords)
      },
      to: {
        database: toSpecifier(this.toDatabase, pretty),
        records: buildRecordsSpecifier(this.toRecords)
      }
    }
  }
}
