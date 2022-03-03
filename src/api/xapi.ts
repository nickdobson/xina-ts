import {
  XCountRowsExpression,
  XExistsExpression,
  XFetchPostsAction,
  XFunctionExpression,
  XGroupConcatExpression
} from '..'

import { XAlterUserObjectsAction } from './action/alter'
import { XCancelAction } from './action/cancel'
import { XCleanAction } from './action/clean'
import { XDeleteAction } from './action/delete'
import { XDestroyAction } from './action/destroy'
import { XEditAction } from './action/edit'
import {
  XFetchRecordsAction,
  XFetchLogsAction,
  XFetchTasksAction,
  XFetchRequestsAction,
  XFetchNotificationsAction,
  XFetchKeysAction,
  XFetchUsersAction,
  XFetchThreadsAction,
  XFetchFollowsAction,
  XFetchTeamSubscriptionsAction,
  XFetchUserSubscriptionsAction
} from './action/fetch'
import { XGrantSuperAction, XGrantGroupsAction, XGrantDatabasesAction } from './action/grant'
import { XIfAction } from './action/if'
import { XInsertAction } from './action/insert'
import { XJoinDatabasesAction, XJoinGroupsAction, XJoinUsersAction } from './action/join'
import { XLeaveDatabasesAction, XLeaveGroupsAction, XLeaveUsersAction } from './action/leave'
import { XLinkAction } from './action/link'
import { XMoveAction } from './action/move'
import { XPauseAction } from './action/pause'
import { XPostAction } from './action/post'
import { XResumeAction } from './action/resume'
import { XRevokeSuperAction, XRevokeGroupsAction, XRevokeDatabasesAction } from './action/revoke'
import { XRunAction } from './action/run'
import { XSchemaAction } from './action/schema'
import { XSelectAction } from './action/select'
import { XStoreAction } from './action/store'
import { XTagAction } from './action/tag'
import { XTeamsAction } from './action/teams'
import { XTrashAction } from './action/trash'
import { XUnlinkAction } from './action/unlink'
import { XUntagAction } from './action/untag'
import { XUpdateAction } from './action/update'
import { XUpdateExpressionAction } from './action/update-expression'
import { XVersionAction } from './action/version'
import { XViewNotificationsAction, XViewTasksAction } from './action/view'
import { toExpression, XAliasExpression, XExpressionable } from './expression'
import { XOrderTerm } from './order-term'
import { XSelect } from './select'
import { toSource } from './source'

