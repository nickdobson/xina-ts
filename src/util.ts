import { isNumber, isString, round } from 'lodash'

import Sugar from 'sugar'

import type { XSelectResponse } from '.'

export const ISO8601_DATE = '{yyyy}-{MM}-{dd}'
export const ISO8601_LOCALDATETIME = `${ISO8601_DATE}T{HH}:{mm}:{ss}.{SSS}`
export const ISO8601_DATETIME = `${ISO8601_LOCALDATETIME}{Z}`

export const trustIs = <T>(_v: unknown): _v is T => true

export const isSimpleObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

export const checkString = (value: unknown, name = 'value'): string => {
  if (isString(value)) return value
  throw Error(`${name} is not a string: ${value}`)
}

export const checkOptionalString = (value?: unknown, name = 'value'): string | undefined => {
  if (value == null) return undefined
  if (isString(value)) return value
  throw Error(`${name} is not a string: ${value}`)
}

export const checkSimpleObject = (v: unknown, name = 'value'): Record<string, unknown> => {
  if (isSimpleObject(v)) return v
  throw Error(`${name} is not a string: ${v}`)
}

export const splitRest = function (s: string, split: string, limit = 1): string[] {
  if (limit === 1) return [s]
  const parts = s.split(split)

  if (!limit) return parts

  return [...Sugar.Array.to(parts, limit - 1), Sugar.Array.from(parts, limit - 1).join(split)]
}

export const sortKeys = function (obj: unknown[] | Record<string, unknown>): unknown[] | Record<string, unknown> {
  if (obj instanceof Array) return obj.map((v) => sortKeysUnsafely(v))

  if (obj instanceof Object) {
    const sorted: Record<string, unknown> = {}
    Object.keys(obj)
      .sort()
      .forEach((k) => (sorted[k] = sortKeysUnsafely(obj[k])))
    return sorted
  }

  return obj
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sortKeysUnsafely = function (obj: any): any {
  if (obj instanceof Array) return obj.map((v) => sortKeysUnsafely(v))

  if (obj instanceof Object) {
    const sorted: Record<string, unknown> = {}
    Object.keys(obj)
      .sort()
      .forEach((k) => (sorted[k] = sortKeysUnsafely(obj[k])))
    return sorted
  }

  return obj
}

export function parseDateTime(v: number | string | Date) {
  if (isNumber(v)) return v

  if (isString(v)) {
    if (v.match(/^-?\d+$/)) return parseInt(v)
    // non-integer string must be parsed as timestamp
    v = Sugar.Date.create(v)
  }

  if (v instanceof Date) {
    if (!Sugar.Date.isValid(v)) throw new TypeError(`invalid datetime: ${v}`)
    return v.getTime()
  }

  throw new Error(`invalid datetime: ${v}`)
}

export function downloadAs(url: string, filename: string) {
  const a = document.createElement('a')

  a.href = url
  a.download = filename || 'download'

  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.removeEventListener('click', clickHandler)
    }, 150)
  }

  a.addEventListener('click', clickHandler, false)
  a.click()
}

export function formatTimezone(date: number | string | Date = new Date()) {
  if (!(date instanceof Date)) date = Sugar.Date.create(date)
  if (!Sugar.Date.isValid(date)) return null

  const tzo = Sugar.Date.isUTC(date) ? 0 : date.getTimezoneOffset()
  const tzoHours = Sugar.Number.pad(Math.abs(tzo / 60), 2)
  const tzoMinutes = Sugar.Number.pad(Math.abs(tzo % 60), 2)
  let tz = 'UTC'
  if (tzo > 0) tz += '-' + tzoHours + ':' + tzoMinutes
  else if (tzo < 0) tz += '+' + tzoHours + ':' + tzoMinutes

  return tz
}

// Format a number by rounding to a certain decimal place, or in scientific notation if it's too small
export function formatValue(n: number, places: number) {
  return '' + (round(n, places) || (n && n.toExponential(places)))
}

