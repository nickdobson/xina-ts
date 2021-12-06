import { XDatabase, XField } from '../../element'
import { XRecordsSpecifier, buildRecordsSpecifier } from '../../record'
import { toSpecifier } from '../api'
import { toExpression, XExpression, XExpressionable } from '../expression'
import { XAction } from './action'

export default class XUpdateAction extends XAction {
  database?: XDatabase | string | number
  records: XRecordsSpecifier = []
  values: Record<string, XExpression> = {}

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

  setField(field: XField, value: XExpressionable) {
    this.values[field.getName()] = toExpression(value)
    return this
  }

  buildRest(pretty: boolean): Record<string, unknown> {
    const built: Record<string, unknown> = {}

    for (const [key, val] of Object.entries(this.values)) {
      built[key] = val.build(pretty)
    }

    return {
      database: toSpecifier(this.database, pretty),
      records: buildRecordsSpecifier(this.records),
      set: this.values
    }
  }
}