export const xapi = {
  expr: toExpression,
  alias: (alias: string) => XAliasExpression.of(alias),
  countRows: () => new XCountRowsExpression(),
  exists: (select: XSelect) => XExistsExpression.of(select),
  groupConcat: () => new XGroupConcatExpression(),
  func: {
    if: (expr1: XExpressionable, expr2: XExpressionable, expr3: XExpressionable) =>
      XFunctionExpression.of('IF', expr1, expr2, expr3),
    ifnull: (expr1: XExpressionable, expr2: XExpressionable) => XFunctionExpression.of('IFNULL', expr1, expr2),
    nullif: (expr1: XExpressionable, expr2: XExpressionable) => XFunctionExpression.of('NULLIF', expr1, expr2),
    coalesce: (...expr: XExpressionable[]) => XFunctionExpression.of('COALESCE', ...expr),
    greatest: (...expr: XExpressionable[]) => XFunctionExpression.of('GREATEST', ...expr),
    interval: (...n: XExpressionable[]) => XFunctionExpression.of('INTERVAL', ...n),
    least: (...expr: XExpressionable[]) => XFunctionExpression.of('LEAST', ...expr),
    ascii: (str: XExpressionable) => XFunctionExpression.of('ASCII', str),
    bin: (n: XExpressionable) => XFunctionExpression.of('BIN', n),
    bitLength: (str: XExpressionable) => XFunctionExpression.of('BIT_LENGTH', str),
    char: (...n: XExpressionable[]) => XFunctionExpression.of('CHAR', ...n),
    charLength: (str: XExpressionable) => XFunctionExpression.of('CHAR_LENGTH', str),
    concat: (str: XExpressionable, ...strN: XExpressionable[]) => XFunctionExpression.of('CONCAT', str, ...strN),
    concatWs: (separator: XExpressionable, str: XExpressionable, ...strN: XExpressionable[]) =>
      XFunctionExpression.of('CONCAT_WS', separator, str, ...strN),
    elt: (n: XExpressionable, ...str: XExpressionable[]) => XFunctionExpression.of('ELT', n, ...str),
    field: (str: XExpressionable, ...strN: XExpressionable[]) => XFunctionExpression.of('FIELD', str, ...strN),
    findInSet: (str: XExpressionable, strlist: XExpressionable) => XFunctionExpression.of('FIND_IN_SET', str, strlist),
    format: (x: XExpressionable, d: XExpressionable, locale?: XExpressionable) =>
      XFunctionExpression.of('FORMAT', x, d, locale),
    fromBase64: (str: XExpressionable) => XFunctionExpression.of('FROM_BASE64', str),
    hex: (v: XExpressionable) => XFunctionExpression.of('HEX', v),
    insert: (str: XExpressionable, pos: XExpressionable, len: XExpressionable, newstr: XExpressionable) =>
      XFunctionExpression.of('INSERT', str, pos, len, newstr),
    instr: (str: XExpressionable, substr: XExpressionable) => XFunctionExpression.of('INSTR', str, substr),
    left: (str: XExpressionable, len: XExpressionable) => XFunctionExpression.of('LEFT', str, len),
    length: (str: XExpressionable) => XFunctionExpression.of('LENGTH', str),
    locate: (substr: XExpressionable, str: XExpressionable, pos?: XExpressionable) =>
      XFunctionExpression.of('LOCATE', substr, str, pos),
    lower: (str: XExpressionable) => XFunctionExpression.of('LOWER', str),
    lpad: (str: XExpressionable, len: XExpressionable, pad: XExpressionable) =>
      XFunctionExpression.of('LPAD', str, len, pad),
    ltrim: (str: XExpressionable) => XFunctionExpression.of('LTRIM', str),
    oct: (n: XExpressionable) => XFunctionExpression.of('OCT', n),
    quote: (str: XExpressionable) => XFunctionExpression.of('QUOTE', str),
    repeat: (str: XExpressionable, count: XExpressionable) => XFunctionExpression.of('REPEAT', str, count),
    replace: (str: XExpressionable, from: XExpressionable, to: XExpressionable) =>
      XFunctionExpression.of('REPLACE', str, from, to),
    reverse: (str: XExpressionable) => XFunctionExpression.of('REVERSE', str),
    right: (str: XExpressionable, len: XExpressionable) => XFunctionExpression.of('RIGHT', str, len),
    rpad: (str: XExpressionable, len: XExpressionable, pad: XExpressionable) =>
      XFunctionExpression.of('RPAD', str, len, pad),
    rtrim: (str: XExpressionable) => XFunctionExpression.of('RTRIM', str),
    soundex: (str: XExpressionable) => XFunctionExpression.of('SOUNDEX', str),
    space: (n: XExpressionable) => XFunctionExpression.of('SPACE', n),
    strcmp: (str1: XExpressionable, str2: XExpressionable) => XFunctionExpression.of('STRCMP', str1, str2),
    substring: (str: XExpressionable, pos: XExpressionable, len?: XExpressionable) =>
      XFunctionExpression.of('SUBSTRING', str, pos, len),
    substringIndex: (str: XExpressionable, delim: XExpressionable, count: XExpressionable) =>
      XFunctionExpression.of('SUBSTRING_INDEX', str, delim, count),
    toBase64: (str: XExpressionable) => XFunctionExpression.of('TO_BASE64', str),
    trim: (str: XExpressionable) => XFunctionExpression.of('TRIM', str),
    unhex: (str: XExpressionable) => XFunctionExpression.of('UNHEX', str),
    upper: (str: XExpressionable) => XFunctionExpression.of('UPPER', str),
    abs: (x: XExpressionable) => XFunctionExpression.of('ABS', x),
    acos: (x: XExpressionable) => XFunctionExpression.of('ACOS', x),
    asin: (x: XExpressionable) => XFunctionExpression.of('ASIN', x),
    atan: (x: XExpressionable) => XFunctionExpression.of('ATAN', x),
    atan2: (y: XExpressionable, x: XExpressionable) => XFunctionExpression.of('ATAN2', y, x),
    ceiling: (x: XExpressionable) => XFunctionExpression.of('CEILING', x),
    conv: (n: XExpressionable, from: XExpressionable, to: XExpressionable) =>
      XFunctionExpression.of('CONV', n, from, to),
    cos: (x: XExpressionable) => XFunctionExpression.of('COS', x),
    cot: (x: XExpressionable) => XFunctionExpression.of('COT', x),
    crc32: (expr: XExpressionable) => XFunctionExpression.of('CRC32', expr),
    degrees: (x: XExpressionable) => XFunctionExpression.of('DEGREES', x),
    exp: (x: XExpressionable) => XFunctionExpression.of('EXP', x),
    floor: (x: XExpressionable) => XFunctionExpression.of('FLOOR', x),
    ln: (x: XExpressionable) => XFunctionExpression.of('LN', x),
    log: (b: XExpressionable, x: XExpressionable) => XFunctionExpression.of('LOG', b, x),
    log2: (x: XExpressionable) => XFunctionExpression.of('LOG2', x),
    log10: (x: XExpressionable) => XFunctionExpression.of('LOG10', x),
    pi: () => XFunctionExpression.of('PI'),
    pow: (x: XExpressionable, y: XExpressionable) => XFunctionExpression.of('POW', x, y),
    radians: (x: XExpressionable) => XFunctionExpression.of('RADIANS', x),
    rand: (n?: XExpressionable) => XFunctionExpression.of('RAND', n),
    round: (x: XExpressionable, d: XExpressionable) => XFunctionExpression.of('ROUND', x, d),
    sign: (x: XExpressionable) => XFunctionExpression.of('SIGN', x),
    sin: (x: XExpressionable) => XFunctionExpression.of('SIN', x),
    sqrt: (x: XExpressionable) => XFunctionExpression.of('SQRT', x),
    tan: (x: XExpressionable) => XFunctionExpression.of('TAN', x),
    truncate: (x: XExpressionable, d: XExpressionable) => XFunctionExpression.of('TRUNCATE', x, d),
    adddate: (expr: XExpressionable, days: XExpressionable) => XFunctionExpression.of('ADDDATE', expr, days),
    addtime: (expr1: XExpressionable, expr2: XExpressionable) => XFunctionExpression.of('ADDTIME', expr1, expr2),
    convertTz: (dt: XExpressionable, from: XExpressionable, to: XExpressionable) =>
      XFunctionExpression.of('CONVERT_TZ', dt, from, to),
    curdate: () => XFunctionExpression.of('CURDATE'),
    curtime: (fsp?: XExpressionable) => XFunctionExpression.of('CURTIME', fsp),
    date: (expr: XExpressionable) => XFunctionExpression.of('DATE', expr),
    datediff: (expr1: XExpressionable, expr2: XExpressionable) => XFunctionExpression.of('DATEDIFF', expr1, expr2),
    dateFormat: (date: XExpressionable, format: XExpressionable) => XFunctionExpression.of('DATE_FORMAT', date, format),
    dayname: (date: XExpressionable) => XFunctionExpression.of('DAYNAME', date),
    dayofmonth: (date: XExpressionable) => XFunctionExpression.of('DAYOFMONTH', date),
    dayofweek: (date: XExpressionable) => XFunctionExpression.of('DAYOFWEEK', date),
    dayofyear: (date: XExpressionable) => XFunctionExpression.of('DAYOFYEAR', date),
    fromDays: (n: XExpressionable) => XFunctionExpression.of('FROM_DAYS', n),
    fromUnixtime: (unixTimestamp: XExpressionable, format?: XExpressionable) =>
      XFunctionExpression.of('FROM_UNIXTIME', unixTimestamp, format),
    hour: (time: XExpressionable) => XFunctionExpression.of('HOUR', time),
    lastDay: (date: XExpressionable) => XFunctionExpression.of('LAST_DAY', date),
    makedate: (year: XExpressionable, dayofyear: XExpressionable) =>
      XFunctionExpression.of('MAKEDATE', year, dayofyear),
    maketime: (hour: XExpressionable, minute: XExpressionable, second: XExpressionable) =>
      XFunctionExpression.of('MAKETIME', hour, minute, second),
    microsecond: (expr: XExpressionable) => XFunctionExpression.of('MICROSECOND', expr),
    minute: (time: XExpressionable) => XFunctionExpression.of('MINUTE', time),
    month: (date: XExpressionable) => XFunctionExpression.of('MONTH', date),
    monthname: (date: XExpressionable) => XFunctionExpression.of('MONTHNAME', date),
    now: (fsp?: XExpressionable) => XFunctionExpression.of('NOW', fsp),
    periodAdd: (p: XExpressionable, n: XExpressionable) => XFunctionExpression.of('PERIOD_ADD', p, n),
    periodDiff: (p1: XExpressionable, p2: XExpressionable) => XFunctionExpression.of('PERIOD_DIFF', p1, p2),
    quarter: (date: XExpressionable) => XFunctionExpression.of('QUARTER', date),
    second: (time: XExpressionable) => XFunctionExpression.of('SECOND', time),
    secToTime: (seconds: XExpressionable) => XFunctionExpression.of('SEC_TO_TIME', seconds),
    strToDate: (str: XExpressionable, format: XExpressionable) => XFunctionExpression.of('STR_TO_DATE', str, format),
    subdate: (expr: XExpressionable, days: XExpressionable) => XFunctionExpression.of('SUBDATE', expr, days),
    subtime: (expr1: XExpressionable, expr2: XExpressionable) => XFunctionExpression.of('SUBTIME', expr1, expr2),
    sysdate: (fsp?: XExpressionable) => XFunctionExpression.of('SYSDATE', fsp),
    time: (expr: XExpressionable) => XFunctionExpression.of('TIME', expr),
    timediff: (expr1: XExpressionable, expr2: XExpressionable) => XFunctionExpression.of('TIMEDIFF', expr1, expr2),
    timestamp: (expr1: XExpressionable, expr2?: XExpressionable) => XFunctionExpression.of('TIMESTAMP', expr1, expr2),
    timeFormat: (time: XExpressionable, format: XExpressionable) => XFunctionExpression.of('TIME_FORMAT', time, format),
    timeToSec: (time: XExpressionable) => XFunctionExpression.of('TIME_TO_SEC', time),
    toDays: (date: XExpressionable) => XFunctionExpression.of('TO_DAYS', date),
    toSeconds: (expr: XExpressionable) => XFunctionExpression.of('TO_SECONDS', expr),
    unixTimestamp: (date?: XExpressionable) => XFunctionExpression.of('UNIX_TIMESTAMP', date),
    utcDate: () => XFunctionExpression.of('UTC_DATE'),
    utcTime: (fsp?: XExpressionable) => XFunctionExpression.of('UTC_TIME', fsp),
    utcTimestamp: (fsp?: XExpressionable) => XFunctionExpression.of('UTC_TIMESTAMP', fsp),
    week: (date: XExpressionable, mode?: XExpressionable) => XFunctionExpression.of('WEEK', date, mode),
    weekday: (date: XExpressionable) => XFunctionExpression.of('WEEKDAY', date),
    weekofyear: (date: XExpressionable) => XFunctionExpression.of('WEEKOFYEAR', date),
    year: (date: XExpressionable) => XFunctionExpression.of('YEAR', date),
    yearweek: (date: XExpressionable, mode?: XExpressionable) => XFunctionExpression.of('YEARWEEK', date, mode),
    avg: (expr: XExpressionable) => XFunctionExpression.of('AVG', expr),
    avgDistinct: (expr: XExpressionable) => XFunctionExpression.of('AVG_DISTINCT', expr),
    bitAnd: (expr: XExpressionable) => XFunctionExpression.of('BIT_AND', expr),
    bitOr: (expr: XExpressionable) => XFunctionExpression.of('BIT_OR', expr),
    bitXor: (expr: XExpressionable) => XFunctionExpression.of('BIT_XOR', expr),
    count: (expr: XExpressionable) => XFunctionExpression.of('COUNT', expr),
    countDistinct: (expr: XExpressionable, ...exprN: XExpressionable[]) =>
      XFunctionExpression.of('COUNT_DISTINCT', expr, ...exprN),
    max: (expr: XExpressionable) => XFunctionExpression.of('MAX', expr),
    min: (expr: XExpressionable) => XFunctionExpression.of('MIN', expr),
    stddevPop: (expr: XExpressionable) => XFunctionExpression.of('STDDEV_POP', expr),
    stddevSamp: (expr: XExpressionable) => XFunctionExpression.of('STDDEV_SAMP', expr),
    sum: (expr: XExpressionable) => XFunctionExpression.of('SUM', expr),
    sumDistinct: (expr: XExpressionable) => XFunctionExpression.of('SUM_DISTINCT', expr),
    varPop: (expr: XExpressionable) => XFunctionExpression.of('VAR_POP', expr),
    varSamp: (expr: XExpressionable) => XFunctionExpression.of('VAR_SAMP', expr),
    jsonArray: (...val: XExpressionable[]) => XFunctionExpression.of('JSON_ARRAY', ...val),
    jsonArrayAppend: (jsonDoc: XExpressionable, path: XExpressionable, val: XExpressionable) =>
      XFunctionExpression.of('JSON_ARRAY_APPEND', jsonDoc, path, val),
    jsonArrayInsert: (jsonDoc: XExpressionable, path: XExpressionable, val: XExpressionable) =>
      XFunctionExpression.of('JSON_ARRAY_INSERT', jsonDoc, path, val),
    jsonContains: (target: XExpressionable, candidate: XExpressionable, path?: XExpressionable) =>
      XFunctionExpression.of('JSON_CONTAINS', target, candidate, path),
    jsonContainsPath: (jsonDoc: XExpressionable, oneOrAll: XExpressionable, ...path: XExpressionable[]) =>
      XFunctionExpression.of('JSON_CONTAINS_PATH', jsonDoc, oneOrAll, ...path),
    jsonDepth: (jsonDoc: XExpressionable) => XFunctionExpression.of('JSON_DEPTH', jsonDoc),
    jsonExtract: (jsonDoc: XExpressionable, ...path: XExpressionable[]) =>
      XFunctionExpression.of('JSON_EXTRACT', jsonDoc, ...path),
    jsonInsert: (jsonDoc: XExpressionable, path: XExpressionable, val: XExpressionable) =>
      XFunctionExpression.of('JSON_INSERT', jsonDoc, path, val),
    jsonKeys: (jsonDoc: XExpressionable, path?: XExpressionable) => XFunctionExpression.of('JSON_KEYS', jsonDoc, path),
    jsonLength: (jsonDoc: XExpressionable, path?: XExpressionable) =>
      XFunctionExpression.of('JSON_LENGTH', jsonDoc, path),
    jsonMergePatch: (jsonDoc: XExpressionable, ...jsonDocN: XExpressionable[]) =>
      XFunctionExpression.of('JSON_MERGE_PATCH', jsonDoc, ...jsonDocN),
    jsonMergePreserve: (jsonDoc: XExpressionable, ...jsonDocN: XExpressionable[]) =>
      XFunctionExpression.of('JSON_MERGE_PRESERVE', jsonDoc, ...jsonDocN),
    jsonObject: (key: XExpressionable, val: XExpressionable) => XFunctionExpression.of('JSON_OBJECT', key, val),
    jsonOverlaps: (jsonDoc1: XExpressionable, jsonDoc2: XExpressionable) =>
      XFunctionExpression.of('JSON_OVERLAPS', jsonDoc1, jsonDoc2),
    jsonPretty: (jsonVal: XExpressionable) => XFunctionExpression.of('JSON_PRETTY', jsonVal),
    jsonQuote: (str: XExpressionable) => XFunctionExpression.of('JSON_QUOTE', str),
    jsonRemove: (jsonDoc: XExpressionable, ...path: XExpressionable[]) =>
      XFunctionExpression.of('JSON_REMOVE', jsonDoc, ...path),
    jsonReplace: (jsonDoc: XExpressionable, path: XExpressionable, val: XExpressionable) =>
      XFunctionExpression.of('JSON_REPLACE', jsonDoc, path, val),
    jsonSearch: (
      jsonDoc: XExpressionable,
      oneOrAll: XExpressionable,
      searchStr: XExpressionable,
      escapeChar: XExpressionable,
      ...path: XExpressionable[]
    ) => XFunctionExpression.of('JSON_SEARCH', jsonDoc, oneOrAll, searchStr, escapeChar, ...path),
    jsonSet: (jsonDoc: XExpressionable, path: XExpressionable, val: XExpressionable) =>
      XFunctionExpression.of('JSON_SET', jsonDoc, path, val),
    jsonType: (jsonVal: XExpressionable) => XFunctionExpression.of('JSON_TYPE', jsonVal),
    jsonUnquote: (jsonVal: XExpressionable) => XFunctionExpression.of('JSON_UNQUOTE', jsonVal),
    jsonValid: (jsonVal: XExpressionable) => XFunctionExpression.of('JSON_VALID', jsonVal),
    getLock: (name: XExpressionable, timeout: XExpressionable) => XFunctionExpression.of('GET_LOCK', name, timeout),
    isFreeLock: (name: XExpressionable) => XFunctionExpression.of('IS_FREE_LOCK', name),
    isUsedLock: (name: XExpressionable) => XFunctionExpression.of('IS_USED_LOCK', name),
    releaseLock: (name: XExpressionable) => XFunctionExpression.of('RELEASE_LOCK', name),
    releaseAllLocks: () => XFunctionExpression.of('RELEASE_ALL_LOCKS'),
    lastInsertId: () => XFunctionExpression.of('LAST_INSERT_ID'),
    values: (col: XExpressionable) => XFunctionExpression.of('VALUES', col)
  } as const,
  src: toSource,
  asc: (e: XExpressionable) => XOrderTerm.ofAsc(e),
  desc: (e: XExpressionable) => XOrderTerm.ofDesc(e),
  select: () => new XSelect(),
  act: {
    alter: {
      users: {
        objects: () => new XAlterUserObjectsAction()
      } as const
    } as const,
    cancel: () => new XCancelAction(),
    clean: () => new XCleanAction(),
    create: {} as const,
    delete: () => new XDeleteAction(),
    destroy: () => new XDestroyAction(),
    edit: () => new XEditAction(),
    fetch: {
      follows: () => new XFetchFollowsAction(),
      keys: () => new XFetchKeysAction(),
      logs: () => new XFetchLogsAction(),
      notifications: () => new XFetchNotificationsAction(),
      posts: () => new XFetchPostsAction(),
      records: () => new XFetchRecordsAction(),
      requests: () => new XFetchRequestsAction(),
      tasks: () => new XFetchTasksAction(),
      teamSubs: () => new XFetchTeamSubscriptionsAction(),
      threads: () => new XFetchThreadsAction(),
      users: () => new XFetchUsersAction(),
      userSubs: () => new XFetchUserSubscriptionsAction()
    } as const,
    grant: {
      super: () => new XGrantSuperAction(),
      groups: () => new XGrantGroupsAction(),
      databases: () => new XGrantDatabasesAction()
    } as const,
    if: () => new XIfAction(),
    insert: () => new XInsertAction(),
    join: {
      databases: () => new XJoinDatabasesAction(),
      groups: () => new XJoinGroupsAction(),
      users: () => new XJoinUsersAction()
    } as const,
    leave: {
      databases: () => new XLeaveDatabasesAction(),
      groups: () => new XLeaveGroupsAction(),
      users: () => new XLeaveUsersAction()
    } as const,
    link: () => new XLinkAction(),
    move: () => new XMoveAction(),
    pause: () => new XPauseAction(),
    post: () => new XPostAction(),
    resume: () => new XResumeAction(),
    revoke: {
      super: () => new XRevokeSuperAction(),
      groups: () => new XRevokeGroupsAction(),
      databases: () => new XRevokeDatabasesAction()
    } as const,
    run: () => new XRunAction(),
    schema: () => new XSchemaAction(),
    select: () => new XSelectAction(),
    store: () => new XStoreAction(),
    tag: () => new XTagAction(),
    teams: () => new XTeamsAction(),
    trash: () => new XTrashAction(),
    unlink: () => new XUnlinkAction(),
    untag: () => new XUntagAction(),
    update: () => new XUpdateAction(),
    updateExpression: () => new XUpdateExpressionAction(),
    version: () => new XVersionAction(),
    view: {
      notifications: () => new XViewNotificationsAction(),
      tasks: () => new XViewTasksAction()
    } as const
  } as const
} as const
