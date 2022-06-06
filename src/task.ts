import type { XTaskEventInterface, XTaskFileInterface, XTaskInterface } from './parameter'

export interface XTaskFileInterfaceExt extends XTaskFileInterface {
  url: string
}

export interface XTaskInterfaceExt extends XTaskInterface {
  events?: XTaskEventInterface[]
  files?: XTaskFileInterfaceExt[]
}
