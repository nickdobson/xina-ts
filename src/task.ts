import type { XTaskEventInterface, XTaskFileInterface, XTaskInterface } from './parameter'

export interface XTaskFile extends XTaskFileInterface {
  url: string
}

export interface XTask extends XTaskInterface {
  events?: XTaskEventInterface[]
  files?: XTaskFile[]
}
