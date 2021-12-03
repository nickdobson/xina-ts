import { isArray, isNumber, ISO8601_DATE, ISO8601_LOCALDATETIME, isString, normalize, sortKeys } from './util'

import { XEnum, XNotificationLevel, XNotificationType, XPostLevel, XPostType, XRequestStatus } from './enum'

interface XTypeProps {
  isBoolean?: boolean
  isEnum?: boolean
  isCollection?: boolean
  isList?: boolean
  isSet?: boolean
  isNumeric?: boolean
  isInteger?: boolean
  isFloat?: boolean
  isCharacter?: boolean
  isString?: boolean
  isText?: boolean
  isAscii?: boolean
  isUtf8?: boolean
  isHtml?: boolean
  isXml?: boolean
  isTemporal?: boolean
  isInstant?: boolean
  isDateTime?: boolean
  isDate?: boolean
  isLocal?: boolean
  isDuration?: boolean
  isJson?: boolean
  isJsonArray?: boolean
  isJsonObject?: boolean
}

interface XTypeFormatProps {
  clean?: boolean
  safe?: boolean
  html?: boolean
  format?: string
}

type XTypeFormat = string | XTypeFormatProps

export abstract class XType<T> {
  readonly name: string
  readonly nameSafe: string

  readonly isBoolean = false
  readonly isEnum = false
  readonly isCollection = false
  readonly isList = false
  readonly isSet = false
  readonly isNumeric = false
  readonly isInteger = false
  readonly isFloat = false
  readonly isCharacter = false
  readonly isString = false
  readonly isText = false
  readonly isAscii = false
  readonly isUtf8 = false
  readonly isHtml = false
  readonly isXml = false
  readonly isTemporal = false
  readonly isInstant = false
  readonly isLocal = false
  readonly isDuration = false

  constructor(name: string, props: XTypeProps, safeMode = false) {
    this.name = name
    this.nameSafe = name.replace('(', safeMode ? '' : '_').replace(')', '')

    Object.assign(this, props)
  }

  /**
   * @param v the value to check
   *
   * @returns `true` if the value is an instance of this type, `false` otherwise.
   *
   * @description
   * Returns `true` if the provided value is an instance of the JavaScript object type of this `XType`. All
   * types must implement this function.
   */
  abstract isInstance(v: unknown): v is T

  /**
   * @param value the value to parse
   *
   * @returns the parsed value
   *
   * @throws {Error} if the value is undefined
   *
   * @description
   * Parses the provided value into an instance of the JavaScript object type of this `XType`.
   *
   * If the value an instance of the correct type the value is returned. If the value is `null` or an empty string,
   * `null` is returned. Otherwise the type-specific `parseObject` function is used to parse the value.
   */
  parse(v: unknown): undefined | null | T {
    if (typeof v === 'undefined' || v === null) return v

    // an empty string is treated as null
    if (isString(v) && !v.trim().length) return null

    if (this.isInstance(v)) return v

    return this.parseObject(v)
  }

  /**
   * @param v the value to parse
   *
   * @returns the parsed value
   *
   * @throws `Error` if the value is not parsable as the type
   *
   * @description
   * Parses the provided value into an instance of the JavaScript object type of this `XType`. All types must
   * implement this function.
   *
   * This method should not be called outside of the `parse` method. The value is checked by parse to not be
   * `undefined`, `null`, or an empty string (which is treated as `null`).
   */
  abstract parseObject(v: unknown): T

  /**
   * @param v the value to format
   * @param f the format definition
   *
   * @returns the formatted text
   *
   * @description
   * Formats the provided value to a standard plain text output for this `XType`. The provided value does not
   * need to be an instance of the JavaScript object type of this type; it will first be run through the `parse`
   * method if needed.
   */
  format(v: unknown, f?: XTypeFormat) {
    if (v === undefined || v === null) return ''

    const parsed = this.parse(v)

    if (parsed === undefined || parsed === null) return ''

    return this.formatObject(parsed, f)
  }