export function isCyclic(obj: object) {
  const seenObjects: object[] = []

  function detect(o: unknown) {
    if (!o || !isSimpleObject(o)) return false

    if (seenObjects.indexOf(o) !== -1) return true

    seenObjects.push(o)

    for (const key in o) {
      if (Object.prototype.hasOwnProperty.call(o, key) && detect(o[key])) {
        console.log(obj, 'cycle at ' + key)
        return true
      }
    }

    return false
  }

  return detect(obj)
}

/**
 * @param {*} s The value.
 *
 * @returns `true` if the value is an empty string (`''`), `false` otherwise
 *
 * @description
 * Returns `true` if the value is an empty string (`''`), `false` otherwise
 */
function isEmptyString(s: unknown): s is '' {
  return s instanceof String && !s.trim().length
}

/**
 * @param value The value
 * @param name  The name of the value for the Error message if thrown
 *
 * @throws Error if the value is `null` or `undefined`
 *
 * @description
 * Throws a TypeError if the provided value is `null`, `undefined`, or an empty string (`''`)
 */
export function assertPresent(value: unknown, name = 'value') {
  if (value == null || (value instanceof String && value.length === 0)) {
    throw new Error(`${name} cannot be null, undefined, or an empty string`)
  }
}

/**
 * @param v The value.
 *
 * @returns The alias.
 *
 * @description
 * Converts the provided value into a String. Returns `null` if the value is `null`, `undefined`, or an empty
 * string (`''`). Otherwise returns the string representation of the value.
 */
export function toString(v: unknown) {
  if (v == null || isEmptyString(v)) return null
  return String(v)
}

export function assertNonEmptyString(s: string, name = 'value') {
  if (!s.trim().length) throw Error(`${name} cannot be an empty string`)
  return s
}

export function assertNonEmptyArray<T>(arr: T[], name = 'value'): T[] {
  if (!arr.length) throw Error(`${name} cannot be an empty array`)
  return arr
}

export function mapResultSet<T>(rs: XSelectResponse) {
  return rs.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    rs.header.forEach((col, i) => {
      if (row[i] !== null) obj[col.name] = row[i]
    })
    return obj as T
  })
}

const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const numeric = '0123456789'
const alphanumeric = alpha + numeric

/**
 * @ngdoc method
 * @name xo.util#randomString
 * @methodOf xo.util
 * @function
 *
 * @param   {number}  length   The length of the string to generate.
 * @param   {string=} possible The possible characters.
 *
 * @returns {string}  The generated string.
 *
 * @description
 * Returns a random string of the specified length, using the characters in the possible string. If a possible
 * string is not provided an alphanumeric string is used.
 */
export function randomString(length: number, possible = alphanumeric) {
  possible = possible || alphanumeric
  let text = ''
  for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

/**
 * @param length The length of the string to generate
 *
 * @returns the generated string.
 *
 * @description
 * Returns a random string of the specified length containing numeric characters (0-9).
 */
export function randomNumeric(length: number) {
  return randomString(length, numeric)
}

/**
 * @param length the length of the string to generate
 *
 * @returns the generated string
 *
 * @description
 * Returns a random string of the specified length containing alphabetic characters (A-Z, a-z).
 */
export function randomAlpha(length: number) {
  return randomString(length, alpha)
}

/**
 * @param length the length of the string to generate
 *
 * @returns the generated string
 *
 * @description
 * Returns a random string of the specified length containing alphanumeric characters (A-Z, a-z, and 0-9).
 */
export function randomAlphanumeric(length: number) {
  return randomString(length, alphanumeric)
}

/**
 * @returns the element ID
 *
 * @description
 * Returns a random unique ID for an element.
 */
export function uniqueElementId() {
  return randomAlphanumeric(16)
}

export function uuid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (String(1e7) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  )
}

/**
 * @param s the string
 *
 * @returns the normalized string
 *
 * @description
 * Normalizes the provided string. A normalized string has any leading or trailing whitespace trimmed and all
 * internal whitespace reduced to a single space.
 */
export function normalize(s: string) {
  if (!isString(s)) throw new TypeError('s must be a string')
  return s.trim().replace(/\s+/g, ' ')
}

export function pluralize(v: number, base: string, plural = 's', single = '') {
  return `${v} ${base}${v === 1 ? single : plural}`
}

