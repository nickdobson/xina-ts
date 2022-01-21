import { XDatabase } from '../../element'
import { XRecordsSpecifier, buildRecordsSpecifier } from '../../record'
import { toSpecifier } from '../api'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class XAction<T> {
  abstract getAction(): string
  abstract buildRest(pretty: boolean): Record<string, unknown>

  build(pretty = false): Record<string, unknown> {
    return { action: this.getAction(), ...this.buildRest(pretty) }
  }
}

export abstract class XRecordsActionBase extends XAction<void> {
  database?: XDatabase | string | number

  records: XRecordsSpecifier = []

  abstract buildRestRest(pretty: boolean): Record<string, unknown>

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
      records: buildRecordsSpecifier(this.records),
      ...this.buildRestRest(pretty)
    }
  }
}