  /**
   * @param v the value to format
   * @param f the format definition
   *
   * @returns the formatted text
   *
   * @throws `Error` if the value is `undefined`
   *
   * @description
   * Formats the provided value to a standard plain text output for this `XOType`. By default this calls the
   * `toString` function of the value.
   *
   * This function should not be called outside of the format function. The value is checked by format to not be
   * `undefined` or `null`, and is already parsed into the correct type.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatObject(v: T, _f?: XTypeFormat) {
    return '' + v
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAlignment(_v: T, _f?: XTypeFormat) {
    return 'right'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWrap(_v: T, _f?: XTypeFormat) {
    return false
  }
}

class XEnumType<T extends XEnum> extends XType<number> {
  values: T[]
  valueMap: Record<string | number, T> = {}

  constructor(name: string, values: T[]) {
    super(name, { isEnum: true })

    this.values = values
    this.values.forEach((v) => {
      this.valueMap[v.id] = v
      this.valueMap[v.name] = v
    })
  }

  isInstance(v: unknown): v is number {
    return isNumber(v) && !!this.valueMap[v]
  }

  parseObject(v: unknown) {
    if (isNumber(v) || isString(v)) {
      const e = this.valueMap[v]
      if (e) return e.id
    }

    throw Error(`invalid ${this.name} value: ${v}`)
  }

  formatObject(v: number, f?: XTypeFormat) {
    if (f instanceof Object && f.safe) return this.valueMap[v].name
    return this.valueMap[v].label
  }
}

abstract class XNumericType extends XType<number> {
  constructor(name: string, props: XTypeProps) {
    super(name, Object.assign(props, { isNumeric: true }), true)
  }

  isInstance(v: unknown): v is number {
    return isNumber(v)
  }
}

class XBooleanType extends XType<boolean> {
  constructor() {
    super('boolean', { isBoolean: true })
  }

  isInstance(v: unknown): v is boolean {
    return v === true || v === false
  }

  parseObject(v: unknown): boolean {
    if (isString(v)) {
      const lc = v.toLowerCase()
      if (['true', 't', '1'].includes(lc)) return true
      if (['false', 'f', '0'].includes(lc)) return false
    } else if (isNumber(v)) {
      return !!v
    }

    throw Error(`invalid boolean: ${v}`)
  }
}

class XIntegerType extends XNumericType {
  min: number
  max: number

  /**
   * @param size the size in bytes
   * @param min  the minimum value of the type
   * @param max  the maximum value of the type
   */
  constructor(size: number, min: number, max: number) {
    super(`int(${size})`, { isInteger: true })

    this.min = min
    this.max = max
  }

  parseObject(v: unknown) {
    if (!isString(v)) throw Error(`invalid ${this.name}: ${v}`)

    const i = parseInt(v)
    if (isNaN(i)) throw new TypeError(`invalid ${this.name} (${v}): not an integer`)
    if (i < this.min) throw new TypeError(`invalid ${this.name} (${v}): less than ${this.min}`)
    if (i > this.max) throw new TypeError(`invalid ${this.name} (${v}): greater than ${this.min}`)
    return i
  }
}

class XFloatType extends XNumericType {
  /**
   * @param size The size in bytes.
   */
  constructor(size: number) {
    super(`float(${size})`, { isFloat: true })
  }

  parseObject(v: NonNullable<unknown>) {
    if (!isString(v)) throw Error(`invalid ${this.name}: ${v}`)

    const i = parseFloat(v)
    if (isNaN(i)) throw Error(`invalid ${this.name} (${v}): not a float`)
    return i
  }
}

abstract class XCharacterType extends XType<string> {
  constructor(name: string, props: XTypeProps) {
    super(name, Object.assign(props, { isCharacter: true }), true)
  }

  isInstance(v: unknown): v is string {
    return isString(v)
  }

  parseObject(v: unknown): string {
    return '' + v
  }