export function toHHMMSS(n: number, pretty = false) {
  const hours = Math.floor(n / 3600)
  const minutes = Math.floor((n - hours * 3600) / 60)
  const seconds = Sugar.Number.round(n - hours * 3600 - minutes * 60, 6)

  if (pretty) return hours + ' hr, ' + minutes + ' min, ' + Sugar.Number.round(seconds, 3) + ' sec'

  const pad = (v: number) => (v < 10 ? '0' + v : v)

  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
}

export function toDDHHMMSS(n: number, pretty = false, short = false) {
  const day = 24 * 60 * 60
  const hour = 60 * 60
  const minute = 60

  const days = Math.floor(n / day)
  const hours = Math.floor((n - days * day) / hour)
  const minutes = Math.floor((n - days * day - hours * hour) / minute)
  const seconds = n - days * day - hours * hour - minutes * minute

  if (pretty) {
    return (
      (!short || days ? days + 'd ' : '') +
      (!short || hours ? hours + 'h ' : '') +
      (!short || minutes ? minutes + 'm ' : '') +
      (!short || seconds ? Sugar.Number.round(seconds, short ? 0 : 3) + 's' : '')
    )
  }

  const pad = (v: number) => (v < 10 ? '0' + v : v)

  return days + ':' + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
}

export class XRange {
  private min: number

  private max: number

  constructor(v1: number, v2: number) {
    this.min = Math.min(v1, v2)
    this.max = Math.max(v1, v2)
  }

  getMin(): number {
    return this.min
  }

  getMax(): number {
    return this.max
  }

  contains(v: number | XRange) {
    if (v instanceof XRange) return this.min <= v.min && v.max <= this.max
    return this.min <= v && v <= this.max
  }

  overlaps(v: number | XRange) {
    if (v instanceof XRange) return this.contains(v.min) || this.contains(v.max)
    return this.min <= v && v <= this.max
  }

  adjacent(v: number | XRange) {
    if (v instanceof XRange) return this.min - 1 === v.max || v.min === this.max + 1
    return this.min - 1 === v || v === this.max + 1
  }

  merge(v: number | XRange) {
    if (v instanceof XRange) {
      this.min = Math.min(this.min, v.min)
      this.max = Math.max(this.max, v.max)
    } else {
      this.min = Math.min(this.min, v)
      this.max = Math.max(this.max, v)
    }
  }

  remove(v: number | XRange) {
    if (!this.overlaps(v)) return [this]

    if (v instanceof XRange) {
      if (v.min <= this.min && this.max <= v.max) return []

      const parts = []

      if (this.min < v.min) parts.push(XRange.of(this.min, v.min - 1))
      if (this.max > v.max) parts.push(XRange.of(v.max + 1, this.max))

      return parts
    } else {
      if (this.min === v) return [XRange.of(this.min + 1, this.max)]
      if (this.max === v) return [XRange.of(this.min, this.max - 1)]
      return [XRange.of(this.min, v - 1), XRange.of(v + 1, this.max)]
    }
  }

  clone() {
    return new XRange(this.min, this.max)
  }

  toString() {
    return `${this.min}-${this.max}`
  }

  toArray() {
    const arr = []
    for (let i = this.min; this.min <= this.max; i++) arr.push(i)
    return arr
  }

  /**
   * @param s The string to parse.
   *
   * @returns The parsed value or range.
   *
   * @description
   * Parses the provided string as either a single integer value or integer range. If the string contains a single
   * integer value, the value is returned as a number. If the string contains a dash delimited range, an array is
   * returned containing the minimum of the range followed by the maximum. Integer values may be negative. If the
   * string is undefined, null, empty, or not a valid integer or range, returns null.
   *
   * For example:
   *  '1'     => 1
   *  '0-5'   => [0, 5]
   *  '-5--9' => [-9, -5]
   *  '1.0'   => null
   *  '1-'    => null
   */
  static parse(s: string) {
    const match = s.replace(/\s/g, '').match(/^(-?\d+)(-(-?\d+))?$/)

    if (!match) throw Error(`Invalid range format: ${s}`)

    if (!match[3] === undefined) {
      const first = parseInt(match[1])
      const last = parseInt(match[3])

      if (first === last) return first

      return XRange.of(Math.min(first, last), Math.max(first, last))
    }

    return parseInt(match[1])
  }

