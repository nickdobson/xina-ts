import { XDatabase } from '../../element'
import { isSimpleObject } from '../../util'
import { toSpecifier } from '../api'
import { XExpression } from '../expression'
import { XAction } from './action'

export class XInsertAction extends XAction<void> {
  database?: XDatabase

  records: Record<string, unknown>[] = []

  mode?: string

  setDatabase(database: XDatabase) {
    this.database = database
    return this
  }

  setOnDuplicateUpdate() {
    this.mode = 'update'
    return this
  }

  getAction(): string {
    return 'insert'
  }

  buildRest(pretty: boolean): Record<string, unknown> {
    const records = this.records.map((record) => {
      if (!(record.expressions && isSimpleObject(record.expressions))) return record

      const clone = Object.assign({}, record)
      const exprs: Record<string, unknown> = {}

      for (const [key, val] of Object.entries(record.expressions)) {
        exprs[key] = val instanceof XExpression ? val.build(pretty) : val
      }

      clone.expressions = exprs

      return clone
    })

    return {
      action: 'insert',
      database: toSpecifier(this.database, pretty),
      records: records,
      on_duplicate: this.mode
    }
  }
}
