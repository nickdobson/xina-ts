import { XDatabase } from '../../element'
import { buildRecordsSpecifier, XRecordsSpecifier } from '../../record'
import { toSpecifier } from '../api'
import { XAction } from './action'

export default class XDeleteAction extends XAction {
  database?: XDatabase | string | number
  records: XRecordsSpecifier = []

  getAction() {
    return 'delete'
  }

  setDatabase(database: XDatabase) {
    this.database = database
    return this
  }

  setRecords(...records: XRecordsSpecifier) {
    this.records = []
    return this.addRecords(...records)
  }

  addRecords(...records: XRecordsSpecifier) {
    this.records.push(...records)
    return this
  }

  buildRest(pretty: boolean): Record<string, unknown> {
    return {
      database: toSpecifier(this.database, pretty),
      records: buildRecordsSpecifier(this.records)
    }
  }
}