  static of(v1: number, v2: number): number | XRange {
    if (v1 === v2) return v1
    return new XRange(v1, v2)
  }
}

export default class XRangeSet {
  private values: Set<number> = new Set()

  private ranges: Array<XRange> = []

  constructor(ranges: number | XRange | XRangeSet | Array<number | XRange | XRangeSet>) {
    this.values = new Set()
    this.ranges = []

    this.merge(ranges)
  }

  contains(v: number | XRange | XRangeSet) {
    if (v instanceof XRangeSet) {
      for (const r of v.ranges) if (!this.contains(r)) return false
      for (const n of v.values) if (!this.contains(n)) return false

      return true
    }

    if (v instanceof XRange) {
      return this.ranges.some((range) => range.contains(v))
    }

    return this.values.has(v) || this.ranges.some((range) => range.contains(v))
  }

  merge(v: number | XRange | XRangeSet | Array<number | XRange | XRangeSet>, reduce = true) {
    if (v instanceof Array) {
      v.forEach((range) => this.merge(range, false))
    } else if (v instanceof XRangeSet) {
      // add any values not in ranges to this.values set
      v.values.forEach((value) => this.mergeNumber(value))

      // merge ranges into this.ranges if possible, otherwise add to this.ranges
      v.ranges.forEach((range) => this.mergeRange(range))
    } else if (v instanceof XRange) {
      this.mergeRange(v)
    } else {
      this.mergeNumber(v)
    }

    if (reduce) this.reduce()
  }

  mergeNumber(n: number) {
    this.values.add(n)
  }

  mergeRange(range: XRange) {
    for (const r of this.ranges) {
      if (r.overlaps(range) || r.adjacent(range)) {
        r.merge(range)
        return
      }
    }

    this.ranges.push(range.clone())
  }

  remove(v: number | XRange | XRangeSet | Array<number | XRange | XRangeSet>, reduce = true) {
    if (v instanceof Array) {
      v.forEach((range) => this.remove(range, false))
    } else if (v instanceof XRangeSet) {
      // remove any values not in ranges
      v.values.forEach((value) => this.removeNumber(value))

      // remove ranges from this.ranges
      v.ranges.forEach((range) => this.removeRange(range))
    } else if (v instanceof XRange) {
      this.removeRange(v)
    } else {
      this.removeNumber(v)
    }

    if (reduce) this.reduce()
  }

  removeNumber(n: number) {
    this.values.delete(n)

    this.ranges = this.ranges
      .map((range) => range.remove(n))
      .flat()
      .map((range) => {
        if (range instanceof XRange) {
          return range
        } else {
          this.values.add(range)
          return null
        }
      })
      .filter((v): v is XRange => Boolean(v))
  }

  removeRange(r: XRange) {
    r.toArray().forEach((v) => this.values.delete(v))

    this.ranges = this.ranges
      .map((range) => range.remove(r))
      .flat()
      .map((range) => {
        if (range instanceof XRange) {
          return range
        } else {
          this.values.add(range)
          return null
        }
      })
      .filter((v): v is XRange => Boolean(v))
  }

  reduce() {
    const sorted = [...this.values].sort()

    let last = null
    const r = []

    for (const n of sorted) {
      if (r.length && last != null && n !== last + 1) {
        if (r.length > 2) {
          this.mergeRange(new XRange(r[0], last))
          r.forEach((v) => this.values.delete(v))
        }
        r.length = 0
      }
      r.push(n)
      last = n
    }

    if (r.length > 2 && last != null) {
      this.mergeRange(new XRange(r[0], last))
      r.forEach((v) => this.values.delete(v))
    }
  }

  clone() {
    return new XRangeSet(this)
  }

  toString() {
    return [...this.values, ...this.ranges].sort((v) => (v instanceof XRange ? v.getMin() : v)).join(',')
  }

  toArray() {
    return [...this.values, ...this.ranges.map((r) => r.toArray())].flat().sort()
  }

  static parse(s: string) {
    return new XRangeSet(
      s
        .replace(/\s/g, '')
        .split(',')
        .map((part) => XRange.parse(part))
    )
  }
}
