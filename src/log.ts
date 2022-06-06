import { XLogEditInterface, XLogInterface } from '.'

export interface XLogInterfaceExt extends XLogInterface {
  edits: XLogEditInterface[]
}