  formatObject(v: string, f?: XTypeFormat) {
    if (f && f instanceof Object) {
      // return absolute value for safe
      if (f.safe) return v

      // add spacing around comma to improve wrapping
      v = v.replace(/,/g, ',\u200B')

      // for html add line breaks on new lines
      if (f.html) v = Sugar.String.escapeHTML(v).replace(/\n/g, '<br>')
    } else {
      // add spacing around comma to improve wrapping
      v = v.replace(/,/g, ',\u200B')
    }

    return v
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAlignment(_v: string, _f?: XTypeFormat) {
    return 'left'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWrap(v: string, _f?: XTypeFormat): boolean {
    return v.length > 16
  }
}

abstract class XAsciiType extends XCharacterType {
  constructor(name: string, props: XTypeProps) {
    super(name, Object.assign(props, { isAscii: true }))
  }
}

class XAsciiStringType extends XAsciiType {
  length: number

  constructor(length?: number, v = false) {
    super(length ? `ascii${v ? 'v' : ''}string(${length})` : 'asciistring', { isString: true })
    this.length = length || 65535
  }

  parseObject(v: unknown) {
    const n = normalize(super.parseObject(v))

    if (n.length > this.length) {
      throw new TypeError(`invalid ${this.name} (${n.slice(0, 16)}): length > ${this.length}`)
    }

    return n
  }
}

class XAsciiTextType extends XAsciiType {
  constructor() {
    super('asciitext', { isText: true })
  }
}

abstract class XUtf8Type extends XCharacterType {
  constructor(name: string, props: XTypeProps) {
    super(name, Object.assign(props, { isUtf8: true }))
  }
}

class XUtf8StringType extends XUtf8Type {
  length: number

  constructor(length?: number, v = false) {
    super(length ? `utf8${v ? 'v' : ''}string(${length})` : 'utf8string', { isString: true })
    this.length = length || 65535
  }

  parseObject(v: unknown) {
    const n = normalize(super.parseObject(v))

    if (n.length > this.length) {
      throw new TypeError(`invalid ${this.name} (${n.slice(0, 16)}): length > ${this.length}`)
    }

    return n
  }
}

class XUtf8TextType extends XUtf8Type {
  constructor() {
    super('utf8text', { isText: true })
  }
}

class XHtmlType extends XUtf8Type {
  constructor() {
    super('html', { isHtml: true })
  }
}

class XXmlType extends XUtf8Type {
  constructor() {
    super('xml', { isXml: true })
  }
}

class XInstantType extends XType<number> {
  unit: string
  fromMs: (ms: number) => number
  toMs: (v: number) => number

  constructor(unit: string, fromMs = (ms: number) => ms, toMs = (ms: number) => ms) {
    super(`instant(${unit})`, { isTemporal: true, isInstant: true })

    this.unit = unit
    this.fromMs = fromMs
    this.toMs = toMs
  }

  toDate(v: number) {
    return Sugar.Date.create(this.toMs(v))
  }

  isInstance(v: unknown): v is number {
    return isNumber(v)
  }

  parseObject(v: unknown) {
    if (isString(v)) {
      if (v.match(/^-?\d+$/)) return parseInt(v)
      // non-integer string must be parsed as timestamp
      v = Sugar.Date.create(v)
    }

    if (v instanceof Date) {
      if (!Sugar.Date.isValid(v)) throw Error(`invalid instant: ${v}`)
      return this.fromMs(v.getTime())
    }

    throw Error(`invalid instant: ${v}`)
  }

  formatObject(v: number, f?: XTypeFormat) {
    const iso_d = '{yyyy}-{MM}-{dd}'
    const iso_h = iso_d + 'T{HH}'
    const iso_m = iso_h + ':{mm}'
    const iso_s = iso_m + ':{ss}'
    const iso_f = iso_s + '.{SSS}'

    const formats: Record<string, string> = { iso_d, iso_h, iso_m, iso_s, iso_f, iso: iso_f }

    const resolveFormat = (f?: string) => (f ? formats[f.toLowerCase()] || f : f)

    if (f instanceof Object) {
      if (f.safe) return v.toString()
      return Sugar.Date.format(this.toDate(v), resolveFormat(f.format) || iso_f)
    } else if (isString(f)) {
      return Sugar.Date.format(this.toDate(v), resolveFormat(f) || iso_f)
    } else {
      return Sugar.Date.format(this.toDate(v), iso_f)
    }
  }
}

class XDurationType extends XType<number> {
  unit: string
  base: number

  constructor(unit: string, base: number) {
    super(`duration(${unit})`, { isTemporal: true, isDuration: true })

    this.unit = unit
    this.base = base
  }

  toSeconds(v: number) {
    return v / this.base
  }

  isInstance(v: unknown): v is number {
    return isNumber(v)
  }

  parseObject(v: unknown) {
    if (isString(v) && v.match(/^-?\d+$/)) return parseInt(v)
    throw Error(`invalid duration: ${v}`)
  }

  formatObject(v: number, f?: XTypeFormat) {
    if (f instanceof Object && f.safe) return v.toString()

    if (v === 0) return `${v}${this.unit}`

    v = this.toSeconds(v)

    const day = 24 * 60 * 60
    const hour = 60 * 60
    const minute = 60

    const days = Math.floor(v / day)
    const hours = Math.floor((v - days * day) / hour)
    const minutes = Math.floor((v - days * day - hours * hour) / minute)

    let seconds = v - days * day - hours * hour - minutes * minute

    if (this.base === 1) {
      seconds = Sugar.Number.round(seconds)
    } else if (this.base === 1000) {
      seconds = Sugar.Number.round(seconds, 3)
    } else if (this.base === 1000000) {
      seconds = Sugar.Number.round(seconds, 6)
    } else {
      seconds = Sugar.Number.round(seconds, 9)
    }

    return (
      (days ? days + 'd ' : '') +
      (hours ? hours + 'h ' : '') +
      (minutes ? minutes + 'm ' : '') +
      (seconds ? seconds + 's' : '')
    )
  }
}

class XDateTimeType extends XType<number> {
  readonly unit: string = 'ms'
  readonly fromMs = (ms: number) => ms
  readonly toMs = (ms: number) => ms

  constructor() {
    super(`datetime`, { isTemporal: true, isDateTime: true, isInstant: true })
  }

  toDate(v: number) {
    return Sugar.Date.create(this.toMs(v))
  }

  isInstance(v: unknown): v is number {
    return isNumber(v)
  }

  parseObject(v: unknown) {
    if (isString(v)) {
      if (v.match(/^-?\d+$/)) return parseInt(v)
      // non-integer string must be parsed as timestamp
      v = Sugar.Date.create(v)
    }

    if (v instanceof Date) {
      if (!Sugar.Date.isValid(v)) throw Error(`invalid date time: ${v}`)
      return this.fromMs(v.getTime())
    }

    throw Error(`invalid date time: ${v}`)
  }

  formatObject(v: number, f?: XTypeFormat) {
    const iso_d = '{yyyy}-{MM}-{dd}'
    const iso_h = iso_d + 'T{HH}'
    const iso_m = iso_h + ':{mm}'
    const iso_s = iso_m + ':{ss}'
    const iso_f = iso_s + '.{SSS}'

    const formats: Record<string, string> = { iso_d, iso_h, iso_m, iso_s, iso_f, iso: iso_f }

    const resolveFormat = (f?: string) => (f ? formats[f.toLowerCase()] || f : f)

    if (f instanceof Object) {
      if (f.safe) return v.toString()
      return Sugar.Date.format(this.toDate(v), resolveFormat(f.format) || iso_f)
    } else if (isString(f)) {
      return Sugar.Date.format(this.toDate(v), resolveFormat(f) || iso_f)
    } else {
      return Sugar.Date.format(this.toDate(v), iso_f)
    }
  }
}

class XDateType extends XType<number> {
  constructor() {
    super(`date`, { isTemporal: true, isDate: true })
  }

  isInstance(v: unknown): v is number {
    return isNumber(v)
  }

  parseObject(v: unknown): number {
    if (isString(v)) {
      if (v.match(/^-?\d+$/)) return parseInt(v)
      // non-integer string must be parsed as timestamp
      v = Sugar.Date.create(v)
    }

    if (v instanceof Date) {
      if (!Sugar.Date.isValid(v)) throw Error(`invalid date time: ${v}`)
      return v.getTime()
    }

    throw Error(`invalid date: ${v}`)
  }
}

class XLocalDateType extends XType<string> {
  constructor() {
    super('localdate', { isTemporal: true, isDate: true, isLocal: true })
  }

  isInstance(v: unknown): v is string {
    return isString(v)
  }

  parseObject(v: unknown) {
    if (isString(v)) {
      if (v.match(/^-?\d+$/)) {
        v = Sugar.Date.create(parseInt(v))
      } else {
        // non-integer string must be parsed as timestamp
        v = Sugar.Date.create(v)
      }
    }

    if (v instanceof Date) {
      if (!Sugar.Date.isValid(v)) throw Error(`invalid local date: ${v}`)
      return Sugar.Date.format(v, ISO8601_DATE)
    }

    throw Error(`invalid date time: ${v}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatObject(v: string, _f?: XTypeFormat) {
    return v
  }
}

class XLocalDateTimeType extends XType<string> {
  constructor() {
    super(`localdatetime`, { isTemporal: true, isDateTime: true, isLocal: true, isInstant: true })
  }

  toDate(v: number | string | Date) {
    return Sugar.Date.create(v)
  }

  isInstance(v: unknown): v is string {
    return isString(v)
  }

  parseObject(v: unknown) {
    if (isString(v)) {
      if (v.match(/^-?\d+$/)) {
        v = Sugar.Date.create(parseInt(v))
      } else {
        // non-integer string must be parsed as timestamp
        v = Sugar.Date.create(v)
      }
    }

    if (v instanceof Date) {
      if (!Sugar.Date.isValid(v)) throw Error(`invalid date time: ${v}`)
      return Sugar.Date.format(v, ISO8601_LOCALDATETIME)
    }

    throw Error(`invalid date time: ${v}`)
  }

  formatObject(v: string, f?: XTypeFormat) {
    const iso_d = '{yyyy}-{MM}-{dd}'
    const iso_h = iso_d + 'T{HH}'
    const iso_m = iso_h + ':{mm}'
    const iso_s = iso_m + ':{ss}'
    const iso_f = iso_s + '.{SSS}'

    const formats: Record<string, string> = { iso_d, iso_h, iso_m, iso_s, iso_f, iso: iso_f } as const

    const resolveFormat = (f?: string) => (f ? formats[f.toLowerCase()] || f : f)

    if (f instanceof Object) {
      if (f.safe) return v.toString()
      return Sugar.Date.format(this.toDate(v), resolveFormat(f.format) || iso_f)
    } else if (isString(f)) {
      return Sugar.Date.format(this.toDate(v), resolveFormat(f) || iso_f)
    } else {
      return Sugar.Date.format(this.toDate(v), iso_f)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatJson = function (v: unknown[] | Record<string, unknown>, f?: XTypeFormat, _depth = 1) {
  if (f instanceof Object) {
    if (f.clean) v = sortKeys(v)

    if (f.safe) return JSON.stringify(v, null, 2)

    // TODO implement prune function
    if (f.html) {
      return JSON.stringify(v, null, 2) // JSON.stringify(JSON.parse(JSON.prune(v, depth)), null, 2)
        .replace(/ /g, '&nbsp;')
        .replace(/\n/g, '<br>')
    }
  }

  return JSON.stringify(v, null, 2)
}

class XJsonType extends XType<unknown[] | Record<string, unknown>> {
  constructor() {
    super('json', { isJson: true })
  }

  isInstance(v: unknown): v is unknown[] | Record<string, unknown> {
    return v instanceof Array || v instanceof Object
  }

  parseObject(v: unknown): unknown[] | Record<string, unknown> {
    if (isString(v)) {
      const parsed = JSON.parse(v)
      if (this.isInstance(parsed)) return parsed
    }

    throw Error(`invalid json array: ${v}`)
  }

  formatObject(v: unknown[] | Record<string, unknown>, f?: XTypeFormat) {
    return formatJson(v, f)
  }
}

class XJsonArrayType extends XType<unknown[]> {
  constructor() {
    super('jsonarray', { isJson: true, isJsonArray: true })
  }

  isInstance(v: unknown): v is unknown[] {
    return v instanceof Array
  }

  parseObject(v: unknown): unknown[] {
    if (isString(v)) {
      const parsed = JSON.parse(v)
      if (this.isInstance(parsed)) return parsed
    }

    throw Error(`invalid json array: ${v}`)
  }

  formatObject(v: unknown[], f?: XTypeFormat) {
    return formatJson(v, f, 2)
  }
}

class XJsonObjectType extends XType<Record<string, unknown>> {
  constructor() {
    super('jsonobject', { isJson: true, isJsonObject: true })
  }

  isInstance(v: unknown): v is Record<string, unknown> {
    return v instanceof Object
  }

  parseObject(v: unknown): Record<string, unknown> {
    if (isString(v)) {
      const parsed = JSON.parse(v)
      if (this.isInstance(parsed)) return parsed
    }

    throw Error(`invalid json object: ${v}`)
  }

  formatObject(v: Record<string, unknown>, f?: XTypeFormat) {
    return formatJson(v, f)
  }
}

class XCollectionType<T> extends XType<T[]> {
  valueType: XType<T>

  constructor(name: string, valueType: XType<T>, props: XTypeProps) {
    super(`${name}(${valueType.name})`, Object.assign(props, { isCollection: true }))

    this.valueType = valueType
  }

  isInstance(val: unknown): val is T[] {
    if (!(val instanceof Array)) return false
    return val.every((v) => this.valueType.isInstance(v))
  }

  parseObject(val: unknown): T[] {
    let arr: unknown = val

    if (isString(val)) arr = JSON.parse(val)

    if (!isArray(arr)) throw Error(`invalid ${this.name}: ${val}`)

    const parsed: T[] = []

    arr.forEach((v) => {
      const pv = this.valueType.parse(v)
      if (pv != null) parsed.push(pv)
    })

    return parsed
  }

  formatObject(val: T[], f?: XTypeFormat) {
    if (f instanceof Object) {
      if (f.safe) {
        return JSON.stringify(val, null, 2)
      }
    }

    if (!val.length) return 'empty'

    return val.map((v) => this.valueType.format(v, f)).join(', ')
  }
}

class XListType<T> extends XCollectionType<T> {
  constructor(valueType: XType<T>) {
    super('list', valueType, { isList: true })
  }
}

class XSetType<T> extends XCollectionType<T> {
  constructor(valueType: XType<T>) {
    super('set', valueType, { isSet: true })
  }
}

class XIDType extends XType<number> {
  constructor(name: string) {
    super(name + '_id', {})
  }

  isInstance(v: unknown): v is number {
    return isNumber(v)
  }

  parseObject(v: unknown): number {
    if (!isString(v)) throw Error(`invalid ${this.name}: ${v}`)

    const i = parseInt(v)
    if (isNaN(i)) throw new TypeError(`invalid ${this.name} (${v}): not an integer`)
    return i
  }
}

class XTypeType extends XType<string> {
  constructor() {
    super('type', {})
  }

  isInstance(v: unknown): v is string {
    return isString(v) && !!TYPE_MAP[v.toLowerCase()]
  }

  parseObject(v: unknown): string {
    throw new Error(`invalid type: ${v}`)
  }
}

const ASCIISTRING1 = new XAsciiStringType(1)
const ASCIISTRING2 = new XAsciiStringType(2)
const ASCIISTRING4 = new XAsciiStringType(4)
const ASCIISTRING8 = new XAsciiStringType(8)
const ASCIISTRING16 = new XAsciiStringType(16)
const ASCIISTRING32 = new XAsciiStringType(32)
const ASCIISTRING64 = new XAsciiStringType(64)
const ASCIISTRING128 = new XAsciiStringType(128)
const ASCIISTRING256 = new XAsciiStringType(256)

const ASCIISTRING = new XAsciiStringType()

const ASCIIVSTRING8 = new XAsciiStringType(8, true)
const ASCIIVSTRING16 = new XAsciiStringType(16, true)
const ASCIIVSTRING32 = new XAsciiStringType(32, true)
const ASCIIVSTRING64 = new XAsciiStringType(64, true)
const ASCIIVSTRING128 = new XAsciiStringType(128, true)
const ASCIIVSTRING256 = new XAsciiStringType(256, true)

const ASCIITEXT = new XAsciiTextType()

const UTF8STRING1 = new XUtf8StringType(1)
const UTF8STRING2 = new XUtf8StringType(2)
const UTF8STRING4 = new XUtf8StringType(4)
const UTF8STRING8 = new XUtf8StringType(8)
const UTF8STRING16 = new XUtf8StringType(16)
const UTF8STRING32 = new XUtf8StringType(32)
const UTF8STRING64 = new XUtf8StringType(64)
const UTF8STRING128 = new XUtf8StringType(128)

const UTF8STRING = new XUtf8StringType()

const UTF8VSTRING8 = new XUtf8StringType(8, true)
const UTF8VSTRING16 = new XUtf8StringType(16, true)
const UTF8VSTRING32 = new XUtf8StringType(32, true)
const UTF8VSTRING64 = new XUtf8StringType(64, true)
const UTF8VSTRING128 = new XUtf8StringType(128, true)

const UTF8TEXT = new XUtf8TextType()

const HTML = new XHtmlType()
const XML = new XXmlType()

const BOOLEAN = new XBooleanType()

const INT1 = new XIntegerType(1, -128, 127)
const INT2 = new XIntegerType(2, -32768, 32767)
const INT4 = new XIntegerType(4, -2147483648, 2147483647)
// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
const INT8 = new XIntegerType(8, -9223372036854775808, 9223372036854775807)

const FLOAT4 = new XFloatType(4)
const FLOAT8 = new XFloatType(8)

const INSTANT_S = new XInstantType(
  's',
  (ms) => ms / 1000,
  (s) => s * 1000
)

const INSTANT_MS = new XInstantType('ms')

const INSTANT_US = new XInstantType(
  'us',
  (ms) => ms * 1000,
  (us) => us / 1000
)

const INSTANT_NS = new XInstantType(
  'ns',
  (ms) => ms * 1000000,
  (ns) => ns / 1000000
)

const DURATION_S = new XDurationType('s', 1)
const DURATION_MS = new XDurationType('ms', 1000)
const DURATION_US = new XDurationType('us', 1000000)
const DURATION_NS = new XDurationType('ns', 1000000000)

const DATETIME = new XDateTimeType()
const DATE = new XDateType()

const LOCALDATETIME = new XLocalDateTimeType()
const LOCALDATE = new XLocalDateType()

const JSON_TYPE = new XJsonType() // use `_TYPE` to prevent conflict with global JSON
const JSONARRAY = new XJsonArrayType()
const JSONOBJECT = new XJsonObjectType()

const NOTIFICATION_LEVEL = new XEnumType<XNotificationLevel>('notification_level', [
  XNotificationLevel.NONE,
  XNotificationLevel.SUCCESS,
  XNotificationLevel.INFO,
  XNotificationLevel.NOTICE,
  XNotificationLevel.WARNING,
  XNotificationLevel.PRIMARY,
  XNotificationLevel.SECONDARY
])

const NOTIFICATION_TYPE = new XEnumType<XNotificationType>('notification_type', [
  XNotificationType.POST,
  XNotificationType.TASK,
  XNotificationType.REQUEST
])

const POST_LEVEL = new XEnumType<XPostLevel>('post_level', [
  XPostLevel.NONE,
  XPostLevel.SUCCESS,
  XPostLevel.INFO,
  XPostLevel.NOTICE,
  XPostLevel.WARNING,
  XPostLevel.PRIMARY,
  XPostLevel.SECONDARY
])

const POST_TYPE = new XEnumType<XPostType>('post_type', [XPostType.MESSAGE, XPostType.EVENT])

const REQUEST_STATUS = new XEnumType<XRequestStatus>('request_status', [
  XRequestStatus.REQUESTED,
  XRequestStatus.APPROVED,
  XRequestStatus.REJECTED
])

const SELF_ID = new XIDType('self')

const BLOB_ID = new XIDType('blob')
const DATABASE_ID = new XIDType('database')
const EVENT_ID = new XIDType('event')
const FIELD_ID = new XIDType('field')
const GROUP_ID = new XIDType('group')
const LOG_ID = new XIDType('log')
const POST_ID = new XIDType('post')
const RECORD_ID = new XIDType('record')
const STORE_ID = new XIDType('store')
const TASK_ID = new XIDType('task')
const TEAM_ID = new XIDType('team')
const USER_ID = new XIDType('user')

const TYPE = new XTypeType()

const of = function (s: string): XType<unknown> {
  return TYPE_MAP[s.toLowerCase()]
}

const listOf = function <T>(t: XType<T>): XListType<T> {
  return TYPE_MAP['list_' + t.name] as XListType<T>
}

const setOf = function <T>(t: XType<T>): XSetType<T> {
  return TYPE_MAP['set_' + t.name] as XSetType<T>
}

export const XTypes = Object.freeze({
  ASCIISTRING1,
  ASCIISTRING2,
  ASCIISTRING4,
  ASCIISTRING8,
  ASCIISTRING16,
  ASCIISTRING32,
  ASCIISTRING64,
  ASCIISTRING128,
  ASCIISTRING256,
  ASCIISTRING,

  ASCIIVSTRING8,
  ASCIIVSTRING16,
  ASCIIVSTRING32,
  ASCIIVSTRING64,
  ASCIIVSTRING128,
  ASCIIVSTRING256,

  ASCIITEXT,

  UTF8STRING1,
  UTF8STRING2,
  UTF8STRING4,
  UTF8STRING8,
  UTF8STRING16,
  UTF8STRING32,
  UTF8STRING64,
  UTF8STRING128,
  UTF8STRING,

  UTF8VSTRING8,
  UTF8VSTRING16,
  UTF8VSTRING32,
  UTF8VSTRING64,
  UTF8VSTRING128,

  UTF8TEXT,

  HTML,
  XML,

  BOOLEAN,

  INT1,
  INT2,
  INT4,
  INT8,

  FLOAT4,
  FLOAT8,

  JSON: JSON_TYPE,
  JSONOBJECT,
  JSONARRAY,

  DATETIME,
  DATE,
  LOCALDATETIME,
  LOCALDATE,

  INSTANT_S,
  INSTANT_MS,
  INSTANT_US,
  INSTANT_NS,

  DURATION_S,
  DURATION_MS,
  DURATION_US,
  DURATION_NS,

  NOTIFICATION_LEVEL,
  NOTIFICATION_TYPE,
  POST_LEVEL,
  POST_TYPE,
  REQUEST_STATUS,

  SELF_ID,
  BLOB_ID,
  DATABASE_ID,
  EVENT_ID,
  FIELD_ID,
  GROUP_ID,
  LOG_ID,
  POST_ID,
  RECORD_ID,
  STORE_ID,
  TASK_ID,
  TEAM_ID,
  USER_ID,

  TYPE,

  // TODO this will work for now but they need better implementations
  WALL_ID: ASCIIVSTRING32,
  UUID: ASCIIVSTRING32,

  of,
  listOf,
  setOf
})

const map: Record<string, XType<unknown>> = {}

Object.values(XTypes).forEach((type) => {
  if (!(type instanceof XType)) return // skip utility functions

  // store the type under both name and nameSafe (may be the same)
  map[type.name] = map[type.nameSafe] = type

  const listType = new XListType<unknown>(type)
  const setType = new XSetType<unknown>(type)

  // store the list and set collection types of each type under safe and unsafe wrapped safe and unsafe names
  map[`list(${type.name})`] = map[`list(${type.nameSafe})`] = listType
  map[`list_${type.name}`] = map[`list_${type.nameSafe}`] = listType

  map['set(' + type.name + ')'] = map['set(' + type.nameSafe + ')'] = setType
  map['set_' + type.name] = map['set_' + type.nameSafe] = setType
})

const TYPE_MAP: Record<string, XType<unknown>> = Object.freeze(map)
