import { XDatabase, XField } from '../../element'
import { XRecordsSpecifier, buildRecordsSpecifier } from '../../record'
import { toSpecifier } from '../api'
import { XAction } from './action'

export default class XUpdateAction extends XAction {
  database?: XDatabase | string | number
  records: XRecordsSpecifier = []
  values: Record<string, unknown> = {}

  getAction(): string {
    return 'update'
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

  setField(field: XField, value: unknown) {
    this.values[field.getName()] = field.getType().parse(value)
    return this
  }

  setFile(objectId: string) {
    this.values.file = objectId
    return this
  }

  buildRest(pretty: boolean): Record<string, unknown> {
    return {
      database: toSpecifier(this.database, pretty),
      records: buildRecordsSpecifier(this.records),
      set: this.values
    }
  }
}
